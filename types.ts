
export interface StockData {
  symbol: string;
  name: string;
  currentPrice: number;
  sector: string;
  description: string;
  marketCap: string;
  riskScore: number;
}

export interface TrajectoryPoint {
  year: number;
  price: number;
  label: string;
  isProjection?: boolean;
}

export interface FinancialMetric {
  year: string;
  value: number;
}

export interface DiscoveryStock {
  symbol: string;
  name: string;
  price: number;
  sector: string;
  potential: string;
  exchange: 'NSE' | 'BSE';
  segment?: string;
  historicalCAGR?: string;
  multibaggerScore?: number; // 1-100
}

export interface AnalysisResult {
  summary: string;
  trajectory: TrajectoryPoint[];
  catalysts: string[];
  risks: string[];
  verdict: 'Bullish' | 'Neutral' | 'Bearish';
  sources: { title: string; uri: string }[];
  operatingMargins: FinancialMetric[];
  revenueGrowthQoQ: string;
  futureDeals: string[];
  investmentOpportunities: string[];
  sectorClassification: string;
  lastUpdated: string;
}

export interface User {
  email: string;
  name?: string;
}

export type PriceBucket = 'under20' | 'under50' | 'under100' | 'multibagger';
