import { useState, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, Filter, Wifi, TrendingUp, TrendingDown, AlertTriangle, BarChart3, Activity } from 'lucide-react';

type NotificationType =
  | 'OVERVIEW_UPDATE'
  | 'PRICE_ALERT'
  | 'SUPPORT_BREAK'
  | 'RESISTANCE_BREAK'
  | 'VOLUME_SURGE'
  | 'CRITICAL_ALERT';

type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

interface NotificationData {
  symbol?: string;
  price?: number;
  change?: number;
  confidence?: number;
  rsi?: number;
  support?: number;
  resistance?: number;
  breakPercentage?: number;
  volumeMultiplier?: number;
  action?: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  read: boolean;
  createdAt: string;
  data: NotificationData;
}

type FilterType = 'all' | 'unread' | 'PRICE_ALERT' | 'OVERVIEW_UPDATE' | 'VOLUME_SURGE';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3005';

// API Service
class NotificationService {
  private static getAuthToken(): string {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return token;
  }

  static async fetchNotifications(limit: number = 20): Promise<Notification[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.notifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  static async markAsRead(notificationId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  static async markAllAsRead(): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  static async deleteNotification(notificationId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  static async clearAllNotifications(): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      throw error;
    }
  }

  static async getNotificationSettings(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notification-settings`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      throw error;
    }
  }

  static async updateNotificationSettings(settings: any): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notification-settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw error;
    }
  }

  // WebSocket connection for real-time notifications
  static connectWebSocket(onNotification: (notification: Notification) => void): WebSocket | null {
    try {
      const token = this.getAuthToken();
      const ws = new WebSocket(`ws://localhost:3005/notifications?token=${token}`);

      ws.onopen = () => {
        console.log('WebSocket connected for real-time notifications');
      };

      ws.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data);
          onNotification(notification);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        // Attempt reconnection after 5 seconds
        setTimeout(() => {
          console.log('Attempting WebSocket reconnection...');
          this.connectWebSocket(onNotification);
        }, 5000);
      };

      return ws;
    } catch (error) {
      console.error('Error connecting WebSocket:', error);
      return null;
    }
  }
}

