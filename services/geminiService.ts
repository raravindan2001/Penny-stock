
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, DiscoveryStock, PriceBucket } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const discoverStocks = async (bucket: PriceBucket): Promise<DiscoveryStock[]> => {
  const ai = getAI();
  // Prompting for 25 stocks to ensure a robust "Top 20+" list across diverse segments
  const prompt = `Act as an institutional micro-cap specialist. Find 25 high-potential Indian stocks (NSE/BSE) trading ${bucket === 'multibagger' ? 'with massive growth potential' : 'under ' + bucket.replace('under', '₹')}. 
  
  DISTRIBUTION: Ensure a balanced mix across segments: EV, Defense, Green Energy, Tech, Infra, and Specialty Chemicals.
  
  Evaluate each ticker against the "Alpha 14-Point Scan":
  1. P/E < 20, 2. ROIC > 15%, 3. D/E < 1, 4. EPS 5Y CAGR > 10%, 5. ROE > 15%, 6. EBIT > 10%, 7. Gross Margin > 40%.
  8. Revenue CAGR > 15%, 9. FCF Positive & Growing, 10. Promoter Holding > 50%, 11. Pledged < 10%.
  12. Industry Tailwinds, 13. Competitive Moat, 14. Reasonable Valuation.
  
  Group results into segments. Return JSON with 'passCount' (integer 0-14) and 'segment'.`;

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
            passCount: { type: Type.INTEGER },
            segment: { type: Type.STRING }
          },
          required: ["symbol", "name", "price", "exchange", "passCount", "segment"]
        }
      }
    }
  });

  return JSON.parse(response.text || "[]");
};

export const analyzeStock = async (symbol: string): Promise<AnalysisResult> => {
  const ai = getAI();
  
  const prompt = `Perform a deep institutional audit for the Indian ticker: "${symbol}".
  
  MANDATORY CHECKLIST (ALPHA 14-POINT SCAN):
  - Quantitative: P/E, ROIC, D/E, EPS CAGR, ROE, EBIT Margin, Gross Margin, Revenue CAGR, Promoter Holding %, Pledged %.
  - Cash Flow: FCF Status (Positive & Growing or otherwise).
  - Qualitative (Score 0-100): Industry Tailwinds, Competitive Moat, Valuation Safety, Management Governance.
  
  TRAJECTORY: Provide precise price targets for:
  1. Current (Last Traded Price)
  2. 5-Year Projection
  3. 10-Year Projection
  4. 15-Year Projection
  
  Use search grounding for Q3/Q4 FY24 data and forward-looking guidance. Return strictly JSON.`;

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
              grossMargin: { type: Type.NUMBER },
              revenueCAGR: { type: Type.NUMBER },
              fcfStatus: { type: Type.STRING, enum: ['Positive & Growing', 'Negative', 'Stagnant'] },
              promoterHolding: { type: Type.NUMBER },
              pledgedPercentage: { type: Type.NUMBER },
              industryTailwinds: { type: Type.NUMBER },
              competitiveMoat: { type: Type.NUMBER },
              valuationSafety: { type: Type.NUMBER },
              managementGovernance: { type: Type.NUMBER }
            },
            required: ["peRatio", "roic", "deRatio", "epsCAGR", "roe", "ebitMargin", "grossMargin", "revenueCAGR", "fcfStatus", "promoterHolding", "pledgedPercentage", "industryTailwinds", "competitiveMoat", "valuationSafety", "managementGovernance"]
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
