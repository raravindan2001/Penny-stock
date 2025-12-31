
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, DiscoveryStock, PriceBucket } from "../types";

const API_KEY = process.env.API_KEY || "";

export const discoverStocks = async (bucket: PriceBucket): Promise<DiscoveryStock[]> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  let prompt = "";
  if (bucket === 'multibagger') {
    prompt = `SEARCH LIVE INDIAN MARKET DATA (NSE AND BSE). Identify exactly 20 penny/small-cap stocks from both exchanges that show "Multibagger" potential.
    Criteria: 
    1. High 5-year historical CAGR (above 20%).
    2. Future trajectory based on government contracts, EV, Green Energy, or Defense segments.
    3. Classification into segments (e.g., Renewable, Infra, Defense, IT, Pharma).
    4. Current price should be low (generally under Rs. 200).
    Provide: Symbol (ensure it's valid for the specified exchange), Name, LATEST Price, Exchange (NSE or BSE), Segment, Historical 5Y CAGR, and a Multibagger Score (1-100).`;
  } else {
    const priceLimit = bucket === 'under20' ? 20 : bucket === 'under50' ? 50 : 100;
    prompt = `SEARCH LIVE INDIAN MARKET DATA (NSE AND BSE). 
    Find 8-10 high-potential penny stocks currently trading on the NSE or BSE for less than Rs. ${priceLimit}. 
    Provide real-time price, symbol, exchange (NSE or BSE), name, sector, and 1-sentence potential.`;
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
          required: ["symbol", "name", "price", "sector", "exchange", "potential"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Discovery failed", e);
    return [];
  }
};

export const analyzeStock = async (symbol: string): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const currentYear = new Date().getFullYear();
  
  const prompt = `ACT AS A SENIOR QUANT ANALYST. Perform a DEEP-DIVE REAL-TIME analysis for Indian market ticker: "${symbol}". 
  The ticker could be from NSE (e.g., SUZLON) or BSE (e.g., 500325).
  1. Fetch the EXACT current price from the relevant Indian exchange.
  2. Multi-year growth trajectory: 5 Years Past, Current, and 5, 10, 15 Years Projections.
  3. Operating margins, revenue growth (QoQ), future deals, and segment categorization.
  Mark projections with 'isProjection: true'. Current year is ${currentYear}.`;

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

  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const sources = groundingChunks
    .filter((chunk: any) => chunk.web)
    .map((chunk: any) => ({
      title: chunk.web.title,
      uri: chunk.web.uri
    }));

  try {
    const data = JSON.parse(response.text);
    return { 
      ...data, 
      sources, 
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) 
    };
  } catch (e) {
    throw new Error(`Node for ${symbol} unresponsive. Ticker check failed.`);
  }
};