function NotificationCard({ notification, onClick }: { notification: Notification; onClick: (id: string) => void }) {
  const { id, title, message, type, priority, read, createdAt, data } = notification;

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now.getTime() - time.getTime()) / 60000);

    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  const isPositive = (data.change ?? 0) >= 0;
  const changeColor = isPositive ? 'text-green-600' : 'text-red-600';
  const bgChangeColor = isPositive ? 'bg-green-100' : 'bg-red-100';

  const getPriorityColor = () => {
    switch (priority) {
      case 'critical':
        return 'border-l-red-500';
      case 'high':
        return 'border-l-orange-500';
      case 'medium':
        return 'border-l-purple-400';
      default:
        return 'border-l-gray-300';
    }
  };

  const getRSIColor = (rsi?: number) => {
    if (!rsi) return 'text-gray-500';
    if (rsi < 30) return 'text-red-600';
    if (rsi > 70) return 'text-green-600';
    return 'text-yellow-600';
  };

  const renderCriticalAlert = () => (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-red-100 rounded-lg">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg text-red-600">{title}</h3>
          <p className="text-gray-700 mt-1">{message}</p>
        </div>
      </div>
      {data.symbol && (
        <div className="bg-red-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 font-semibold">{data.symbol}</span>
            <span className="text-2xl font-bold text-gray-900">${data.price?.toLocaleString()}</span>
          </div>
          <div className={`flex items-center gap-2 mt-2 ${changeColor}`}>
            {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            <span className="font-semibold text-lg">{isPositive ? '+' : ''}{data.change}%</span>
          </div>
        </div>
      )}
      {data.action && (
        <div className="bg-red-100 border border-red-300 rounded-lg p-3">
          <p className="text-red-700 font-medium">{data.action}</p>
        </div>
      )}
    </div>
  );

  const renderOverviewUpdate = () => (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-purple-100 rounded-lg">
          <BarChart3 className="w-5 h-5 text-purple-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-gray-600 text-sm mt-1">{message}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-purple-50 rounded-lg p-3">
          <div className="text-gray-600 text-xs mb-1">Current Price</div>
          <div className="text-gray-900 font-bold text-xl">${data.price?.toLocaleString()}</div>
          <div className={`flex items-center gap-2 mt-1 ${changeColor}`}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="text-sm font-semibold">{isPositive ? '+' : ''}{data.change}%</span>
          </div>
        </div>
        <div className="bg-purple-50 rounded-lg p-3">
          <div className="text-gray-600 text-xs mb-1">Signal Strength</div>
          <div className="text-gray-900 font-bold text-xl">{data.confidence}%</div>
          <div className="mt-1">
            <div className="w-full bg-gray-300 rounded-full h-1.5">
              <div
                className="bg-purple-500 h-1.5 rounded-full transition-all"
                style={{ width: `${data.confidence}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between text-sm">
        <div>
          <span className="text-gray-600">RSI: </span>
          <span className={`font-semibold ${getRSIColor(data.rsi)}`}>{data.rsi}</span>
        </div>
        <div className="flex gap-3">
          <div>
            <span className="text-gray-600">Support: </span>
            <span className="text-green-600 font-semibold">${data.support?.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-gray-600">Resistance: </span>
            <span className="text-red-600 font-semibold">${data.resistance?.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPriceAlert = () => (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <div className={`p-2 ${isPositive ? 'bg-green-100' : 'bg-red-100'} rounded-lg`}>
          <Activity className={`w-5 h-5 ${isPositive ? 'text-green-600' : 'text-red-600'}`} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-gray-600 text-sm mt-1">{message}</p>
        </div>
      </div>
      <div className="bg-purple-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-600 font-medium">{data.symbol}</span>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${bgChangeColor}`}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className={`font-bold ${changeColor}`}>{isPositive ? '+' : ''}{data.change}%</span>
          </div>
        </div>
        <div className="text-center mb-4">
          <div className="text-4xl font-bold text-gray-900">${data.price?.toLocaleString()}</div>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition-colors">
            Buy
          </button>
          <button className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition-colors">
            Sell
          </button>
        </div>
      </div>
    </div>
  );

  const renderBreakAlert = () => {
    const isResistance = type === 'RESISTANCE_BREAK';
    const level = isResistance ? data.resistance : data.support;
    const breakType = isResistance ? 'Resistance' : 'Support';
    const color = isResistance ? 'text-green-600' : 'text-red-600';
    const bgColor = isResistance ? 'bg-green-100' : 'bg-red-100';

    return (
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className={bgColor + ' p-2 rounded-lg'}>
            {isResistance ? (
              <TrendingUp className={`w-5 h-5 ${color}`} />
            ) : (
              <TrendingDown className={`w-5 h-5 ${color}`} />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-gray-600 text-sm mt-1">{message}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-gray-100 rounded-lg p-3 text-center">
            <div className="text-gray-600 text-xs mb-1">{breakType}</div>
            <div className="text-gray-900 font-bold">${level?.toLocaleString()}</div>
          </div>
          <div className="bg-gray-100 rounded-lg p-3 text-center">
            <div className="text-gray-600 text-xs mb-1">Current</div>
            <div className="text-gray-900 font-bold">${data.price?.toLocaleString()}</div>
          </div>
          <div className={`${bgColor} rounded-lg p-3 text-center`}>
            <div className="text-gray-600 text-xs mb-1">Break %</div>
            <div className={`${color} font-bold`}>{data.breakPercentage}%</div>
          </div>
        </div>
      </div>
    );
  };

  const renderVolumeSurge = () => (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-purple-100 rounded-lg">
          <BarChart3 className="w-5 h-5 text-purple-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-gray-600 text-sm mt-1">{message}</p>
        </div>
      </div>
      <div className="bg-purple-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-600 font-medium">{data.symbol}</span>
          <span className="text-xl font-bold text-gray-900">${data.price?.toLocaleString()}</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <div className="text-gray-600 text-xs mb-1">Volume Multiplier</div>
            <div className="text-purple-600 font-bold text-2xl">{data.volumeMultiplier}x</div>
          </div>
          <div className="text-center">
            <div className="text-gray-600 text-xs mb-1">Price Change</div>
            <div className={`font-bold text-2xl ${changeColor}`}>
              {isPositive ? '+' : ''}{data.change}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (type) {
      case 'CRITICAL_ALERT':
        return renderCriticalAlert();
      case 'OVERVIEW_UPDATE':
        return renderOverviewUpdate();
      case 'PRICE_ALERT':
        return renderPriceAlert();
      case 'RESISTANCE_BREAK':
      case 'SUPPORT_BREAK':
        return renderBreakAlert();
      case 'VOLUME_SURGE':
        return renderVolumeSurge();
      default:
        return (
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-gray-600 text-sm mt-1">{message}</p>
          </div>
        );
    }
  };

  return (
    <div
      onClick={() => onClick(id)}
      className={`relative bg-white rounded-xl p-4 border-l-4 ${getPriorityColor()}
        cursor-pointer transition-all duration-300 hover:bg-purple-50 hover:shadow-lg
        ${!read ? 'ring-2 ring-purple-300' : ''}`}
    >
      {!read && (
        <div className="absolute top-4 right-4">
          <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-pulse" />
        </div>
      )}

      <div className="mb-3">
        {renderContent()}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-200">
        <span>{getTimeAgo(createdAt)}</span>
        {!read && <span className="text-purple-600 font-medium">New</span>}
      </div>
    </div>
  );
}

function App() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [isConnected, setIsConnected] = useState(true);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await NotificationService.fetchNotifications(50);
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setError('Failed to load notifications. Please try again.');
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  // Initialize WebSocket connection for real-time updates
  const connectWebSocket = () => {
    const ws = NotificationService.connectWebSocket((notification: Notification) => {
      // Add new notification to the beginning of the list
      setNotifications(prev => [notification, ...prev]);
      
      // Show browser notification if supported
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: notification.id,
          timestamp: Date.parse(notification.createdAt)
        });
      }
    });

    setWebsocket(ws);
  };

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission();
        console.log('Notification permission:', permission);
      } catch (error) {
        console.error('Error requesting notification permission:', error);
      }
    }
  };

  useEffect(() => {
    // Initial data fetch
    fetchNotifications();
    
    // Request browser notification permission
    requestNotificationPermission();
    
    // Connect WebSocket for real-time updates
    connectWebSocket();

    // Set up polling for updates every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => {
      clearInterval(interval);
      if (websocket) {
        websocket.close();
      }
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  const handleMarkAsRead = async (id: string) => {
    try {
      await NotificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleClearAll = async () => {
    try {
      await NotificationService.clearAllNotifications();
      setNotifications([]);
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
    }
  };

  const getFilterLabel = (filterType: FilterType): string => {
    const labels: Record<FilterType, string> = {
      all: 'All Notifications',
      unread: 'Unread Only',
      PRICE_ALERT: 'Price Alerts',
      OVERVIEW_UPDATE: 'Market Updates',
      VOLUME_SURGE: 'Volume Surges',
    };
    return labels[filterType];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex p-4 bg-purple-100 rounded-full mb-4">
            <Bell className="w-12 h-12 text-purple-600 animate-pulse" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Loading Notifications</h3>
          <p className="text-gray-600">Fetching your latest alerts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex p-4 bg-red-100 rounded-full mb-4">
            <AlertTriangle className="w-12 h-12 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Connection Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchNotifications}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-purple-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-100 to-purple-50 p-6 border-b border-purple-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-200 rounded-xl">
                  <Bell className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Notifications & Alerts</h1>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isConnected ? 'bg-green-600 animate-pulse' : 'bg-red-600'
                        }`}
                      />
                      <span className="text-sm text-gray-600">
                        {isConnected ? 'Live Updates' : 'Disconnected'}
                      </span>
                    </div>
                    {unreadCount > 0 && (
                      <div className="px-3 py-1 bg-purple-600 rounded-full">
                        <span className="text-white text-sm font-semibold">
                          {unreadCount} Unread
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <button
                    onClick={() => setShowFilterMenu(!showFilterMenu)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-gray-900 rounded-lg transition-colors border border-purple-300"
                  >
                    <Filter className="w-4 h-4" />
                    <span className="text-sm font-medium">{getFilterLabel(filter)}</span>
                  </button>

                  {showFilterMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-purple-200 rounded-lg shadow-xl z-10">
                      <div className="py-1">
                        {(['all', 'unread', 'PRICE_ALERT', 'OVERVIEW_UPDATE', 'VOLUME_SURGE'] as FilterType[]).map(
                          (filterType) => (
                            <button
                              key={filterType}
                              onClick={() => {
                                setFilter(filterType);
                                setShowFilterMenu(false);
                              }}
                              className={`w-full text-left px-4 py-2 text-sm hover:bg-purple-100 transition-colors ${
                                filter === filterType ? 'text-purple-600 bg-purple-50' : 'text-gray-700'
                              }`}
                            >
                              {getFilterLabel(filterType)}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleMarkAllRead}
                  disabled={unreadCount === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500 text-white rounded-lg transition-colors"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span className="text-sm font-medium">Mark All Read</span>
                </button>

                <button
                  onClick={handleClearAll}
                  disabled={notifications.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:text-gray-500 text-white rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Clear All</span>
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex p-4 bg-purple-100 rounded-full mb-4">
                  <Bell className="w-12 h-12 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No notifications</h3>
                <p className="text-gray-600">
                  {filter === 'unread'
                    ? "You're all caught up! No unread notifications."
                    : 'All quiet for now. New alerts will appear here.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredNotifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onClick={handleMarkAsRead}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="bg-purple-50 px-6 py-4 border-t border-purple-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                Showing {filteredNotifications.length} of {notifications.length} notifications
              </span>
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4" />
                <span>Auto-refresh every 30s</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;