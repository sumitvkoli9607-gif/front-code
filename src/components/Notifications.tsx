// NotificationSystem.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Bell, X, Trash2, AlertCircle,
  TrendingUp, TrendingDown, DollarSign, Zap,
  Shield, Activity, MessageSquare, Info,
  Check
} from 'lucide-react';
import notificationSound from './notification-sound.mp3';

/* -------------- TYPES (updated to match backend) -------------- */
interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'PRICE_ALERT' | 'SUPPORT_RESISTANCE_BREAK' | 'MAJOR_MOVEMENT' |
         'SENTIMENT_SHIFT' | 'OVERVIEW_UPDATE' | 'OVERVIEW_ALERT' | 'TEST' |
         'PRICE_BREAKOUT' | 'SUPPORT_BREAK' | 'RESISTANCE_BREAK' | 'VOLUME_SURGE' | 'CRITICAL';
  data: {
    symbol?: string;
    price?: number;
    change?: number;
    level?: number;
    breakType?: 'SUPPORT' | 'RESISTANCE';
    previousSentiment?: string;
    currentSentiment?: string;
    overview?: any;
    previousOverview?: any;
    confidence?: number;
    timestamp?: number;
    direction?: string;
    strength?: number;
    breakPercent?: number;
    volumeMultiplier?: number;
    volume?: number;
    rsi?: number;
    [key: string]: any;
  };
  priority: 'low' | 'medium' | 'high';
  icon: string;
  read: boolean;
  createdAt: string;
}

interface NotificationResponse {
  notifications: Notification[];
  unreadCount: number;
  total: number;
}

interface NotificationSystemProps {
  token: string;
  userId: string;
  onNotificationClick?: (n: Notification) => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
  maxNotifications?: number;
}

