
export interface TrajectoryPoint {
  year: number;
  price: number;
  label: string;
  isProjection?: boolean;
}

export interface SevenStepMetrics {
  peRatio: number;
  roic: number;
  deRatio: number;
  epsCAGR: number;
  roe: number;
  ebitMargin: number;
  grossMargin: number;
}

export interface AnalysisResult {
  summary: string;
  verdict: 'Bullish' | 'Neutral' | 'Bearish';
  metrics: SevenStepMetrics;
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
  passCount: number; // How many of the 7 steps it passes
}

export interface User {
  email: string;
}

export type PriceBucket = 'under20' | 'under50' | 'under100' | 'multibagger';
