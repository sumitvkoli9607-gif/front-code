import React, { useState, useEffect } from 'react';
import { Bell, X, TrendingUp, Info, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { SubscriptionModal } from './SubscriptionModal'; // Adjust import path as needed

interface NewsItem {
  title: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  impact: 'high' | 'medium' | 'low';
  timestamp: string;
  source?: string;
  summary?: string;
  url?: string;
}

interface Notification {
  id: string;
  type: 'news';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
  icon?: React.ReactNode;
  symbol: string;
}

interface User {
  email: string;
  subscription: {
    plan: string | null;
    active: boolean;
  };
}

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  notifications?: Notification[]; // optional if you still want internal fetching
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onClearAll?: () => void;
}

const API_BASE_URL =import.meta.env.VITE_API_URL;

// Define allowed plans for notification access
const PLAN_ACCESS = {
  Basic: true,
  Pro: true,
  Enterprise: true,
};

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await axios.get(`${API_BASE_URL}/api/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const isValidSentiment = (sentiment: any): sentiment is NewsItem['sentiment'] => {
    return ['bullish', 'bearish', 'neutral'].includes(sentiment);
  };

  const isValidImpact = (impact: any): impact is NewsItem['impact'] => {
    return ['high', 'medium', 'low'].includes(impact);
  };

  const validateNewsItem = (item: any): Notification | null => {
    if (!item || typeof item !== 'object' || !item.news || !item.symbol) return null;
    const news = item.news;
    return {
      id: `${item.symbol}-${news.timestamp}-${news.title.slice(0, 10)}`,
      type: 'news',
      title: `${item.symbol}: ${typeof news.title === 'string' ? news.title : 'Untitled'}`,
      message: typeof news.summary === 'string' ? news.summary : 'No summary available',
      timestamp: new Date(typeof news.timestamp === 'string' ? news.timestamp : new Date().toISOString()),
      read: false,
      priority: isValidImpact(news.impact) ? news.impact : 'low',
      symbol: typeof item.symbol === 'string' ? item.symbol : 'Unknown',
      icon: isValidSentiment(news.sentiment)
        ? news.sentiment === 'bullish'
          ? <TrendingUp size={16} className="text-green-500" />
          : news.sentiment === 'bearish'
          ? <TrendingUp size={16} className="text-red-500" />
          : <Info size={16} className="text-blue-500" />
        : <Info size={16} className="text-blue-500" />,
    };
  };

  const hasAccessToNotifications = (): boolean => {
    if (!user?.subscription?.plan || !user?.subscription?.active) return false;
    const plan = user.subscription.plan as keyof typeof PLAN_ACCESS;
    return PLAN_ACCESS[plan] || false;
  };

  const fetchNotifications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token missing');
      }

      const response = await axios.get<{ symbol: string; news: NewsItem }[]>(API_BASE_URL, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });

      const validatedNotifications = response.data
        .map(validateNewsItem)
        .filter((item): item is Notification => item !== null)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      setNotifications(validatedNotifications);
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message || 'Failed to fetch notifications'
        : 'An unexpected error occurred';
      setError(message);
      console.error('Error fetching notifications:', err);
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        setShowSubscriptionModal(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && hasAccessToNotifications()) {
      fetchNotifications();
    }
  }, [isOpen]);


  const handleUpgradeClick = () => {
    setShowSubscriptionModal(true);
  };

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="absolute top-full right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 max-h-[80vh] overflow-hidden">
      {/* Subscription Modal */}
     {showSubscriptionModal && (
                <SubscriptionModal
                  onClose={() => setShowSubscriptionModal(false)}
                  user={user}
                   />
         )}
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Bell size={18} className="text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Market News (Last 1 Hour)</h3>
            <p className="text-sm text-gray-500">
              {isLoading
                ? 'Loading...'
                : unreadCount > 0
                ? `${unreadCount} unread`
                : 'All caught up!'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <X size={18} className="text-gray-500" />
        </button>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {!user?.subscription?.active || !hasAccessToNotifications() ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} className="text-blue-400" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Access Restricted</h3>
            <p className="text-sm text-gray-500 mb-4">
              Upgrade your plan to access real-time market notifications
            </p>
            <button
              onClick={handleUpgradeClick}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl text-sm font-medium"
            >
              Upgrade Plan
            </button>
          </div>
        ) : isLoading ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Bell size={32} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} className="text-red-400" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Error</h3>
            <p className="text-sm text-gray-500">{error}</p>
            <button
              onClick={fetchNotifications}
              className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Try again
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell size={32} className="text-gray-400" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">No news</h3>
            <p className="text-sm text-gray-500">No news in the last hour. Check back later.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer border-l-4 ${
                  getPriorityColor(notification.priority)
                } ${!notification.read ? 'bg-blue-50/30' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">{notification.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4
                        className={`text-sm font-medium ${
                          !notification.read ? 'text-gray-900' : 'text-gray-700'
                        }`}
                      >
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                      )}
                    </div>
                    <p
                      className={`text-sm leading-relaxed ${
                        !notification.read ? 'text-gray-700' : 'text-gray-600'
                      }`}
                    >
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(notification.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};