
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, DiscoveryStock, PriceBucket } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const discoverStocks = async (bucket: PriceBucket): Promise<DiscoveryStock[]> => {
  const ai = getAI();
  const prompt = `Act as an institutional research analyst. Find 10 high-potential Indian stocks (NSE/BSE) trading ${bucket === 'multibagger' ? 'with massive growth potential' : 'under ' + bucket.replace('under', '₹')}. 
  Evaluate each ticker strictly against these 7 Identify Stocks 7 Step criteria:
  1. P/E Ratio < 20
  2. ROIC > 15%
  3. Debt-to-Equity < 1
  4. EPS 5Y CAGR > 10%
  5. ROE > 15%
  6. EBIT Margin > 10%
  7. Gross Margin > 40%
  
  Return JSON data including the 'passCount' (integer 0-7) indicating how many steps were satisfied.`;

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
            exchange: { type: Type.STRING, enum: ['NSE', 'BSE'] },
            passCount: { type: Type.INTEGER }
          },
          required: ["symbol", "name", "price", "exchange", "passCount"]
        }
      }
    }
  });

  return JSON.parse(response.text || "[]");
};

export const analyzeStock = async (symbol: string): Promise<AnalysisResult> => {
  const ai = getAI();
  
  const prompt = `Perform a deep institutional analysis for the Indian stock ticker: "${symbol}".
  
  SECTION 1: Identify Stocks 7 Step Validation. Provide precise values for:
  - P/E Ratio
  - ROIC (%)
  - Debt-to-Equity Ratio
  - EPS 5Y CAGR (%)
  - ROE (%)
  - EBIT Margin (%)
  - Gross Margin (%)
  
  SECTION 2: Growth Trajectory Mapping.
  Provide expected price targets for:
  - Current (Real-time value)
  - 5 Years
  - 10 Years
  - 15 Years
  
  Use search grounding for the most recent quarterly filings and annual reports. Return in JSON.`;

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
          sector: { type: Type.STRING },
          metrics: {
            type: Type.OBJECT,
            properties: {
              peRatio: { type: Type.NUMBER },
              roic: { type: Type.NUMBER },
              deRatio: { type: Type.NUMBER },
              epsCAGR: { type: Type.NUMBER },
              roe: { type: Type.NUMBER },
              ebitMargin: { type: Type.NUMBER },
              grossMargin: { type: Type.NUMBER }
            },
            required: ["peRatio", "roic", "deRatio", "epsCAGR", "roe", "ebitMargin", "grossMargin"]
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
          },
          catalysts: { type: Type.ARRAY, items: { type: Type.STRING } },
          risks: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["summary", "verdict", "metrics", "trajectory", "catalysts", "risks", "sector"]
      }
    }
  });

  const sources = (response.candidates?.[0]?.groundingMetadata?.groundingChunks || [])
    .filter((c: any) => c.web)
    .map((c: any) => ({ title: c.web.title, uri: c.web.uri }));

  const data = JSON.parse(response.text || "{}");
  return {
    ...data,
    sources,
    lastUpdated: new Date().toLocaleTimeString()
  };
};