/* -------------- COMPONENT -------------- */
const NotificationSystem: React.FC<NotificationSystemProps> = ({
  token,
  autoRefresh = true,
  refreshInterval = 30_000,
  maxNotifications = 50,
}) => {
  /* ---- state ---- */
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [pollingEnabled, setPollingEnabled] = useState(autoRefresh);
  const [hasNewNotification, setHasNewNotification] = useState(false);

  /* ---- refs ---- */
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const notificationSoundRef = useRef<HTMLAudioElement | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const previousNotificationsRef = useRef<Set<string>>(new Set()); // Track notification IDs

  /* ---- sound init ---- */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      notificationSoundRef.current = new Audio(notificationSound);
      notificationSoundRef.current.volume = 0.5; // Moderate volume
    }
  }, []);

  /* ---- API helpers ---- */
  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/notifications?limit=${maxNotifications}`,
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (!res.ok) throw new Error(res.status + '');
      const data: NotificationResponse = await res.json();
      
      // Get current notification IDs
      const currentNotificationIds = new Set(data.notifications.map(n => n._id));
      
      // Find new notifications (IDs that weren't in previous set)
      const newNotifications = data.notifications.filter(
        n => !previousNotificationsRef.current.has(n._id) && !n.read
      );
      
      // Update the previous notifications set
      previousNotificationsRef.current = currentNotificationIds;
      
      // Update notifications - only show first 50
      const limitedNotifications = data.notifications.slice(0, maxNotifications);
      setNotifications(limitedNotifications);
      setUnreadCount(data.unreadCount);
      
      // Play sound if there are new unread notifications
      if (newNotifications.length > 0) {
        setHasNewNotification(true);
        
        // Only play sound if dropdown is not open
        if (!isOpen) {
          notificationSoundRef.current?.play().catch(() => {
            // Handle autoplay restrictions
            console.log('Audio play failed, might be due to autoplay restrictions');
          });
        }
      }
      
    } catch (e: any) {
      setError(e.message || 'Failed to fetch notifications');
    } finally {
      setIsLoading(false);
    }
  }, [token, maxNotifications, isOpen]);

  const markAsRead = useCallback(
    async (id: string) => {
      const wasRead = notifications.find(n => n._id === id)?.read;
      if (wasRead) return;
      try {
        await fetch(
          `${import.meta.env.VITE_API_URL}/api/notifications/${id}/read`,
          { 
            method: 'PUT', 
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        setNotifications(prev => prev.map(n => (n._id === id ? { ...n, read: true } : n)));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch {}
    },
    [token, notifications]
  );

  const markAllAsRead = useCallback(async () => {
    try {
      await fetch(
        `${import.meta.env.VITE_API_URL}/api/notifications/read-all`,
        { 
          method: 'PUT', 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      setHasNewNotification(false);
    } catch {}
  }, [token]);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      await fetch(
        `${import.meta.env.VITE_API_URL}/api/notifications/${id}`,
        { 
          method: 'DELETE', 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setNotifications(prev => prev.filter(n => n._id !== id));
      setUnreadCount(prev => {
        const deleted = notifications.find(n => n._id === id);
        return deleted && !deleted.read ? prev - 1 : prev;
      });
      // Remove from previous notifications ref
      previousNotificationsRef.current.delete(id);
    } catch {}
  }, [token, notifications]);

  const clearAll = useCallback(async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/notifications`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      setNotifications([]);
      setUnreadCount(0);
      setHasNewNotification(false);
      previousNotificationsRef.current.clear();
    } catch {}
  }, [token]);

  /* ---- auto mark-as-read when card becomes visible ---- */
  useEffect(() => {
    if (!isOpen) return;
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(en => {
          if (en.isIntersecting) {
            const id = en.target.getAttribute('data-id');
            if (id) markAsRead(id);
          }
        });
      },
      { threshold: 0.4 }
    );
    Object.values(cardRefs.current).forEach(el => el && io.observe(el));
    return () => io.disconnect();
  }, [isOpen, notifications, markAsRead]);

  /* ---- polling ---- */
  useEffect(() => {
    if (!pollingEnabled || !token) return;
    
    // Initial fetch
    fetchNotifications();
    
    // Set up polling interval
    pollingRef.current = setInterval(fetchNotifications, refreshInterval);
    
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [pollingEnabled, refreshInterval, fetchNotifications, token]);

  /* ---- initial ---- */
  useEffect(() => {
    if (token) {
      fetchNotifications();
    }
  }, [fetchNotifications, token]);

  /* ---- Reset new notification indicator when dropdown is opened ---- */
  useEffect(() => {
    if (isOpen) {
      setHasNewNotification(false);
    }
  }, [isOpen]);

  /* ---- UI helpers ---- */
  const iconMap: Record<string, React.ReactNode> = {
    '💰': <DollarSign size={16} className="text-green-500" />,
    '🔺': <TrendingUp size={16} className="text-red-500" />,
    '🔻': <TrendingDown size={16} className="text-blue-500" />,
    '⚡': <Zap size={16} className="text-yellow-500" />,
    '🎭': <MessageSquare size={16} className="text-purple-500" />,
    '📊': <Activity size={16} className="text-indigo-500" />,
    '🎯': <Shield size={16} className="text-pink-500" />,
    '📨': <Info size={16} className="text-gray-500" />,
    '🧪': <AlertCircle size={16} className="text-orange-500" />,
    '🔄': <TrendingUp size={16} className="text-teal-500" />,
    '🟢': <TrendingUp size={16} className="text-green-500" />,
    '🔴': <TrendingDown size={16} className="text-red-500" />,
    '🚨': <AlertCircle size={16} className="text-red-500" />,
    '⚠️': <AlertCircle size={16} className="text-yellow-500" />,
  };
  const getIcon = (n: Notification) => iconMap[n.icon] ?? <Bell size={16} className="text-gray-500" />;

  const priorityColor = (p: string) => {
    switch (p) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(d).toLocaleDateString();
  };

  /* ---- Helper to extract data for display ---- */
  const getDisplayData = (n: Notification) => {
    const data = n.data || {};
    
    // Extract price from different possible locations
    let displayPrice = data.price;
    if (!displayPrice && data.overview?.currentPrice) {
      displayPrice = data.overview.currentPrice;
    }
    
    // Extract change from different possible locations
    let displayChange = data.change;
    if (!displayChange && data.overview?.priceChange24h !== undefined) {
      displayChange = data.overview.priceChange24h;
    }
    if (!displayChange && data.breakPercent !== undefined) {
      displayChange = data.breakPercent;
    }
    
    // Extract level for support/resistance notifications
    let displayLevel = data.level;
    if (!displayLevel) {
      if (data.overview?.keyLevels?.immediateSupport) {
        displayLevel = data.overview.keyLevels.immediateSupport;
      } else if (data.overview?.keyLevels?.immediateResistance) {
        displayLevel = data.overview.keyLevels.immediateResistance;
      }
    }
    
    // Extract symbol
    let displaySymbol = data.symbol;
    if (!displaySymbol && n.title) {
      // Try to extract symbol from title
      const symbolMatch = n.title.match(/(BTC|ETH|BNB|SOL|XRP|ADA|DOT|MATIC|DOGE|LTC)\//);
      if (symbolMatch) {
        displaySymbol = symbolMatch[0];
      }
    }
    
    // Extract confidence
    let displayConfidence = data.confidence;
    if (!displayConfidence && data.overview?.tradeSetup?.confidence) {
      displayConfidence = data.overview.tradeSetup.confidence;
    }
    
    // Extract RSI
    let displayRsi = data.rsi;
    if (!displayRsi && data.overview?.momentum?.rsi) {
      displayRsi = data.overview.momentum.rsi;
    }
    
    return {
      price: displayPrice,
      change: displayChange,
      level: displayLevel,
      symbol: displaySymbol,
      confidence: displayConfidence,
      rsi: displayRsi,
      volumeMultiplier: data.volumeMultiplier,
      direction: data.direction,
      strength: data.strength,
      breakType: data.breakType,
      previousSentiment: data.previousSentiment,
      currentSentiment: data.currentSentiment,
      timestamp: data.timestamp,
    };
  };

  /* ---- render ---- */
  return (
    <div className="relative">
      {/* Bell trigger */}
      <button
        onClick={() => setIsOpen(v => !v)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={24} className="text-gray-600 dark:text-gray-300" />
        {/* Exclamation mark indicator for new notifications */}
        {hasNewNotification && (
          <span className="absolute top-0 right-0 h-5 w-5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-red-600 animate-ping opacity-75"></span>
            <span className="absolute inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-600">
              <span className="text-xs font-bold text-white">!</span>
            </span>
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-40 max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
                <p className="text-sm text-gray-500">
                  {unreadCount} unread • {notifications.length} of {maxNotifications} shown
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={markAllAsRead}
                  disabled={!unreadCount}
                  className={`p-1.5 rounded ${!unreadCount ? 'text-gray-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500'}`}
                  title="Mark all as read"
                >
                  <Check size={18} />
                </button>
                <button
                  onClick={clearAll}
                  disabled={!notifications.length}
                  className={`p-1.5 rounded ${!notifications.length ? 'text-gray-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500'}`}
                  title="Clear all"
                >
                  <Trash2 size={18} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Close"
                >
                  <X size={18} className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* Auto-refresh toggle */}
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">Auto-refresh</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={pollingEnabled}
                  onChange={e => setPollingEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading notifications...</p>
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <AlertCircle size={32} className="text-red-500 mx-auto" />
                <p className="mt-2 text-red-600">{error}</p>
                <button onClick={fetchNotifications} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Retry</button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell size={48} className="text-gray-300 mx-auto" />
                <p className="mt-4 text-gray-500">No notifications yet</p>
                <p className="text-sm text-gray-400 mt-1">Market alerts will appear here</p>
              </div>
            ) : (
              <div>
                {notifications.map(n => {
                  const displayData = getDisplayData(n);
                  return (
                    <div
                      key={n._id}
                      data-id={n._id}
                      ref={el => (cardRefs.current[n._id] = el)}
                      onClick={() => !n.read && markAsRead(n._id)}
                      className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-750 relative ${
                        !n.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      {!n.read && (
                        <span className="absolute inset-0 rounded-md animate-pulse pointer-events-none" />
                      )}

                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">{getIcon(n)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className={`text-sm font-semibold truncate ${n.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                              {n.title}
                            </h4>
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityColor(n.priority)}`}>
                              {n.priority}
                            </span>
                          </div>

                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{n.message}</p>

                          {(displayData.symbol || displayData.price || displayData.change !== undefined || displayData.confidence) && (
                            <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                              {displayData.symbol && (
                                <span className="font-medium bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                  {displayData.symbol}
                                </span>
                              )}
                              {displayData.price !== undefined && (
                                <span className="font-medium">
                                  ${displayData.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              )}
                              {displayData.change !== undefined && (
                                <span className={displayData.change >= 0 ? 'text-green-600 dark:text-green-400 font-medium' : 'text-red-600 dark:text-red-400 font-medium'}>
                                  {displayData.change > 0 ? '+' : ''}
                                  {displayData.change.toFixed(2)}%
                                </span>
                              )}
                              {displayData.confidence !== undefined && (
                                <span className="text-blue-600 dark:text-blue-400 font-medium">
                                  {displayData.confidence}% confidence
                                </span>
                              )}
                            </div>
                          )}

                          {/* Additional data based on notification type */}
                          {n.type === 'SUPPORT_RESISTANCE_BREAK' && displayData.level && (
                            <div className="text-xs text-gray-500 mb-2">
                              Level: ${displayData.level.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              {displayData.breakType && ` (${displayData.breakType.toLowerCase()})`}
                            </div>
                          )}

                          {n.type === 'SENTIMENT_SHIFT' && displayData.previousSentiment && displayData.currentSentiment && (
                            <div className="text-xs text-gray-500 mb-2">
                              {displayData.previousSentiment} → {displayData.currentSentiment}
                            </div>
                          )}

                          {n.type === 'OVERVIEW_UPDATE' && displayData.rsi !== undefined && (
                            <div className="text-xs text-gray-500 mb-2">
                              RSI: {displayData.rsi} {displayData.rsi >= 70 ? '⚠️ Overbought' : displayData.rsi <= 30 ? '⚠️ Oversold' : ''}
                            </div>
                          )}

                          {n.type === 'VOLUME_SURGE' && displayData.volumeMultiplier && (
                            <div className="text-xs text-gray-500 mb-2">
                              Volume: {displayData.volumeMultiplier.toFixed(1)}x average
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-3">
                            <span className="text-xs text-gray-400">{formatDate(n.createdAt)}</span>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                deleteNotification(n._id);
                              }}
                              className="text-xs px-2 py-1 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 text-center">
              <button onClick={fetchNotifications} className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                Refresh
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationSystem;