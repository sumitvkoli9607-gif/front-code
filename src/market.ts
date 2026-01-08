// src/types/market.types.ts
export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  volume: number;
  category: 'crypto' | 'forex' | 'stocks';
  description?: string;
  timestamp: number;
}

export interface CurrencyRate {
  symbol: string;
  rate: number;
  timeframe: string;
  timestamp: number;
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

export interface SupportResistanceLevel {
  price: number;
  strength: number;
  description: string;
  type: string;
}

export interface SupportResistance {
  supports: SupportResistanceLevel[];
  resistances: SupportResistanceLevel[];
  currentLevel: 'support' | 'resistance' | 'neutral';
  breakoutDirection: 'up' | 'down' | 'sideways';
  breakoutProbability: number;
  recommendedAction: 'buy' | 'sell' | 'hold' | 'wait';
  confidence: number;
  pivotPoint: number;
  recentHigh: number;
  recentLow: number;
}

export interface MarketOverview {
  signalData: any;
  multiTimeframeAnalysis: any;
  symbol: string;
  currentPrice: number;
  priceChange24h: number;
  
  // Essential Trading Information
  tradeSetup: {
    reasons: any;
    probabilityFactors: any;
    signal: 'BUY' | 'SELL' | 'BUY_BREAKOUT' | 'RANGE_BOUND' | 'HOLD';
    confidence: number;
    entryZones: number[];
    stopLoss: number;
    takeProfit: number;
    positionSize: string;
    rewardRiskRatio: number;
  };
  
  keyLevels: {
    strongestSupport: number;
    strongestResistance: number;
    immediateSupport: number;
    immediateResistance: number;
    nextMajorSupport: number;
    nextMajorResistance: number;
    breakoutLevel: number;
  };
  
  momentum: {
    divergence: boolean;
    direction: 'bullish' | 'bearish' | 'neutral';
    strength: number;
    acceleration: 'increasing' | 'decreasing' | 'stable' | 'volatile' | 'unstable_increase';
    rsi: number;
  };
  
  riskMetrics: {
    winProbability: number;
    volatility: 'low' | 'medium' | 'high';
    atr: number;
    maxRiskPerTrade: string;
    rewardRiskRatio: number;
  };
  
  volume: {
    volumeProfile: boolean;
    status: 'normal' | 'accumulation' | 'strong_accumulation' | 'distribution';
    relativeVolume: number;
    volumeSpike: boolean;
  };
  
  marketStructure: {
    structure: any;
    trend: 'uptrend' | 'downtrend' | 'sideways';
    phase: 'bullish_momentum' | 'bearish_momentum' | 'consolidation' | 'volatile' | 'neutral';
    bias: 'bullish' | 'bearish' | 'neutral';
  };
  
  priceAction: {
    pattern: string;
    candles: 'bullish' | 'bearish' | 'neutral';
    rejection: boolean;
  };
  
  timeframeAlignment: string;
  summary: string;
  timestamp: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  subscription?: {
    plan: string;
    active: boolean;
    startDate?: string;
    expiryDate?: string;
    subscriptionId?: string;
  };
}

export interface MarketSectionProps {
  user: User;
  onUserUpdate: (user: User) => void;
}

export const TIMEFRAMES =  ['15m', '30m', '1h', '3h', '6h', '12h', '24h'] as const;
export type Timeframe = typeof TIMEFRAMES[number];

export const PLAN_CURRENCIES = {
  Free: ['BTC/USDT', 'ETH/USDT', 'XRP/USDT', 'LTC/USDT', 'DOGE/USDT'],
  Enterprise: 'all'
};

export const FREE_TIER_ACCESS = {
  timeframes: ['12h', '24h'],
  endpoints: ['rate', 'sentiment', 'psychology', 'overview', 'support-resistance']
};