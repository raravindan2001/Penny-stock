
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, DiscoveryStock, PriceBucket } from "../types";

const API_KEY = process.env.API_KEY || "";

export const discoverStocks = async (bucket: PriceBucket): Promise<DiscoveryStock[]> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const priceLimit = bucket === 'under20' ? 20 : bucket === 'under50' ? 50 : 100;
  
  const prompt = `Find 5 promising penny stocks currently trading on the National Stock Exchange (NSE) of India for less than Rs. ${priceLimit}. 
  Classify them by category (Sector). Provide their current approximate price and a brief 1-sentence growth potential.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
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
            potential: { type: Type.STRING }
          },
          required: ["symbol", "name", "price", "sector", "potential"]
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
  
  const prompt = `Deep-dive analysis for NSE stock: "${symbol}". 
  1. Multi-year growth (5, 10, 15 years).
  2. Operating margins for last 3 years.
  3. QoQ revenue growth.
  4. Future deals and investment opportunities.
  5. Category/Sector classification.
  Use live search for NSE India data specifically.`;

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
                label: { type: Type.STRING }
              },
              required: ["year", "price", "label"]
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
    return { ...data, sources };
  } catch (e) {
    throw new Error("NSE Analysis engine failed. Check ticker.");
  }
};
