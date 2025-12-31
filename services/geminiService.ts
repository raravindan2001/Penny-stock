
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, DiscoveryStock, PriceBucket } from "../types";

/**
 * Service to discover penny stocks based on specific price buckets or growth potential.
 */
export const discoverStocks = async (bucket: PriceBucket): Promise<DiscoveryStock[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let prompt = "";
  if (bucket === 'multibagger') {
    prompt = `Identify exactly 15-20 penny/small-cap stocks on NSE/BSE with extreme growth potential.
    Target: Companies with a 5-year historical CAGR above 20% or high multibagger scores based on recent sector trends.
    Price Target: Generally under ₹200.
    Output data: Symbol, Name, LTP, Exchange, Segment, 5Y CAGR, and Growth Score.`;
  } else {
    const priceLimit = bucket === 'under20' ? 20 : bucket === 'under50' ? 50 : 100;
    prompt = `Find 10 high-volume penny stocks on NSE/BSE currently trading below ₹${priceLimit}. 
    Focus on sectors like EV, Green Energy, Infrastructure, and Defense.
    Return the stock symbol, company name, current price, exchange, and a short potential summary.`;
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            symbol: { type: Type.STRING },
            name: { type: Type.STRING },
            price: { type: Type.NUMBER },
            sector: { type: Type.STRING },
            exchange: { type: Type.STRING, enum: ['NSE', 'BSE'] },
            segment: { type: Type.STRING },
            potential: { type: Type.STRING },
            historicalCAGR: { type: Type.STRING },
            multibaggerScore: { type: Type.NUMBER }
          },
          required: ["symbol", "name", "price", "exchange", "potential"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Market discovery error:", e);
    return [];
  }
};

/**
 * Performs a deep-dive analysis of a specific ticker including 5, 10, and 15 year projections.
 */
export const analyzeStock = async (symbol: string): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const currentYear = new Date().getFullYear();
  
  const prompt = `Perform an exhaustive growth trajectory analysis for the Indian stock: "${symbol}".
  1. Verify the current market price on NSE or BSE.
  2. Analyze 5 years of historical data and provide accurate projections for 5, 10, and 15 years from now.
  3. Evaluate operating margins, revenue velocity, and future catalyst deals.
  4. Categorize based on specific growth sectors (e.g., EV Infra, Solar energy, Defense Tech).
  Current year is ${currentYear}. Projections must be marked 'isProjection: true'.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          verdict: { type: Type.STRING, enum: ['Bullish', 'Neutral', 'Bearish'] },
          sectorClassification: { type: Type.STRING },
          catalysts: { type: Type.ARRAY, items: { type: Type.STRING } },
          risks: { type: Type.ARRAY, items: { type: Type.STRING } },
          revenueGrowthQoQ: { type: Type.STRING },
          futureDeals: { type: Type.ARRAY, items: { type: Type.STRING } },
          investmentOpportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
          operatingMargins: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                year: { type: Type.STRING },
                value: { type: Type.NUMBER }
              },
              required: ["year", "value"]
            }
          },
          trajectory: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                year: { type: Type.NUMBER },
                price: { type: Type.NUMBER },
                label: { type: Type.STRING },
                isProjection: { type: Type.BOOLEAN }
              },
              required: ["year", "price", "label", "isProjection"]
            }
          }
        },
        required: ["summary", "verdict", "trajectory", "catalysts", "risks", "operatingMargins", "revenueGrowthQoQ", "futureDeals", "investmentOpportunities", "sectorClassification"]
      }
    }
  });

  // Extract real-world citations
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const sources = groundingChunks
    .filter((chunk: any) => chunk.web)
    .map((chunk: any) => ({
      title: chunk.web.title,
      uri: chunk.web.uri
    }));

  try {
    const data = JSON.parse(response.text || "{}");
    return { 
      ...data, 
      sources, 
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) 
    };
  } catch (e) {
    throw new Error(`Technical failure analyzing ${symbol}. Please verify the ticker and try again.`);
  }
};
