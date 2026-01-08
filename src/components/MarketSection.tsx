// src/components/MarketSection.tsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Search,
  TrendingUp,
  TrendingDown,
  LineChart,
  Brain,
  Sparkles,
  RefreshCw,
  Lock,
  BarChart3,
  Layers,
  TrendingUp as TrendingUpIcon,
  AlertCircle,
  Activity,
  Zap,
  Gauge,
  Scale,
  Loader2,
  AlertTriangle,
  ChevronLeft
} from 'lucide-react';
import { SubscriptionModal } from './SubscriptionModal';
import { TraderOverview } from './TraderOverview';
import { SupportResistanceCard } from './SupportResistanceCard';
import { MarketCard } from './MarketCard';
import { PsychologyIndicator } from './PsychologyIndicator';

// Import interfaces from types file
import {
  MarketData,
  CurrencyRate,
  MarketSentiment,
  MarketPsychology,
  SupportResistance,
  MarketOverview,
  MarketSectionProps,
  Timeframe,
  TIMEFRAMES,
  PLAN_CURRENCIES,
  FREE_TIER_ACCESS,
} from '../market';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const MarketSection: React.FC<MarketSectionProps> = ({ user, onUserUpdate }) => {
  const [selectedAsset, setSelectedAsset] = useState<MarketData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [sentiment, setSentiment] = useState<MarketSentiment | null>(null);
  const [psychology, setPsychology] = useState<MarketPsychology | null>(null);
  const [currencyRate, setCurrencyRate] = useState<CurrencyRate | null>(null);
  const [supportResistance, setSupportResistance] = useState<SupportResistance | null>(null);
  const [overview, setOverview] = useState<MarketOverview | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('24h');
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showOverview, setShowOverview] = useState(false);
  
  // Consolidated loading state
  const [loading, setLoading] = useState<{
    markets: boolean;
    sentiment: boolean;
    psychology: boolean;
    currencyRate: boolean;
    supportResistance: boolean;
    overview: boolean;
    assetData: boolean;
  }>({
    markets: true,
    sentiment: false,
    psychology: false,
    currencyRate: false,
    supportResistance: false,
    overview: false,
    assetData: false,
  });
  
  const [error, setError] = useState<{
    markets: string | null;
    assetData: string | null;
    overview: string | null;
  }>({ markets: null, assetData: null, overview: null });

  const isPremium = user?.subscription?.active && user.subscription.plan !== 'Free';
  const isFreeTier = !isPremium;

  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await axios.get(`${API_BASE_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onUserUpdate(res.data);
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  const fetchMarkets = useCallback(async (timeframe: Timeframe) => {
    try {
      setLoading(prev => ({ ...prev, markets: true }));
      setError(prev => ({ ...prev, markets: null }));

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
        ? err.response?.data?.error || err.message || 'Failed to fetch markets'
        : 'An unexpected error occurred';
      setError(prev => ({ ...prev, markets: message }));
      console.error('Market fetch error:', err);
    } finally {
      setLoading(prev => ({ ...prev, markets: false }));
    }
  }, []);

  const fetchAssetData = useCallback(async (timeframe: Timeframe) => {
    if (!selectedAsset) return;

    try {
      // Set initial loading state for all asset data
      setLoading(prev => ({
        ...prev,
        assetData: true,
        sentiment: true,
        psychology: true,
        currencyRate: true,
        supportResistance: true
      }));
      
      setError(prev => ({ ...prev, assetData: null }));

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token missing');
      }

      const symbol = selectedAsset.symbol?.trim() || '';
      const [base, quote] = symbol.split('/');

      if (!base || !quote) {
        throw new Error('Invalid symbol format');
      }

      // Track individual loading states
      const promises = [];

      // Fetch sentiment
      promises.push(
        (async () => {
          try {
            const response = await axios.get(`${API_BASE_URL}/markets/${base}/${quote}/sentiment`, {
              params: { timeframe },
              headers: { Authorization: `Bearer ${token}` },
              timeout: 10000,
            });
            setSentiment(response.data);
          } catch (err) {
            console.error('Failed to fetch sentiment:', err);
          } finally {
            setLoading(prev => ({ ...prev, sentiment: false }));
          }
        })()
      );

      // Fetch psychology (only for premium)
      if (isPremium) {
        promises.push(
          (async () => {
            try {
              const response = await axios.get(`${API_BASE_URL}/markets/${base}/${quote}/psychology`, {
                params: { timeframe },
                headers: { Authorization: `Bearer ${token}` },
                timeout: 10000,
              });
              setPsychology(response.data);
            } catch (err) {
              console.error('Failed to fetch psychology:', err);
            } finally {
              setLoading(prev => ({ ...prev, psychology: false }));
            }
          })()
        );
      } else {
        setLoading(prev => ({ ...prev, psychology: false }));
      }

      // Fetch rate
      promises.push(
        (async () => {
          try {
            const response = await axios.get(`${API_BASE_URL}/markets/${base}/${quote}/rate`, {
              params: { timeframe },
              headers: { Authorization: `Bearer ${token}` },
              timeout: 10000,
            });
            setCurrencyRate(response.data);
          } catch (err) {
            console.error('Failed to fetch rate:', err);
          } finally {
            setLoading(prev => ({ ...prev, currencyRate: false }));
          }
        })()
      );

      // Fetch support-resistance
      promises.push(
        (async () => {
          try {
            const response = await axios.get(`${API_BASE_URL}/markets/${base}/${quote}/support-resistance`, {
              params: { timeframe },
              headers: { Authorization: `Bearer ${token}` },
              timeout: 10000,
            });
            setSupportResistance(response.data);
          } catch (err) {
            console.error('Failed to fetch support-resistance:', err);
          } finally {
            setLoading(prev => ({ ...prev, supportResistance: false }));
          }
        })()
      );

      await Promise.all(promises);

    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || err.message || 'Failed to fetch asset data'
        : 'An unexpected error occurred';
      setError(prev => ({ ...prev, assetData: message }));
      console.error('Asset data fetch error:', err);
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        setShowSubscriptionModal(true);
      }
    } finally {
      setLoading(prev => ({ ...prev, assetData: false }));
    }
  }, [selectedAsset, isPremium]);

  const fetchMarketOverview = useCallback(async () => {
    if (!selectedAsset) return;

    try {
      setLoading(prev => ({ ...prev, overview: true }));
      setError(prev => ({ ...prev, overview: null }));

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token missing');
      }

      const symbol = selectedAsset.symbol?.trim() || '';
      const [base, quote] = symbol.split('/');

      if (!base || !quote) {
        throw new Error('Invalid symbol format');
      }

      const response = await axios.get(
        `${API_BASE_URL}/markets/${base}/${quote}/overview`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 15000,
        }
      );

      setOverview(response.data);
      setShowOverview(true);
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || err.message || 'Failed to fetch market overview'
        : 'An unexpected error occurred';
      setError(prev => ({ ...prev, overview: message }));
      console.error('Market overview fetch error:', err);
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        setShowSubscriptionModal(true);
      }
    } finally {
      setLoading(prev => ({ ...prev, overview: false }));
    }
  }, [selectedAsset]);

  useEffect(() => {
    fetchMarkets(selectedTimeframe);
  }, [fetchMarkets, selectedTimeframe]);

  useEffect(() => {
    if (selectedAsset && hasAccessToCurrency(selectedAsset.symbol) && !showOverview) {
      fetchAssetData(selectedTimeframe);
    } else {
      // Reset data when switching to overview or losing access
      if (showOverview || !hasAccessToCurrency(selectedAsset?.symbol || '')) {
        setCurrencyRate(null);
        setSentiment(null);
        setPsychology(null);
        setSupportResistance(null);
      }
    }
  }, [fetchAssetData, selectedAsset, selectedTimeframe, showOverview]);

  const handleUpgradeClick = () => {
    setShowSubscriptionModal(true);
  };

  const hasAccessToTimeframe = (tf: Timeframe): boolean =>
    isFreeTier ? FREE_TIER_ACCESS.timeframes.includes(tf) : true;

  const hasAccessToCurrency = (symbol: string): boolean => {
    if (!symbol) return false;
    return isFreeTier
      ? PLAN_CURRENCIES.Free.includes(symbol)
      : true;
  };

  const filteredMarkets = markets.filter((market) =>
    market?.symbol?.toLowerCase()?.includes(searchTerm.toLowerCase()) || false
  );

  // Improved loading skeleton
  const renderLoadingSkeleton = (type: string) => (
    <div className="animate-pulse space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
        <div>
          <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
      {type === 'sentiment' && (
        <>
          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full"></div>
                <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
              </div>
            ))}
          </div>
          <div className="bg-gray-100 rounded-xl p-6">
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </>
      )}
      {type === 'psychology' && (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-12"></div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2"></div>
            </div>
          ))}
        </div>
      )}
      {type === 'support' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-100 rounded-lg p-4">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
          <div className="bg-gray-100 rounded-xl p-4">
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      )}
    </div>
  );

  // Format price for display
  const formatPrice = (price: number | undefined) => {
    if (price === undefined || price === 0) return '0.00';
    if (price < 0.0001) return price.toFixed(8);
    if (price < 0.001) return price.toFixed(7);
    if (price < 0.01) return price.toFixed(6);
    if (price < 0.1) return price.toFixed(5);
    if (price < 1) return price.toFixed(4);
    if (price < 10) return price.toFixed(3);
    if (price < 100) return price.toFixed(2);
    if (price < 1000) return price.toFixed(1);
    return price.toFixed(0);
  };

  // Global loading overlay for initial market load
  if (loading.markets && !selectedAsset && markets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4" />
        <p className="text-gray-600 text-lg">Loading markets...</p>
      </div>
    );
  }

  // Error state for initial market load
  if (error.markets && !selectedAsset && markets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <AlertTriangle className="text-red-500 mb-4" size={48} />
        <p className="text-red-600 mb-4 text-lg font-medium">{error.markets}</p>
        <button
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          onClick={() => fetchMarkets(selectedTimeframe)}
        >
          Retry Loading Markets
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <SubscriptionModal
          onClose={() => setShowSubscriptionModal(false)}
          onSuccess={() => {
            setShowSubscriptionModal(false);
            refreshUser();
            if (selectedAsset) {
              fetchAssetData(selectedTimeframe);
            }
          }}
          user={user}
        />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Trader Intelligence Platform</h1>
        {user && (
          <div className="flex items-center gap-4">
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

      {/* Search */}
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

      {/* Timeframe Selector */}
      <div className="flex flex-wrap gap-2 mb-6">
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

      {/* Free Tier Notice */}
      {isFreeTier && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4 md:p-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Lock size={24} className="text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">Free Tier Access</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Only 5 coins & 24h timeframe. Upgrade to Enterprise for full access.
          </p>
          <button
            onClick={handleUpgradeClick}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
          >
            Upgrade to Enterprise
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {!selectedAsset ? (
          // Market List View
          <div className="p-4 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
                Markets ({selectedTimeframe})
              </h2>
              {loading.markets && (
                <div className="flex items-center gap-2 text-blue-600">
                  <Loader2 className="animate-spin h-4 w-4" />
                  <span className="text-sm">Loading markets...</span>
                </div>
              )}
            </div>
            
            {loading.markets ? (
              // Market List Loading Skeleton
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse bg-gray-50 rounded-xl p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="h-5 bg-gray-200 rounded w-24 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                      <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                      </div>
                      <div className="flex justify-between">
                        <div className="h-3 bg-gray-200 rounded w-20"></div>
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                      </div>
                      <div className="flex justify-between">
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                        <div className="h-4 bg-gray-200 rounded w-12"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
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
                  <div className="col-span-full text-center py-8">
                    <Search size={48} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No markets found matching "{searchTerm}"</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          // Asset Detail View
          <div className="p-4 md:p-8 space-y-8">
            {/* Navigation */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <button
                onClick={() => {
                  setSelectedAsset(null);
                  setShowOverview(false);
                }}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors text-base font-medium"
              >
                <ChevronLeft size={20} />
                Back to Markets
              </button>
              {hasAccessToCurrency(selectedAsset.symbol) && (
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      if (showOverview) {
                        setShowOverview(false);
                      } else {
                        fetchMarketOverview();
                      }
                    }}
                    className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading.overview}
                  >
                    {loading.overview ? (
                      <>
                        <Loader2 className="animate-spin h-5 w-5" />
                        Loading Overview...
                      </>
                    ) : showOverview ? (
                      <>
                        <ChevronLeft size={20} />
                        Back to Analysis
                      </>
                    ) : (
                      <>
                        <Layers size={20} />
                        View Trader Overview
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => fetchAssetData(selectedTimeframe)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading.assetData || !hasAccessToCurrency(selectedAsset.symbol)}
                  >
                    {loading.assetData ? (
                      <Loader2 className="animate-spin h-5 w-5" />
                    ) : (
                      <RefreshCw size={20} />
                    )}
                    {loading.assetData ? 'Refreshing...' : 'Refresh'}
                  </button>
                </div>
              )}
            </div>

            {/* Show either trader overview or regular analysis */}
            {showOverview ? (
              <TraderOverview overview={overview} loading={loading.overview} />
            ) : (
              <div>
                {/* Asset Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                  <div>
                    <h2 className="text-2xl md:text-4xl font-bold text-gray-900">
                      {(selectedAsset?.symbol || 'N/A')} ({selectedTimeframe})
                    </h2>
                    <p className="text-gray-600 mt-2">
                      Real-time market analysis and trading insights
                    </p>
                  </div>
                  {loading.assetData && (
                    <div className="flex items-center gap-2 text-blue-600">
                      <Loader2 className="animate-spin h-5 w-5" />
                      <span className="text-sm">Loading market data...</span>
                    </div>
                  )}
                </div>
                
                {/* Global loading overlay for asset data */}
                {loading.assetData && (
                  <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-8 shadow-2xl max-w-md w-full mx-4">
                      <div className="flex flex-col items-center">
                        <Loader2 className="animate-spin h-12 w-12 text-blue-600 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Market Data</h3>
                        <p className="text-gray-600 text-center">Fetching real-time analysis from our servers...</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Price Data */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 md:p-6 border border-blue-100 mb-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Price Data</h3>
                    {!loading.currencyRate && currencyRate && (
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedAsset?.change >= 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedAsset?.change >= 0 ? '+' : ''}{(selectedAsset?.change || 0).toFixed(2)}%
                      </span>
                    )}
                  </div>
                  
                  {loading.currencyRate ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                            <div className="h-8 bg-gray-200 rounded w-32"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : currencyRate && hasAccessToCurrency(selectedAsset.symbol) ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="text-sm text-gray-600 mb-1">Current Price</div>
                        <div className="text-xl md:text-2xl font-bold text-gray-900">
                          ${formatPrice(currencyRate.rate)}
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="text-sm text-gray-600 mb-1">Timeframe</div>
                        <div className="text-lg font-semibold text-gray-900">{currencyRate.timeframe}</div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="text-sm text-gray-600 mb-1">Volume</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {(selectedAsset?.volume || 0).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200 rounded-lg p-4 text-center">
                      <p className="text-gray-700">Price data unavailable</p>
                    </div>
                  )}
                </div>

                {/* Access Restriction Check */}
                {!hasAccessToCurrency(selectedAsset.symbol) ? (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-8 text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <Lock size={32} className="text-blue-600" />
                      <h3 className="text-xl font-semibold text-gray-900">Upgrade to Access This Currency</h3>
                    </div>
                    <p className="text-gray-600 mb-6">
                      This currency is not available in your current plan. Upgrade to view detailed analytics and insights.
                    </p>
                    <button
                      onClick={handleUpgradeClick}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl text-base font-medium"
                    >
                      Upgrade to Enterprise
                    </button>
                  </div>
                ) : error.assetData ? (
                  <div className="bg-red-100 p-6 rounded-xl text-center">
                    <AlertCircle className="text-red-600 mx-auto mb-4" size={32} />
                    <p className="text-red-800 mb-4">{error.assetData}</p>
                    <button
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                      onClick={() => fetchAssetData(selectedTimeframe)}
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  // Analysis Grid
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                    {/* Left Column */}
                    <div className="space-y-6 md:space-y-8">
                      {/* Market Sentiment */}
                      <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-lg">
                        <div className="flex items-center gap-3 mb-6 md:mb-8">
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <BarChart3 size={20} className="text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg md:text-2xl font-bold text-gray-900">Market Sentiment</h3>
                            <p className="text-gray-500 text-sm md:text-base">Real-time market mood analysis</p>
                          </div>
                          {loading.sentiment && (
                            <Loader2 className="animate-spin h-5 w-5 text-blue-600 ml-auto" />
                          )}
                        </div>

                        {loading.sentiment ? (
                          renderLoadingSkeleton('sentiment')
                        ) : sentiment ? (
                          <div className="space-y-6 md:space-y-8">
                            <div className="grid grid-cols-3 gap-4 md:gap-8">
                              {/* Bullish */}
                              <div className="text-center">
                                <div className="relative w-16 h-16 md:w-24 md:h-24 mx-auto mb-4">
                                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
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
                                      <div className="text-base md:text-xl font-bold text-green-600">
                                        {sentiment.bullish || 0}%
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center justify-center gap-1 md:gap-2">
                                  <TrendingUp size={16} className="text-green-500" />
                                  <span className="font-semibold text-gray-900 text-sm md:text-base">Bullish</span>
                                </div>
                              </div>

                              {/* Bearish */}
                              <div className="text-center">
                                <div className="relative w-16 h-16 md:w-24 md:h-24 mx-auto mb-4">
                                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
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
                                      <div className="text-base md:text-xl font-bold text-red-600">
                                        {sentiment.bearish || 0}%
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center justify-center gap-1 md:gap-2">
                                  <TrendingDown size={16} className="text-red-500" />
                                  <span className="font-semibold text-gray-900 text-sm md:text-base">Bearish</span>
                                </div>
                              </div>

                              {/* Neutral */}
                              <div className="text-center">
                                <div className="relative w-16 h-16 md:w-24 md:h-24 mx-auto mb-4">
                                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
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
                                      <div className="text-base md:text-xl font-bold text-blue-600">
                                        {sentiment.neutral || 0}%
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center justify-center gap-1 md:gap-2">
                                  <LineChart size={16} className="text-blue-500" />
                                  <span className="font-semibold text-gray-900 text-sm md:text-base">Neutral</span>
                                </div>
                              </div>
                            </div>

                            {/* Sentiment Summary */}
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 md:p-6 border border-blue-100">
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                                  <Sparkles size={16} className="text-blue-600" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2">Sentiment Summary</h4>
                                  <p className="text-sm text-gray-600 leading-relaxed">
                                    {sentiment.bullish > sentiment.bearish
                                      ? 'The market shows strong bullish sentiment with positive momentum. Traders are optimistic about future price movements.'
                                      : sentiment.bearish > sentiment.bullish
                                      ? 'Bearish sentiment dominates the market with increased caution among investors. Risk management is crucial.'
                                      : 'Market sentiment is balanced with mixed signals. Traders are waiting for clearer direction.'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 text-center">
                            <div className="flex items-center justify-center gap-3 mb-2">
                              <AlertCircle size={20} className="text-blue-600" />
                              <h4 className="text-sm font-semibold text-gray-900">Sentiment Data Unavailable</h4>
                            </div>
                            <p className="text-sm text-gray-600">Please try refreshing the data.</p>
                          </div>
                        )}
                      </div>

                      {/* Market Psychology */}
                      <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-lg">
                        <div className="flex items-center gap-3 mb-6 md:mb-8">
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                            <Brain size={20} className="text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg md:text-2xl font-bold text-gray-900">Market Psychology</h3>
                            <p className="text-gray-500 text-sm md:text-base">Psychological indicators and market behavior</p>
                          </div>
                          {loading.psychology && (
                            <Loader2 className="animate-spin h-5 w-5 text-blue-600 ml-auto" />
                          )}
                        </div>

                        {loading.psychology ? (
                          renderLoadingSkeleton('psychology')
                        ) : psychology ? (
                          <div className="space-y-4 md:space-y-6">
                            <PsychologyIndicator 
                              label="Fear" 
                              value={psychology.fear} 
                              icon={<AlertCircle size={16} />}
                              color="red"
                            />
                            <PsychologyIndicator 
                              label="Greed" 
                              value={psychology.greed} 
                              icon={<Zap size={16} />}
                              color="green"
                            />
                            <PsychologyIndicator 
                              label="Momentum" 
                              value={psychology.momentum} 
                              icon={<TrendingUpIcon size={16} />}
                              color="blue"
                            />
                            <PsychologyIndicator 
                              label="Volatility" 
                              value={psychology.volatility} 
                              icon={<Activity size={16} />}
                              color="purple"
                            />
                          </div>
                        ) : isFreeTier ? (
                          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 text-center">
                            <div className="flex items-center justify-center gap-3 mb-2">
                              <Lock size={20} className="text-blue-600" />
                              <h4 className="text-sm font-semibold text-gray-900">Psychology Data Locked</h4>
                            </div>
                            <p className="text-sm text-gray-600">Upgrade to view market psychology data.</p>
                          </div>
                        ) : (
                          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 text-center">
                            <div className="flex items-center justify-center gap-3 mb-2">
                              <AlertCircle size={20} className="text-blue-600" />
                              <h4 className="text-sm font-semibold text-gray-900">Psychology Data Unavailable</h4>
                            </div>
                            <p className="text-sm text-gray-600">Please try refreshing the data.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6 md:space-y-8">
                      {/* Support & Resistance */}
                      <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-lg">
                        <div className="flex items-center gap-3 mb-6 md:mb-8">
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                            <Scale size={20} className="text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg md:text-2xl font-bold text-gray-900">Support & Resistance</h3>
                            <p className="text-gray-500 text-sm md:text-base">Key price levels and breakout analysis</p>
                          </div>
                          {loading.supportResistance && (
                            <Loader2 className="animate-spin h-5 w-5 text-blue-600 ml-auto" />
                          )}
                        </div>

                        {loading.supportResistance ? (
                          renderLoadingSkeleton('support')
                        ) : supportResistance && currencyRate ? (
                          <SupportResistanceCard 
                            srData={supportResistance} 
                            currentPrice={currencyRate.rate}
                            selectedAsset={selectedAsset}
                          />
                        ) : (
                          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 text-center">
                            <div className="flex items-center justify-center gap-3 mb-2">
                              <AlertCircle size={20} className="text-blue-600" />
                              <h4 className="text-sm font-semibold text-gray-900">Support/Resistance Data Unavailable</h4>
                            </div>
                            <p className="text-sm text-gray-600">Please try refreshing the data.</p>
                          </div>
                        )}
                      </div>

                      {/* Additional Stats */}
                      <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-lg">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                            <Gauge size={20} className="text-white" />
                          </div>
                          <h3 className="text-lg md:text-xl font-semibold text-gray-900">Market Statistics</h3>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-600">Timeframe</span>
                            <span className="font-semibold text-gray-900">{selectedTimeframe}</span>
                          </div>
                          
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-600">Category</span>
                            <span className="font-semibold text-gray-900 uppercase">
                              {selectedAsset?.category || 'crypto'}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-600">Data Freshness</span>
                            <span className="font-semibold text-gray-900">Live</span>
                          </div>
                          
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-600">Analysis Confidence</span>
                            <span className="font-semibold text-gray-900">
                              {sentiment && psychology ? 'High' : 'Medium'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};