export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  volume: number;
  category: 'crypto' | 'forex' | 'stocks' | 'commodities';
  premium: boolean;
  marketCap?: number;
  high24h?: number;
  low24h?: number;
}

export interface NewsItem {
  title: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  impact: 'high' | 'medium' | 'low';
  timestamp: string;
  source: string;
  summary: string;
  url?: string;
}

export interface MarketSentiment {
  bullish: number;
  bearish: number;
  neutral: number;
}

export interface MarketPsychology {
  fear: number;
  greed: number;
  momentum: number;
  volatility: number;
}

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  typing?: boolean;
}

export interface SubscriptionPlan {
  name: string;
  price: number;
  features: string[];
  popular?: boolean;
  annual?: boolean;
}

export interface Portfolio {
  totalValue: number;
  dayChange: number;
  dayChangePercent: number;
  positions: Position[];
}

export interface Position {
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  totalValue: number;
  pnl: number;
  pnlPercent: number;
}

export interface WatchlistItem {
  symbol: string;
  price: number;
  change: number;
  alerts: Alert[];
}

export interface Alert {
  id: string;
  type: 'price' | 'change' | 'volume';
  condition: 'above' | 'below';
  value: number;
  active: boolean;
}


