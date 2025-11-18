import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Search, TrendingUp, TrendingDown, LineChart, Newspaper, Brain, Sparkles, Target, Lightbulb, Clock, RefreshCw, Lock } from 'lucide-react';
import { SubscriptionModal } from './SubscriptionModal'; // Adjust import path as needed

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  volume: number;
  category: 'crypto' | 'forex' | 'stocks';
  description?: string;
  timestamp: number;
}

interface CurrencyRate {
  symbol: string;
  rate: number;
  timeframe: string;
  timestamp: number;
}

interface TradingStrategy {
  name: string;
  type: 'aggressive' | 'moderate' | 'conservative' | 'balanced';
  description: string;
  confidence: number;
  timeframe: 'short' | 'medium' | 'long' | '5-15 minutes' | '2-6 hours' | '6-12 hours';
  advice: string;
}

interface NewsItem {
  title: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  impact: 'high' | 'medium' | 'low';
  timestamp: string;
  source?: string;
  summary?: string;
}

interface MarketSentiment {
  bullish: number;
  bearish: number;
  neutral: number;
}

interface MarketPsychology {
  fear: number;
  greed: number;
  momentum: number;
  volatility: number;
}

interface MarketAnalysis {
  marketImpact: string;
  tradingOpportunities: string;
  keyRisks: string;
  sentimentAnalysis: string;
  psychologyAnalysis: string;
}

interface User {
  email: string;
  subscription: {
    plan: string | null;
    active: boolean;
  };
}

const API_BASE_URL = import.meta.env.VITE_API_URL;
const TIMEFRAMES = ['1h', '3h', '6h', '12h', '24h'] as const;
type Timeframe = typeof TIMEFRAMES[number];

// Define available currencies and access rules for each plan
const PLAN_CURRENCIES = {
  Free: ['BTC/USDT', 'ETH/USDT', 'XRP/USDT', 'LTC/USDT', 'DOGE/USDT'], // Free tier currencies
  Basic: ['BTC/USDT', 'ETH/USDT', 'XRP/USDT', 'LTC/USDT', 'BCH/USDT', 'ADA/USDT', 'DOT/USDT', 'LINK/USDT', 'BNB/USDT', 'DOGE/USDT'],
  Pro: ['BTC/USDT', 'ETH/USDT', 'XRP/USDT', 'LTC/USDT', 'BCH/USDT', 'ADA/USDT', 'DOT/USDT', 'LINK/USDT', 'BNB/USDT', 'DOGE/USDT', 'SOL/USDT', 'MATIC/USDT', 'AVAX/USDT', 'ATOM/USDT', 'UNI/USDT'],
  Enterprise: 'all' // All currencies
};

const FREE_TIER_ACCESS = {
  timeframes: ['12h', '24h'],
  endpoints: ['rate','news', 'sentiment', 'all-impact-news']
};

const PsychologyIndicator: React.FC<{
  label: string;
  value: number;
}> = ({ label, value }) => {
  return (
    <div className="flex flex-col items-start w-full mb-4">
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${value || 0}%` }}
        />
      </div>
      <div className="text-sm font-medium">{(value || 0).toFixed(1)}%</div>
    </div>
  );
};

const StrategyCard: React.FC<{
  strategy: TradingStrategy;
}> = ({ strategy }) => {
  return (
    <div
      className={`p-4 border-2 rounded-xl mb-4 transition-shadow hover:shadow-md ${
        strategy?.type === 'aggressive'
          ? 'border-red-100 hover:border-red-200'
          : strategy?.type === 'moderate'
          ? 'border-yellow-100 hover:border-yellow-200'
          : strategy?.type === 'balanced'
          ? 'border-blue-100 hover:border-blue-200'
          : 'border-green-100 hover:border-green-200'
      }`}
    >
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-semibold text-base text-gray-900">{strategy?.name || 'N/A'}</h4>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            strategy?.type === 'aggressive'
              ? 'bg-red-100 text-red-800'
              : strategy?.type === 'moderate'
              ? 'bg-yellow-100 text-yellow-800'
              : strategy?.type === 'balanced'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-green-100 text-green-800'
          }`}
        >
          {strategy?.type || 'N/A'}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-4 leading-relaxed">{strategy?.description || 'No description available'}</p>
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm">
          <Lightbulb size={16} className="text-blue-600 mr-2" />
          <span>
            <strong>Advice: </strong>
            {strategy?.advice || 'No advice available'}
          </span>
        </div>
        <div className="flex items-center text-sm">
          <Clock size={16} className="text-green-600 mr-2" />
          <span>
            <strong>Timeframe: </strong>
            {strategy?.timeframe || 'N/A'}
          </span>
        </div>
      </div>
      <div className="text-sm font-medium text-blue-600">
        {(strategy?.confidence || 0)}% confidence
      </div>
    </div>
  );
};

