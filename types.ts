
export interface TrajectoryPoint {
  year: number;
  price: number;
  label: string;
  isProjection?: boolean;
}

export interface InstitutionalMetrics {
  peRatio: number;
  roic: number;
  deRatio: number;
  epsCAGR: number;
  roe: number;
  ebitMargin: number;
  grossMargin: number;
  revenueCAGR: number;
  fcfStatus: 'Positive & Growing' | 'Negative' | 'Stagnant';
  promoterHolding: number;
  pledgedPercentage: number;
  industryTailwinds: number; // 0-100 score
  competitiveMoat: number; // 0-100 score
  valuationSafety: number; // 0-100 score
  managementGovernance: number; // 0-100 score
}

export interface AnalysisResult {
  summary: string;
  verdict: 'Bullish' | 'Neutral' | 'Bearish';
  metrics: InstitutionalMetrics;
  trajectory: TrajectoryPoint[];
  catalysts: string[];
  risks: string[];
  sources: { title: string; uri: string }[];
  lastUpdated: string;
  sector: string;
}

export interface DiscoveryStock {
  symbol: string;
  name: string;
  price: number;
  exchange: 'NSE' | 'BSE';
  passCount: number; // How many of the 14 steps it passes
  segment: string; // e.g., EV, Green Energy, Defense
}

export interface User {
  email: string;
}

export type PriceBucket = 'under20' | 'under50' | 'under100' | 'multibagger';
