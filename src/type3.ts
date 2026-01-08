export interface Coin {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
}

export interface CorrelationData {
  coin1: string;
  coin2: string;
  correlation: number;
}

export interface PricePoint {
  timestamp: number;
  price: number;
}

export interface ChartData {
  date: string;
  [key: string]: string | number;
}

export interface WatchlistPair {
  id: string;
  coin1: string;
  coin2: string;
  correlation: number;
  addedAt: number;
}

export type Theme = 'light' | 'dark';