const NewsItemCard: React.FC<{
  news: NewsItem;
}> = ({ news }) => {
  return (
    <div className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-sm leading-tight flex-1 mr-4">{news?.title || 'No title'}</h4>
        <span
          className={`text-xs px-2 py-1 rounded-full transition-colors ${
            news?.sentiment === 'bullish'
              ? 'bg-green-100 text-green-800'
              : news?.sentiment === 'bearish'
              ? 'bg-red-100 text-red-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {news?.sentiment || 'neutral'}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-2 leading-relaxed">{news?.summary || 'No summary available'}</p>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{news?.source || 'Unknown'}</span>
        <span>
          {news?.timestamp
            ? new Date(news.timestamp).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'N/A'}
        </span>
      </div>
    </div>
  );
};

const MarketCard: React.FC<{
  market: MarketData;
  onClick: () => void;
}> = ({ market, onClick }) => {
  return (
    <div
      className="flex items-center justify-between p-6 rounded-xl transition-all cursor-pointer group border border-gray-100 hover:border-blue-200 hover:shadow-md hover:bg-gray-50"
      onClick={onClick}
    >
      <div className="flex-1">
        <div className="font-semibold text-lg text-gray-900 mb-1 flex items-center gap-2">
          <span>{market?.symbol || 'N/A'}</span>
        </div>
        <div className="text-sm text-gray-500 mb-2">
          {(market?.category?.toUpperCase() || 'N/A')} • Vol: {(market?.volume?.toLocaleString() || '0')}
        </div>
      </div>
      <div className="text-right">
        <div
          className={`text-base flex items-center justify-end font-medium ${
            market?.change >= 0 ? 'text-green-500' : 'text-red-500'
          }`}
        >
          {market?.change >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
          <span className="ml-1">
            {(market?.change ? Math.abs(market.change).toFixed(2) : '0.00')}%
          </span>
        </div>
      </div>
    </div>
  );
};

export const MarketSection: React.FC = () => {
  const [selectedAsset, setSelectedAsset] = useState<MarketData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [strategies, setStrategies] = useState<TradingStrategy[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [sentiment, setSentiment] = useState<MarketSentiment | null>(null);
  const [psychology, setPsychology] = useState<MarketPsychology | null>(null);
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null);
  const [currencyRate, setCurrencyRate] = useState<CurrencyRate | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('24h');
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState({
    markets: true,
    strategies: false,
    news: false,
    sentiment: false,
    psychology: false,
    analysis: false,
    currencyRate: false,
  });
  const [error, setError] = useState<{
    markets: string | null;
    assetData: string | null;
  }>({ markets: null, assetData: null });

  // Check if user is on free tier
  const isFreeTier = !user?.subscription?.plan || user?.subscription?.plan === 'Free' || !user?.subscription?.active;

  // Fetch user data on component mount
 useEffect(() => {
  const fetchUserData = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      const response = await axios.get(`${API_BASE_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    }
  };
  fetchUserData();
}, []);

  const fetchMarkets = useCallback(async (timeframe: Timeframe) => {
    try {
      setLoading((prev) => ({ ...prev, markets: true }));
      setError((prev) => ({ ...prev, markets: null }));

      const response = await axios.get(`${API_BASE_URL}/markets`, {
        params: { timeframe },
        timeout: 10000,
      });

      if (Array.isArray(response.data)) {
        setMarkets(response.data);
      } else {
        throw new Error('Invalid markets data format');
      }
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message || 'Failed to fetch markets'
        : 'An unexpected error occurred';
      setError((prev) => ({ ...prev, markets: message }));
      console.error('Market fetch error:', err);
    } finally {
      setLoading((prev) => ({ ...prev, markets: false }));
    }
  }, []);

  const fetchAssetData = useCallback(async (timeframe: Timeframe) => {
    if (!selectedAsset) return;

    try {
      setLoading({
        ...loading,
        strategies: true,
        news: true,
        sentiment: true,
        psychology: true,
        analysis: true,
        currencyRate: true,
      });
      setError((prev) => ({ ...prev, assetData: null }));

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token missing');
      }

      const symbol = selectedAsset.symbol?.trim() || '';
      const [base, quote] = symbol.split('/'); // Split symbol into base and quote

      // Define endpoints based on user access
      const endpoints = isFreeTier
        ? [
            `${API_BASE_URL}/markets/${base}/${quote}/news`,
            `${API_BASE_URL}/markets/${base}/${quote}/sentiment`,
          ]
        : [
            `${API_BASE_URL}/markets/${base}/${quote}/strategies`,
            `${API_BASE_URL}/markets/${base}/${quote}/news`,
            `${API_BASE_URL}/markets/${base}/${quote}/sentiment`,
            `${API_BASE_URL}/markets/${base}/${quote}/psychology`,
            `${API_BASE_URL}/markets/${base}/${quote}/analysis`,
            `${API_BASE_URL}/markets/${base}/${quote}/rate`,
          ];

      const responses = await Promise.all(
        endpoints.map((url, index) =>
          axios
            .get(url, {
              params: { timeframe },
              headers: { Authorization: `Bearer ${token}` },
              timeout: 10000,
            })
            .catch((err) => {
              console.error(`Failed to fetch ${url}:`, err);
              return { index, error: true, message: axios.isAxiosError(err) ? err.response?.data?.message : 'Request failed' };
            })
        )
      );

      const errors: string[] = [];
      responses.forEach((response, index) => {
        if ('error' in response) {
          errors.push(`Endpoint ${endpoints[index]}: ${response.message}`);
          return;
        }
        if (isFreeTier) {
          switch (index) {
            case 0:
              setNews(Array.isArray(response.data) ? response.data : []);
              break;
            case 1:
              setSentiment(response.data || null);
              break;
          }
        } else {
          switch (index) {
            case 0:
              setStrategies(Array.isArray(response.data) ? response.data : []);
              break;
            case 1:
              setNews(Array.isArray(response.data) ? response.data : []);
              break;
            case 2:
              setSentiment(response.data || null);
              break;
            case 3:
              setPsychology(response.data || null);
              break;
            case 4:
              setAnalysis(response.data || null);
              break;
            case 5:
              setCurrencyRate(response.data || null);
              break;
          }
        }
      });

      if (errors.length === endpoints.length) {
        throw new Error('All asset data endpoints failed');
      } else if (errors.length > 0) {
        console.warn('Some endpoints failed:', errors);
      }

      // Reset unavailable data for free tier
      if (isFreeTier) {
        setStrategies([]);
        setPsychology(null);
        setAnalysis(null);
        setCurrencyRate(null);
      }
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message || 'Failed to fetch asset data'
        : 'An unexpected error occurred';
      setError((prev) => ({ ...prev, assetData: message }));
      console.error('Asset data fetch error:', err);
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        setShowSubscriptionModal(true);
      }
    } finally {
      setLoading({
        ...loading,
        strategies: false,
        news: false,
        sentiment: false,
        psychology: false,
        analysis: false,
        currencyRate: false,
      });
    }
  }, [selectedAsset, isFreeTier]);

  useEffect(() => {
    fetchMarkets(selectedTimeframe);
  }, [fetchMarkets, selectedTimeframe]);

  useEffect(() => {
    if (selectedAsset && hasAccessToCurrency(selectedAsset.symbol)) {
      fetchAssetData(selectedTimeframe);
    } else {
      // Reset data when no access or no asset selected
      setCurrencyRate(null);
      setStrategies([]);
      setNews([]);
      setSentiment(null);
      setPsychology(null);
      setAnalysis(null);
    }
  }, [fetchAssetData, selectedAsset, selectedTimeframe]);


  const handleUpgradeClick = () => {
    setShowSubscriptionModal(true);
  };

  // Check if user has access to current timeframe based on subscription
  const hasAccessToTimeframe = (timeframe: Timeframe): boolean => {
    if (isFreeTier) {
      return FREE_TIER_ACCESS.timeframes.includes(timeframe);
    }
    if (!user?.subscription?.plan || !user?.subscription?.active) return false;

    const plan = user.subscription.plan;
    const timeframeHours = parseInt(timeframe.replace('h', ''));

    switch (plan) {
      case 'Basic':
        return timeframeHours >= 12; // 12h, 24h
      case 'Pro':
        return timeframeHours >= 6; // 6h, 12h, 24h
      case 'Enterprise':
        return true; // All timeframes
      default:
        return false;
    }
  };

  // Check if user has access to a specific currency
  const hasAccessToCurrency = (currencySymbol: string): boolean => {
    if (isFreeTier) {
      return PLAN_CURRENCIES.Free.includes(currencySymbol);
    }
    if (!user?.subscription?.plan || !user?.subscription?.active) return false;

    const plan = user.subscription.plan;

    if (plan === 'Enterprise') return true;

    const allowedCurrencies = PLAN_CURRENCIES[plan as keyof typeof PLAN_CURRENCIES];
    return Array.isArray(allowedCurrencies) && allowedCurrencies.includes(currencySymbol);
  };

  // Check if user has access to a specific endpoint
  const hasAccessToEndpoint = (endpoint: string): boolean => {
    if (isFreeTier) {
      return FREE_TIER_ACCESS.endpoints.includes(endpoint);
    }
    return true; // Paid users have access to all endpoints
  };

  const filteredMarkets = markets.filter((market) =>
    market?.symbol?.toLowerCase()?.includes(searchTerm.toLowerCase()) || false
  );

  if (error.markets && !selectedAsset) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-600 mb-4">{error.markets}</p>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          onClick={() => fetchMarkets(selectedTimeframe)}
        >
          Retry
        </button>
      </div>
    );
  }

  if (loading.markets && !selectedAsset && markets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4" />
        <p className="text-gray-600">Loading markets...</p>
      </div>
    );
  }


  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      {/* Subscription Modal */}
     {showSubscriptionModal && (
      <SubscriptionModal
        onClose={() => setShowSubscriptionModal(false)}
        user={user}
         />
        )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Market Intelligence Platform</h1>
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              {user.email} • {user.subscription?.plan || 'Free Tier'}
            </span>
            {isFreeTier && (
              <button
                onClick={handleUpgradeClick}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl text-base font-medium"
              >
                Upgrade Plan
              </button>
            )}
          </div>
        )}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search markets..."
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-base"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex gap-2 mb-6">
        {TIMEFRAMES.map((timeframe) => {
          const hasAccess = hasAccessToTimeframe(timeframe);
          return (
            <button
              key={timeframe}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                selectedTimeframe === timeframe
                  ? 'bg-blue-600 text-white shadow-md'
                  : hasAccess
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
              onClick={() => hasAccess && setSelectedTimeframe(timeframe)}
              disabled={!hasAccess}
            >
              {timeframe}
              {!hasAccess && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
          );
        })}
      </div>

      {isFreeTier && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Lock size={24} className="text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Free Tier Access</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Access news and sentiment for BTC, ETH, XRP, LTC, and DOGE on 12h and 24h timeframes. Upgrade for full access to all assets, timeframes, and advanced analytics.
          </p>
          {/* <button
            onClick={handleUpgradeClick}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl text-base font-medium"
          >
            Upgrade Plan
          </button> */}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        {!selectedAsset ? (
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Markets ({selectedTimeframe})</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredMarkets.length > 0 ? (
                filteredMarkets.map((market) => (
                  <MarketCard
                    key={market?.symbol || Math.random().toString()}
                    market={market}
                    onClick={() => setSelectedAsset(market)}
                  />
                ))
              ) : (
                <p className="text-center text-gray-600 py-8 col-span-full">No markets available</p>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSelectedAsset(null)}
                className="text-blue-600 hover:text-blue-700 transition-colors text-base font-medium"
              >
                ← Back to Markets
              </button>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => fetchAssetData(selectedTimeframe)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl text-base font-medium disabled:opacity-50"
                  disabled={Object.values(loading).some(Boolean) || !hasAccessToCurrency(selectedAsset.symbol)}
                >
                  <RefreshCw size={20} />
                  Refresh
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-4xl font-bold mb-4 text-gray-900">
                {(selectedAsset?.symbol || 'N/A')} ({selectedTimeframe})
              </h2>
              <div className="bg-gray-100 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Timeframe-Based Price</h4>
                {isFreeTier ? (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <Lock size={20} className="text-blue-600" />
                      <h4 className="text-sm font-semibold text-gray-900">Price Data Locked</h4>
                    </div>
                    <p className="text-sm text-gray-600">Upgrade to view timeframe-based price data.</p>
                  </div>
                ) : loading.currencyRate ? (
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                  </div>
                ) : currencyRate && hasAccessToCurrency(selectedAsset.symbol) ? (
                  <p className="text-lg text-gray-700">
                    Average Price ({selectedTimeframe}): $
                    {currencyRate.rate.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                ) : (
                  <p className="text-gray-600">No timeframe-based price available</p>
                )}
              </div>
            </div>

            {!hasAccessToCurrency(selectedAsset.symbol) ? (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Lock size={24} className="text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Upgrade to Access This Currency</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  This currency is not available in your current plan. Upgrade to view detailed analytics and insights.
                </p>
                <button
                  onClick={handleUpgradeClick}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl text-base font-medium"
                >
                  Upgrade Plan
                </button>
              </div>
            ) : error.assetData ? (
              <div className="bg-red-100 p-6 rounded-xl text-center">
                <p className="text-red-800 mb-4">{error.assetData}</p>
                <button
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                  onClick={() => fetchAssetData(selectedTimeframe)}
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                  <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-lg">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <LineChart size={24} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">Market Sentiment</h3>
                        <p className="text-gray-500">Real-time market mood analysis</p>
                      </div>
                    </div>

                    {loading.sentiment ? (
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                      </div>
                    ) : hasAccessToEndpoint('sentiment') && sentiment ? (
                      <div className="space-y-8">
                        <div className="grid grid-cols-3 gap-8">
                          <div className="text-center">
                            <div className="relative w-24 h-24 mx-auto mb-4">
                              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="40"
                                  stroke="currentColor"
                                  strokeWidth="8"
                                  fill="transparent"
                                  className="text-gray-200"
                                />
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="40"
                                  stroke="currentColor"
                                  strokeWidth="8"
                                  fill="transparent"
                                  strokeDasharray={`${2 * Math.PI * 40}`}
                                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - (sentiment.bullish || 0) / 100)}`}
                                  className="text-green-500 transition-all duration-1000 ease-out"
                                  strokeLinecap="round"
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                  <div className="text-xl font-bold text-green-600">{sentiment.bullish || 0}%</div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                              <TrendingUp size={18} className="text-green-500" />
                              <span className="font-semibold text-gray-900">Bullish</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">Positive outlook</p>
                          </div>

                          <div className="text-center">
                            <div className="relative w-24 h-24 mx-auto mb-4">
                              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="40"
                                  stroke="currentColor"
                                  strokeWidth="8"
                                  fill="transparent"
                                  className="text-gray-200"
                                />
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="40"
                                  stroke="currentColor"
                                  strokeWidth="8"
                                  fill="transparent"
                                  strokeDasharray={`${2 * Math.PI * 40}`}
                                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - (sentiment.bearish || 0) / 100)}`}
                                  className="text-red-500 transition-all duration-1000 ease-out"
                                  strokeLinecap="round"
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                  <div className="text-xl font-bold text-red-600">{sentiment.bearish || 0}%</div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                              <TrendingDown size={18} className="text-red-500" />
                              <span className="font-semibold text-gray-900">Bearish</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">Negative outlook</p>
                          </div>

                          <div className="text-center">
                            <div className="relative w-24 h-24 mx-auto mb-4">
                              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="40"
                                  stroke="currentColor"
                                  strokeWidth="8"
                                  fill="transparent"
                                  className="text-gray-200"
                                />
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="40"
                                  stroke="currentColor"
                                  strokeWidth="8"
                                  fill="transparent"
                                  strokeDasharray={`${2 * Math.PI * 40}`}
                                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - (sentiment.neutral || 0) / 100)}`}
                                  className="text-blue-500 transition-all duration-1000 ease-out"
                                  strokeLinecap="round"
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                  <div className="text-xl font-bold text-blue-600">{sentiment.neutral || 0}%</div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                              <LineChart size={18} className="text-blue-500" />
                              <span className="font-semibold text-gray-900">Neutral</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">Balanced view</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-sm font-medium text-gray-700">
                            <span>Market Mood</span>
                            <span>
                              Overall: {sentiment.bullish > sentiment.bearish ? 'Bullish' : sentiment.bearish > sentiment.bullish ? 'Bearish' : 'Neutral'}
                            </span>
                          </div>
                          <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-1000 ease-out"
                              style={{ width: `${sentiment.bullish || 0}%` }}
                            />
                            <div
                              className="absolute top-0 h-full bg-gradient-to-r from-red-400 to-red-500 transition-all duration-1000 ease-out"
                              style={{
                                left: `${sentiment.bullish || 0}%`,
                                width: `${sentiment.bearish || 0}%`,
                              }}
                            />
                            <div
                              className="absolute top-0 h-full bg-gradient-to-r from-blue-400 to-blue-500 transition-all duration-1000 ease-out"
                              style={{
                                left: `${(sentiment.bullish || 0) + (sentiment.bearish || 0)}%`,
                                width: `${sentiment.neutral || 0}%`,
                              }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Bearish</span>
                            <span>Neutral</span>
                            <span>Bullish</span>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                              <Sparkles size={16} className="text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">Sentiment Analysis</h4>
                              <p className="text-sm text-gray-600 leading-relaxed">
                                {sentiment.bullish > 50
                                  ? 'Strong bullish sentiment dominates the market with positive momentum building across major assets. Institutional confidence appears high.'
                                  : sentiment.bearish > 40
                                  ? 'Bearish sentiment is prevalent with increased caution among traders. Risk-off behavior is evident in current market conditions.'
                                  : 'Market sentiment remains balanced with mixed signals from different asset classes. Traders are adopting a wait-and-see approach.'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 text-center">
                        <div className="flex items-center justify-center gap-3 mb-2">
                          <Lock size={20} className="text-blue-600" />
                          <h4 className="text-sm font-semibold text-gray-900">Sentiment Data Locked</h4>
                        </div>
                        <p className="text-sm text-gray-600">Upgrade to view market sentiment data.</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-xl p-8 border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                      <Brain size={28} className="text-blue-600" />
                      <h3 className="text-xl font-semibold">Market Psychology ({selectedTimeframe})</h3>
                    </div>
                    {hasAccessToEndpoint('psychology') ? (
                      loading.psychology ? (
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                        </div>
                      ) : psychology ? (
                        <div className="grid grid-cols-2 gap-4">
                          <PsychologyIndicator label="Fear" value={psychology.fear || 0} />
                          <PsychologyIndicator label="Greed" value={psychology.greed || 0} />
                          <PsychologyIndicator label="Momentum" value={psychology.momentum || 0} />
                          <PsychologyIndicator label="Volatility" value={psychology.volatility || 0} />
                        </div>
                      ) : (
                        <p className="text-center text-gray-600 py-4">No psychology data available</p>
                      )
                    ) : (
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 text-center">
                        <div className="flex items-center justify-center gap-3 mb-2">
                          <Lock size={20} className="text-blue-600" />
                          <h4 className="text-sm font-semibold text-gray-900">Psychology Data Locked</h4>
                        </div>
                        <p className="text-sm text-gray-600">Upgrade to view market psychology data.</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-xl p-8 border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                      <Target size={28} className="text-blue-600" />
                      <h3 className="text-xl font-semibold">AI Trading Strategies ({selectedTimeframe})</h3>
                    </div>
                    {hasAccessToEndpoint('strategies') ? (
                      loading.strategies ? (
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                        </div>
                      ) : strategies.length > 0 ? (
                        strategies.map((strategy, index) => (
                          <StrategyCard key={index} strategy={strategy} />
                        ))
                      ) : (
                        <p className="text-center text-gray-600 py-4">No strategies available</p>
                      )
                    ) : (
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 text-center">
                        <div className="flex items-center justify-center gap-3 mb-2">
                          <Lock size={20} className="text-blue-600" />
                          <h4 className="text-sm font-semibold text-gray-900">Trading Strategies Locked</h4>
                        </div>
                        <p className="text-sm text-gray-600">Upgrade to view AI trading strategies.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="bg-white rounded-xl p-8 border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                      <Newspaper size={28} className="text-blue-600" />
                      <h3 className="text-xl font-semibold">Latest News ({selectedTimeframe})</h3>
                    </div>
                    {loading.news ? (
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                      </div>
                    ) : hasAccessToEndpoint('news') && news.length > 0 ? (
                      <div className="space-y-6 max-h-[500px] overflow-y-auto pr-4">
                        {news.map((newsItem, index) => (
                          <NewsItemCard key={index} news={newsItem} />
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 text-center">
                        <div className="flex items-center justify-center gap-3 mb-2">
                          <Lock size={20} className="text-blue-600" />
                          <h4 className="text-sm font-semibold text-gray-900">News Data Locked</h4>
                        </div>
                        <p className="text-sm text-gray-600">Upgrade to view latest news.</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-xl p-8 border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                      <Sparkles size={28} className="text-blue-600" />
                      <h3 className="text-xl font-semibold">AI Market Analysis ({selectedTimeframe})</h3>
                    </div>
                    {hasAccessToEndpoint('analysis') ? (
                      loading.analysis ? (
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                        </div>
                      ) : analysis ? (
                        <div className="space-y-6">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2 text-base">Market Impact</h4>
                            <p className="text-base text-gray-600 leading-relaxed">
                              {analysis.marketImpact || 'No analysis available'}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2 text-base">Trading Opportunities</h4>
                            <p className="text-base text-gray-600 leading-relaxed">
                              {analysis.tradingOpportunities || 'No opportunities available'}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2 text-base">Key Risks</h4>
                            <p className="text-base text-gray-600 leading-relaxed">
                              {analysis.keyRisks || 'No risks identified'}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2 text-base">Sentiment Analysis</h4>
                            <p className="text-base text-gray-600 leading-relaxed">
                              {analysis.sentimentAnalysis || 'No sentiment analysis available'}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2 text-base">Psychology Analysis</h4>
                            <p className="text-base text-gray-600 leading-relaxed">
                              {analysis.psychologyAnalysis || 'No psychology analysis available'}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-center text-gray-600 py-4">No analysis available</p>
                      )
                    ) : (
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 text-center">
                        <div className="flex items-center justify-center gap-3 mb-2">
                          <Lock size={20} className="text-blue-600" />
                          <h4 className="text-sm font-semibold text-gray-900">Market Analysis Locked</h4>
                        </div>
                        <p className="text-sm text-gray-600">Upgrade to view AI market analysis.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};