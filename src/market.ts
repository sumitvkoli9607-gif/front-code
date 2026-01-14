export interface Subscription {
  plan: 'Free' | 'Enterprise';
  subscriptionId?: string;
  startDate?: string;
  expiryDate?: string;
  active: boolean;
  paymentMethod?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  subscription: Subscription;
  availableBalance?: number;
  totalWithdrawn?: number;
  pendingWithdrawals?: number;
}

export interface MarketData {
  symbol: string;
  open: number;
  high: number;
  low: number;
  close: number;
  change: number;
  volume: number;
  category: string;
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
  dominance: 'bullish' | 'bearish' | 'neutral';
  strength: number;
  trend: string;
  confidence: number;
  priceChange: number;
  volume: number;
  timeframe: string;
}

export interface MarketPsychology {
  fear: number;
  greed: number;
  momentum: number;
  volatility: number;
  sentimentDominance: string;
  sentimentStrength: number;
  priceAcceleration: number;
}

export interface SupportResistanceLevel {
  price: number;
  strength: number;
  description: string;
  type: string;
  clusterSize?: number;
}

export interface SupportResistance {
  supports: SupportResistanceLevel[];
  resistances: SupportResistanceLevel[];
  currentLevel: string;
  breakoutDirection: string;
  breakoutProbability: number;
  recommendedAction: string;
  confidence: number;
  pivotPoint: number;
  recentHigh: number;
  recentLow: number;
}

export interface TradeSetup {
  signal: string;
  confidence: number;
  entryZones: number[];
  stopLoss: number;
  takeProfit: number;
  positionSize: string;
  rewardRiskRatio: number;
  reasons?: string[];
  probabilityFactors?: Record<string, unknown>;
}

export interface MarketOverview {
  symbol: string;
  currentPrice: number;
  priceChange24h: number;
  
  // Breakout detection
  breakouts?: {
    detected: boolean;
    breakouts: any[];
    count: number;
  };
  
  // RSI analysis
  rsi?: {
    value: number;
    analysis: any;
    signal: string;
  };
  
  tradeSetup: TradeSetup;
  
  keyLevels: {
    immediateSupport: number;
    immediateResistance: number;
    nextMajorSupport: number;
    nextMajorResistance: number;
    breakoutLevel: number;
    strongestSupport: number;
    strongestResistance: number;
  };
  
  momentum: {
    direction: string;
    strength: number;
    acceleration: string;
    rsi: number;
    divergence: any[];
  };
  
  riskMetrics: {
    volatility: string;
    atr: number;
    maxRiskPerTrade: string;
    rewardRiskRatio: number;
    winProbability: number;
  };
  
  volume: {
    status: string;
    relativeVolume: number;
    volumeSpike: boolean;
    volumeProfile: any[];
  };
  
  marketStructure: {
    trend: string;
    phase: string;
    bias: string;
    structure: any;
  };
  
  multiTimeframeAnalysis: any;
  timeframeAlignment: string;
  summary: string;
  timestamp: number;
  signalData: any;
  notificationTriggers?: any[];
}

export type Timeframe = '15m' | '30m' | '1h' | '3h' | '6h' | '12h' | '24h';

export const TIMEFRAMES: Timeframe[] = ['15m', '30m', '1h', '3h', '6h', '12h', '24h'];

export const PLAN_CURRENCIES = {
  Free: ['BTC/USDT', 'ETH/USDT', 'XRP/USDT', 'LTC/USDT', 'DOGE/USDT'],
  Enterprise: 'all' as const,
};

export const FREE_TIER_ACCESS = {
  timeframes: ['12h', '24h'] as Timeframe[],
  endpoints: ['rate', 'sentiment', 'psychology','support-resistance'] as string[],
};

export interface MarketSectionProps {
  user: User | null;
  onUserUpdate: (user: User) => void;
}

export interface MarketCardProps {
  market: MarketData;
  onClick: () => void;
}

export interface PsychologyIndicatorProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: 'red' | 'green' | 'blue' | 'purple';
}

export interface SupportResistanceCardProps {
  srData: SupportResistance;
  currentPrice: number;
  selectedAsset: MarketData;
}

export interface TraderOverviewProps {
  overview: MarketOverview | null;
  loading: boolean;
}