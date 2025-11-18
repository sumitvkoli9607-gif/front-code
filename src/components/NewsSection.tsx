import React, { useState, useEffect } from 'react';
import { Calendar, ExternalLink, TrendingUp, AlertTriangle, Info } from 'lucide-react';
import axios from 'axios';
import type { NewsItem } from '../types';

/* ------------------------------------------------------------------ */
/*  CONFIG – adjust only if your env variable name is different        */
/* ------------------------------------------------------------------ */
const API_BASE_URL = import.meta.env.VITE_API_URL;
const NEWS_ENDPOINT = `${API_BASE_URL}/notifications/all-impact-news`;
/* ------------------------------------------------------------------ */

interface NewsWithSymbol {
  symbol: string;
  news: NewsItem;
}

export const NewsSection: React.FC = () => {
  const [newsItems, setNewsItems] = useState<NewsWithSymbol[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'1h' | '3h' | '6h' | '12h' | '24h'>('24h');

  /* -------------------------------------------------------------- */
  /*  Small helper – reads JWT from localStorage (or your store)    */
  /* -------------------------------------------------------------- */
  const getAuthHeader = () => {
    const token = localStorage.getItem('token'); // ← same key you use at login
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  /* -------------------------------------------------------------- */
  /*  Validation helpers (unchanged)                                */
  /* -------------------------------------------------------------- */
  const isValidSentiment = (sentiment: any): sentiment is NewsItem['sentiment'] =>
    ['bullish', 'bearish', 'neutral'].includes(sentiment);

  const isValidImpact = (impact: any): impact is NewsItem['impact'] =>
    ['high', 'medium', 'low'].includes(impact);

  const validateNewsItem = (item: any): NewsWithSymbol | null => {
    if (!item || typeof item !== 'object' || !item.news || !item.symbol) return null;
    return {
      symbol: typeof item.symbol === 'string' ? item.symbol : 'Unknown',
      news: {
        title: typeof item.news.title === 'string' ? item.news.title : 'Untitled',
        sentiment: isValidSentiment(item.news.sentiment) ? item.news.sentiment : 'neutral',
        impact: isValidImpact(item.news.impact) ? item.news.impact : 'low',
        timestamp: typeof item.news.timestamp === 'string' ? item.news.timestamp : new Date().toISOString(),
        source: typeof item.news.source === 'string' ? item.news.source : 'Unknown',
        summary: typeof item.news.summary === 'string' ? item.news.summary : '',
        url: typeof item.news.url === 'string' ? item.news.url : '',
      },
    };
  };

  /* -------------------------------------------------------------- */
  /*  Core fetch – now authenticated                                */
  /* -------------------------------------------------------------- */
  const fetchNews = async (selectedTimeframe: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await axios.get<NewsWithSymbol[]>(NEWS_ENDPOINT, {
        params: { timeframe: selectedTimeframe },
        headers: getAuthHeader(),
      });

      const validated = data.map(validateNewsItem).filter(Boolean) as NewsWithSymbol[];
      setNewsItems(validated);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to fetch news');
      console.error('[NewsSection] fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(timeframe);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeframe]);

  /* -------------------------------------------------------------- */
  /*  Everything below is 100 % identical to your original file      */
  /* -------------------------------------------------------------- */
  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high':
        return <AlertTriangle size={16} className="text-red-500" />;
      case 'medium':
        return <Info size={16} className="text-yellow-500" />;
      case 'low':
        return <Info size={16} className="text-gray-400" />;
      default:
        return null;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Market News</h1>
          <p className="text-gray-500">Stay updated with the latest financial news across markets</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="text-sm text-gray-600 border rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1h">Last 1 Hour</option>
            <option value="3h">Last 3 Hours</option>
            <option value="6h">Last 6 Hours</option>
            <option value="12h">Last 12 Hours</option>
            <option value="24h">Last 24 Hours</option>
          </select>
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-gray-400" />
            <span className="text-sm text-gray-500">
              Last updated: {isLoading ? 'Updating...' : new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      {/* News Feed */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Info size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-500">Loading news...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} className="text-red-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
            <p className="text-gray-500">{error}</p>
            <button
              onClick={() => fetchNews(timeframe)}
              className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Try again
            </button>
          </div>
        ) : newsItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Info size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No news found</h3>
            <p className="text-gray-500">Check back later for updates.</p>
          </div>
        ) : (
          newsItems.map((item, index) => (
            <div
              key={`${item.symbol}-${index}`}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {item.symbol}: {item.news.title}
                    </h3>
                    {item.news.url && (
                      <a
                        href={item.news.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 flex-shrink-0"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mb-3">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        item.news.sentiment === 'bullish'
                          ? 'bg-green-100 text-green-800'
                          : item.news.sentiment === 'bearish'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {item.news.sentiment === 'bullish' && <TrendingUp size={12} className="mr-1" />}
                      {item.news.sentiment ? item.news.sentiment.toUpperCase() : 'NEUTRAL'}
                    </span>

                    <div className="flex items-center gap-1">
                      {getImpactIcon(item.news.impact)}
                      <span className="text-xs text-gray-600 uppercase font-medium">
                        {item.news.impact} Impact
                      </span>
                    </div>

                    <span className="text-xs text-gray-500">{item.news.source}</span>

                    <span className="text-xs text-gray-500">{formatTimeAgo(item.news.timestamp)}</span>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 leading-relaxed">{item.news.summary}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};