
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
}

export interface User {
  phone: string;
  name?: string;
}

export type PriceBucket = 'under20' | 'under50' | 'under100';
