// NotificationSystem.tsx - UPDATED VERSION (Only RSI, Breakout, Liquidity)
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Bell, X, AlertCircle,
  Zap,
  MessageSquare, Info,
  Check, 
  Activity as ActivityIcon,
  Clock,
  ZapOff,
  User,
  Crown,
  Database,
  WifiOff,
  Waves,
  Building,
  BarChart,
  Settings,
  TrendingUp,
} from 'lucide-react';
import notificationSound from './notification-sound.mp3';

/* -------------- TYPES -------------- */
interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'BREAKOUT_ALERT' | 'SUPPORT_BREAKOUT' | 'RESISTANCE_BREAKOUT' | 
         'STRONG_BREAKOUT' | 'MAJOR_BREAKOUT' | 'RSI_OVERBOUGHT' | 
         'RSI_OVERSOLD' | 'RSI_DIVERGENCE' |
         'LIQUIDITY_ZONE_APPROACH' | 'LIQUIDITY_ZONE_BREAK' | 'LIQUIDITY_SWEEP' |
         'INSTITUTIONAL_LIQUIDITY' | 'HIGH_VOLUME_NODE' | 'LIMIT_REACHED' | 'TEST' | string;
  data?: {
    symbol?: string;
    price?: number;
    level?: number;
    breakoutType?: 'SUPPORT_BREAKOUT' | 'RESISTANCE_BREAKOUT';
    confidence?: number;
    timestamp?: number;
    strength?: string;
    breakoutPercent?: number;
    volumeMultiplier?: number;
    rsiValue?: number;
    divergenceType?: 'bearish_divergence' | 'bullish_divergence';
    divergenceStrength?: number;
    limitReached?: boolean;
    currentCount?: number;
    limit?: number;
    isFreeUser?: boolean;
    webNotificationId?: string;
    
    // Liquidity zone specific
    zone?: {
      price: number;
      strength: number;
      type: string;
      volumeMultiplier?: number;
      [key: string]: any;
    };
    distance?: number;
    risk?: 'low' | 'medium' | 'high';
    
    // Institutional liquidity
    zones?: Array<any>;
    
    // High volume node
    node?: {
      price: number;
      volumeMultiplier: number;
      [key: string]: any;
    };
    [key: string]: any;
  };
  priority: 'low' | 'medium' | 'high' | string;
  icon?: string;
  read: boolean;
  createdAt: string;
}

interface NotificationResponse {
  notifications: Notification[];
  unreadCount: number;
  total: number;
  typeStats?: Array<{ _id: string; count: number }>;
}

interface NotificationUsage {
  subscription: {
    plan: string;
    active: boolean;
    isFreeUser: boolean;
  };
  webNotifications: {
    today: number;
    limit: number | 'unlimited';
    remaining: number | 'unlimited';
    percentage: number;
  };
  telegramNotifications: {
    linked: boolean;
    today: number;
    limit: number | 'unlimited';
    remaining: number | 'unlimited';
    percentage: number;
  };
  resetTime: string;
  resetInHours: number;
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
  refreshInterval = 30000,
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
  const [notificationStats, setNotificationStats] = useState<Array<{ type: string; count: number }>>([]);
  const [notificationUsage, setNotificationUsage] = useState<NotificationUsage | null>(null);
  const [isUsageLoading, setIsUsageLoading] = useState(false);
  const [showUsagePanel, setShowUsagePanel] = useState(false);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState<any>(null);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);

  /* ---- refs ---- */
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const notificationSoundRef = useRef<HTMLAudioElement | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const previousNotificationsRef = useRef<Set<string>>(new Set());
  const lastLimitCheckRef = useRef<number>(0);

  /* ---- sound init ---- */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      notificationSoundRef.current = new Audio(notificationSound);
      notificationSoundRef.current.volume = 0.5;
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
      
      const safeNotifications = Array.isArray(data.notifications) ? data.notifications : [];
      
      // Filter to only show allowed notification types
      const allowedNotifications = safeNotifications.filter(n => 
        n?.type && (
          n.type.includes('BREAKOUT') ||
          n.type.includes('RSI') ||
          n.type.includes('LIQUIDITY') ||
          n.type === 'HIGH_VOLUME_NODE' ||
          n.type === 'INSTITUTIONAL_LIQUIDITY' ||
          n.type === 'LIMIT_REACHED' ||
          n.type === 'TEST'
        )
      );
      
      const currentNotificationIds = new Set(allowedNotifications.map(n => n?._id).filter(Boolean));
      
      // Find new notifications
      const newNotifications = allowedNotifications.filter(
        n => n?._id && !previousNotificationsRef.current.has(n._id) && !n.read
      );
      
      // Check for limit reached notification
      const hasLimitNotification = allowedNotifications.some(
        n => n.type === 'LIMIT_REACHED' && !n.read
      );
      setIsLimitReached(hasLimitNotification);
      
      // Update previous notifications ref
      previousNotificationsRef.current = currentNotificationIds;
      
      // Limit the number of notifications displayed
      const limitedNotifications = allowedNotifications
        .filter(Boolean)
        .slice(0, maxNotifications);
      
      setNotifications(limitedNotifications);
      setUnreadCount(data.unreadCount || 0);
      
      // Update notification stats (only for allowed types)
      if (data.typeStats) {
        const filteredStats = data.typeStats.filter(stat => 
          stat._id?.includes('BREAKOUT') ||
          stat._id?.includes('RSI') ||
          stat._id?.includes('LIQUIDITY') ||
          stat._id === 'HIGH_VOLUME_NODE' ||
          stat._id === 'INSTITUTIONAL_LIQUIDITY'
        );
        
        setNotificationStats(filteredStats.map(stat => ({
          type: stat._id || 'unknown',
          count: stat.count || 0
        })));
      }
      
      // Play sound for new notifications if dropdown is closed
      if (newNotifications.length > 0) {
        setHasNewNotification(true);
        
        if (!isOpen) {
          try {
            notificationSoundRef.current?.play().catch(() => {
              console.log('Audio play failed, might be due to autoplay restrictions');
            });
          } catch (e) {
            console.log('Audio play error:', e);
          }
        }
      }
      
    } catch (e: any) {
      setError(e.message || 'Failed to fetch notifications');
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [token, maxNotifications, isOpen]);

  const fetchNotificationUsage = useCallback(async () => {
    if (!token || !isOpen) return;
    
    const now = Date.now();
    if (now - lastLimitCheckRef.current < 60000) return;
    
    setIsUsageLoading(true);
    lastLimitCheckRef.current = now;
    
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/notification-usage`,
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (!res.ok) {
        if (res.status === 404) {
          console.log('Notification usage endpoint not found, skipping');
          return;
        }
        throw new Error(res.status + '');
      }
      const data: NotificationUsage = await res.json();
      setNotificationUsage(data);
      
      // Check if free user has reached limits
      if (data.subscription.isFreeUser) {
        const webRemaining = data.webNotifications.remaining;
        const telegramRemaining = data.telegramNotifications.remaining;
        
        if (webRemaining === 0 || telegramRemaining === 0) {
          setIsLimitReached(true);
        }
      }
    } catch (e: any) {
      console.error('Failed to fetch notification usage:', e);
      // Don't show error to user for this
    } finally {
      setIsUsageLoading(false);
    }
  }, [token, isOpen]);

  const fetchNotificationSettings = useCallback(async () => {
    if (!token) return;
    
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/notification-settings`,
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (res.ok) {
        const data = await res.json();
        setNotificationSettings(data);
      }
    } catch (e) {
      console.error('Failed to fetch notification settings:', e);
    }
  }, [token]);

  const updateNotificationSetting = useCallback(async (key: string, value: boolean) => {
    if (!token || !notificationSettings) return;
    
    try {
      const updates = { [key]: value };
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/notification-settings`,
        { 
          method: 'PUT',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updates)
        }
      );
      if (res.ok) {
        setNotificationSettings((prev: any) => ({
          ...prev,
          [key]: value
        }));
      }
    } catch (e) {
      console.error('Failed to update notification setting:', e);
    }
  }, [token, notificationSettings]);

  const markAsRead = useCallback(
    async (id: string) => {
      if (!id) return;
      
      const wasRead = notifications.find(n => n?._id === id)?.read;
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
        setNotifications(prev => prev.map(n => (n?._id === id ? { ...n, read: true } : n)));
        setUnreadCount(prev => Math.max(0, prev - 1));
        
        const notification = notifications.find(n => n?._id === id);
        if (notification?.type === 'LIMIT_REACHED') {
          setIsLimitReached(false);
        }
      } catch (e) {
        console.error('Failed to mark notification as read:', e);
      }
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
      setIsLimitReached(false);
    } catch (e) {
      console.error('Failed to mark all as read:', e);
    }
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
    
    fetchNotifications();
    pollingRef.current = setInterval(fetchNotifications, refreshInterval);
    
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [pollingEnabled, refreshInterval, fetchNotifications, token]);

  /* ---- initial load ---- */
  useEffect(() => {
    if (token) {
      fetchNotifications();
      fetchNotificationSettings();
    }
  }, [token, fetchNotifications, fetchNotificationSettings]);

  /* ---- Reset new notification indicator when dropdown is opened ---- */
  useEffect(() => {
    if (isOpen) {
      setHasNewNotification(false);
      fetchNotificationUsage();
    }
  }, [isOpen, fetchNotificationUsage]);

  /* ---- UI helpers ---- */
  const iconMap: Record<string, React.ReactNode> = {
    '🚨': <AlertCircle size={16} className="text-red-500" />,
    '⚡': <Zap size={16} className="text-yellow-500" />,
    '📈': <TrendingUp size={16} className="text-green-500" />,
    '📊': <ActivityIcon size={16} className="text-indigo-500" />,
    '🎭': <MessageSquare size={16} className="text-purple-500" />,
    '🌊': <Waves size={16} className="text-blue-500" />,
    '🏦': <Building size={16} className="text-green-600" />,
    'H': <BarChart size={16} className="text-purple-500" />,
    '⚠️': <AlertCircle size={16} className="text-yellow-500" />,
    '📨': <Info size={16} className="text-gray-500" />,
    '🧪': <AlertCircle size={16} className="text-orange-500" />,
  };

  const getIcon = (n: Notification) => {
    if (!n?.type) return '📨';
    
    switch (n.type) {
      case 'BREAKOUT_ALERT':
      case 'SUPPORT_BREAKOUT':
      case 'RESISTANCE_BREAKOUT':
      case 'STRONG_BREAKOUT':
      case 'MAJOR_BREAKOUT':
        return n.data?.strength === 'major' ? '🚨' : n.data?.strength === 'strong' ? '⚡' : '📈';
      case 'RSI_OVERBOUGHT':
      case 'RSI_OVERSOLD':
      case 'RSI_DIVERGENCE':
        return '📊';
      case 'LIQUIDITY_ZONE_APPROACH':
      case 'LIQUIDITY_ZONE_BREAK':
      case 'LIQUIDITY_SWEEP':
        return '🌊';
      case 'INSTITUTIONAL_LIQUIDITY':
        return '🏦';
      case 'HIGH_VOLUME_NODE':
        return 'H';
      case 'LIMIT_REACHED':
        return '⚠️';
      case 'TEST':
        return '🧪';
      default:
        return n.icon || '📨';
    }
  };

  const getDisplayIcon = (n: Notification) => {
    if (!n) return <Bell size={16} className="text-gray-500" />;
    
    const iconChar = getIcon(n);
    return iconMap[iconChar] || <Bell size={16} className="text-gray-500" />;
  };

  const priorityColor = (p: string) => {
    switch (p) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
    }
  };

  const formatDate = (d: string) => {
    if (!d) return 'Just now';
    
    try {
      const diff = Date.now() - new Date(d).getTime();
      const mins = Math.floor(diff / 60000);
      const hrs = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins}m ago`;
      if (hrs < 24) return `${hrs}h ago`;
      if (days < 7) return `${days}d ago`;
      return new Date(d).toLocaleDateString();
    } catch {
      return 'Just now';
    }
  };

  /* ---- Helper to extract data for display ---- */
  const getDisplayData = (n: Notification) => {
    if (!n) return {};
    
    const data = n.data || {};
    
    let displayPrice = data.price;
    
    let displaySymbol = data.symbol;
    if (!displaySymbol && n.title) {
      const symbolMatch = n.title.match(/(BTC|ETH|BNB|SOL|XRP|ADA|DOT|MATIC|DOGE|LTC|SHIB|PEPE|WIF|BONK|SAND|AXS|ENJ|GALA|IMX|RNDR|KAS|VET|ALGO|EGLD|XTZ|ZEN|HNT|QNT|FTM|RUNE|CRV|SNX|COMP|AAVE|MKR|STORJ|ZIL|THETA|HBAR|ONE)\//);
      if (symbolMatch) {
        displaySymbol = symbolMatch[0];
      }
    }
    
    return {
      price: displayPrice,
      symbol: displaySymbol,
      confidence: data.confidence,
      rsiValue: data.rsiValue,
      volumeMultiplier: data.volumeMultiplier,
      strength: data.strength,
      breakoutType: data.breakoutType,
      breakoutPercent: data.breakoutPercent,
      timestamp: data.timestamp,
      divergenceType: data.divergenceType,
      divergenceStrength: data.divergenceStrength,
      limitReached: data.limitReached,
      currentCount: data.currentCount,
      limit: data.limit,
      isFreeUser: data.isFreeUser,
      webNotificationId: data.webNotificationId,
      // Liquidity data
      zone: data.zone,
      distance: data.distance,
      risk: data.risk,
      zones: data.zones,
      node: data.node,
    };
  };

  /* ---- Type checking helpers ---- */
  const isBreakoutNotification = (n: Notification) => {
    return n?.type?.includes?.('BREAKOUT') || false;
  };

  const isRSINotification = (n: Notification) => {
    return n?.type?.includes?.('RSI') || false;
  };

  const isLimitReachedNotification = (n: Notification) => {
    return n?.type === 'LIMIT_REACHED' || false;
  };

  const isLiquidityNotification = (n: Notification) => {
    return n?.type?.includes?.('LIQUIDITY') || false;
  };

  const isInstitutionalNotification = (n: Notification) => {
    return n?.type?.includes?.('INSTITUTIONAL') || false;
  };

  const isVolumeNodeNotification = (n: Notification) => {
    return n?.type === 'HIGH_VOLUME_NODE' || false;
  };

  /* ---- Notification settings panel ---- */
  const renderSettingsPanel = () => (
    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center">
          <Settings size={14} className="mr-2" />
          Notification Settings
        </h4>
        <button
          onClick={() => setShowSettingsPanel(false)}
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Close
        </button>
      </div>
      
      {notificationSettings ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 dark:text-gray-300">Breakout Alerts</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationSettings.breakoutAlerts !== false}
                onChange={e => updateNotificationSetting('breakoutAlerts', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 dark:text-gray-300">RSI Alerts</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationSettings.rsiAlerts !== false}
                onChange={e => updateNotificationSetting('rsiAlerts', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 dark:text-gray-300">Liquidity Zone Alerts</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationSettings.liquidityZoneAlerts !== false}
                onChange={e => updateNotificationSetting('liquidityZoneAlerts', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 dark:text-gray-300">Institutional Alerts</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationSettings.institutionalLiquidityAlerts !== false}
                onChange={e => updateNotificationSetting('institutionalLiquidityAlerts', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 dark:text-gray-300">Volume Node Alerts</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationSettings.highVolumeNodeAlerts !== false}
                onChange={e => updateNotificationSetting('highVolumeNodeAlerts', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 dark:text-gray-300">Telegram Notifications</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationSettings.telegramNotifications !== false}
                onChange={e => updateNotificationSetting('telegramNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center">Loading settings...</p>
      )}
    </div>
  );

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
        {hasNewNotification && (
          <span className="absolute top-0 right-0 h-5 w-5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-red-600 animate-ping opacity-75"></span>
            <span className="absolute inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-600">
              <span className="text-xs font-bold text-white">!</span>
            </span>
          </span>
        )}
        {isLimitReached && !hasNewNotification && (
          <span className="absolute top-0 right-0 h-5 w-5">
            <span className="absolute inline-flex items-center justify-center h-5 w-5 rounded-full bg-yellow-500">
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
                  onClick={() => setShowSettingsPanel(!showSettingsPanel)}
                  className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    showSettingsPanel ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'
                  }`}
                  title="Settings"
                >
                  <Settings size={18} />
                </button>
                <button
                  onClick={() => setShowUsagePanel(!showUsagePanel)}
                  className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    showUsagePanel ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'
                  }`}
                  title="Usage"
                >
                  <Database size={18} />
                </button>
                <button
                  onClick={markAllAsRead}
                  disabled={!unreadCount}
                  className={`p-1.5 rounded ${!unreadCount ? 'text-gray-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500'}`}
                  title="Mark all as read"
                >
                  <Check size={18} />
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

            {/* Notification settings panel */}
            {showSettingsPanel && renderSettingsPanel()}

            {/* Notification stats */}
            {!showSettingsPanel && notificationStats.length > 0 && !showUsagePanel && (
              <div className="mt-3 flex flex-wrap gap-1">
                {notificationStats.slice(0, 5).map((stat, idx) => (
                  <span 
                    key={idx}
                    className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded"
                  >
                    {stat.type.replace(/_/g, ' ')}: {stat.count}
                  </span>
                ))}
              </div>
            )}

            {/* Notification usage panel */}
            {!showSettingsPanel && showUsagePanel && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center">
                    <User size={14} className="mr-2" />
                    Notification Usage
                  </h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    notificationUsage?.subscription.isFreeUser 
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' 
                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  }`}>
                    {notificationUsage?.subscription.isFreeUser ? 'Free Tier' : 'Enterprise'}
                  </span>
                </div>
                
                {isUsageLoading ? (
                  <div className="text-center py-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : notificationUsage ? (
                  <div className="space-y-3">
                    {/* Web notifications usage */}
                    <div>
                      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                        <span>Web Notifications</span>
                        <span className="font-medium">
                          {notificationUsage.webNotifications.today}/{notificationUsage.webNotifications.limit}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            notificationUsage.webNotifications.percentage >= 90 
                              ? 'bg-red-500' 
                              : notificationUsage.webNotifications.percentage >= 75 
                              ? 'bg-yellow-500' 
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(100, notificationUsage.webNotifications.percentage)}%` }}
                        />
                      </div>
                    </div>

                    {/* Telegram notifications usage */}
                    <div>
                      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                        <span className="flex items-center">
                          <MessageSquare size={10} className="mr-1" />
                          Telegram
                          {!notificationUsage.telegramNotifications.linked && (
                            <span className="ml-2 text-xs text-red-500">(Not linked)</span>
                          )}
                        </span>
                        <span className="font-medium">
                          {notificationUsage.telegramNotifications.today}/{notificationUsage.telegramNotifications.limit}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            notificationUsage.telegramNotifications.percentage >= 90 
                              ? 'bg-red-500' 
                              : notificationUsage.telegramNotifications.percentage >= 75 
                              ? 'bg-yellow-500' 
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(100, notificationUsage.telegramNotifications.percentage)}%` }}
                        />
                      </div>
                    </div>

                    {/* Reset time */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center">
                        <Clock size={10} className="mr-1" />
                        Resets in
                      </span>
                      <span className="font-medium">
                        {Math.round(notificationUsage.resetInHours)}h
                      </span>
                    </div>

                    {/* Upgrade prompt for free users */}
                    {notificationUsage.subscription.isFreeUser && (
                      <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                        <div className="flex items-center text-yellow-700 dark:text-yellow-300">
                          <Crown size={12} className="mr-2" />
                          <span className="text-xs font-medium">Upgrade to Enterprise</span>
                        </div>
                        <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                          Get unlimited notifications and advanced features
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 text-center">Unable to load usage data</p>
                )}
              </div>
            )}

            {/* Auto-refresh toggle */}
            {!showSettingsPanel && !showUsagePanel && (
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
            )}
          </div>

          {/* Notification list */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading notifications...</p>
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <WifiOff size={32} className="text-red-500 mx-auto" />
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
                {notifications
                  .filter(n => n)
                  .map(n => {
                    if (!n?._id) return null;
                    
                    const displayData = getDisplayData(n);
                    const isLimitNotification = isLimitReachedNotification(n);
                    const isBreakout = isBreakoutNotification(n);
                    const isRSI = isRSINotification(n);
                    const isLiquidity = isLiquidityNotification(n);
                    const isInstitutional = isInstitutionalNotification(n);
                    const isVolumeNode = isVolumeNodeNotification(n);
                    
                    return (
                      <div
                        key={n._id}
                        data-id={n._id}
                        ref={el => {
                          if (n._id && el) {
                            cardRefs.current[n._id] = el;
                          }
                        }}
                        onClick={() => !n.read && n._id && markAsRead(n._id)}
                        className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-750 relative ${
                          !n.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        } ${isLimitNotification ? 'border-l-4 border-l-yellow-500' : ''}`}
                      >
                        {!n.read && (
                          <span className="absolute inset-0 rounded-md animate-pulse pointer-events-none" />
                        )}

                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-0.5">{getDisplayIcon(n)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className={`text-sm font-semibold truncate ${n.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                                {n.title || 'Untitled Notification'}
                              </h4>
                              <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityColor(n.priority || 'medium')}`}>
                                {n.priority || 'medium'}
                              </span>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {n.message || 'No message'}
                            </p>

                            {isLimitNotification && (
                              <div className="mb-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                                <div className="flex items-center text-yellow-700 dark:text-yellow-300">
                                  <ZapOff size={12} className="mr-2" />
                                  <span className="text-xs font-medium">Daily Limit Reached</span>
                                </div>
                                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                                  You've used {displayData.currentCount || 0}/{displayData.limit || 25} notifications today
                                </p>
                              </div>
                            )}

                            {/* Breakout notification data */}
                            {isBreakout && (
                              <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2 flex-wrap gap-2">
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
                                {displayData.breakoutPercent !== undefined && (
                                  <span className={displayData.breakoutPercent >= 0 ? 'text-green-600 dark:text-green-400 font-medium' : 'text-red-600 dark:text-red-400 font-medium'}>
                                    {displayData.breakoutPercent > 0 ? '+' : ''}
                                    {displayData.breakoutPercent.toFixed(1)}%
                                  </span>
                                )}
                                {displayData.strength && (
                                  <span className={`font-medium ${
                                    displayData.strength === 'major' ? 'text-red-600 dark:text-red-400' :
                                    displayData.strength === 'strong' ? 'text-yellow-600 dark:text-yellow-400' :
                                    'text-blue-600 dark:text-blue-400'
                                  }`}>
                                    {displayData.strength}
                                  </span>
                                )}
                                {displayData.volumeMultiplier !== undefined && (
                                  <span className="text-orange-600 dark:text-orange-400">
                                    {displayData.volumeMultiplier.toFixed(1)}x vol
                                  </span>
                                )}
                              </div>
                            )}

                            {/* RSI notification data */}
                            {isRSI && (
                              <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2 flex-wrap gap-2">
                                {displayData.symbol && (
                                  <span className="font-medium bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                    {displayData.symbol}
                                  </span>
                                )}
                                {displayData.rsiValue !== undefined && (
                                  <>
                                    <span className="font-medium">
                                      RSI: {displayData.rsiValue}
                                    </span>
                                    {displayData.rsiValue >= 70 && (
                                      <span className="text-red-600 dark:text-red-400 font-medium">
                                        ⚠️ Overbought
                                      </span>
                                    )}
                                    {displayData.rsiValue <= 30 && (
                                      <span className="text-green-600 dark:text-green-400 font-medium">
                                        ⚠️ Oversold
                                      </span>
                                    )}
                                  </>
                                )}
                                {displayData.divergenceType && (
                                  <span className="text-purple-600 dark:text-purple-400 font-medium">
                                    {displayData.divergenceType?.replace('_', ' ') || ''} Divergence
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Liquidity notification data */}
                            {isLiquidity && (
                              <div className="text-xs text-gray-500 mb-2 flex flex-wrap gap-2">
                                {displayData.symbol && (
                                  <span className="font-medium bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                    {displayData.symbol}
                                  </span>
                                )}
                                {displayData.zone && (
                                  <span className="text-blue-600 dark:text-blue-400 font-medium">
                                    Zone: ${displayData.zone.price.toLocaleString()}
                                  </span>
                                )}
                                {displayData.distance !== undefined && (
                                  <span>
                                    Distance: {(displayData.distance * 100).toFixed(2)}%
                                  </span>
                                )}
                                {displayData.risk && (
                                  <span className={`font-medium ${
                                    displayData.risk === 'high' ? 'text-red-600 dark:text-red-400' :
                                    displayData.risk === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                                    'text-green-600 dark:text-green-400'
                                  }`}>
                                    Risk: {displayData.risk}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Institutional liquidity notification data */}
                            {isInstitutional && (
                              <div className="text-xs text-gray-500 mb-2 flex flex-wrap gap-2">
                                {displayData.symbol && (
                                  <span className="font-medium bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                    {displayData.symbol}
                                  </span>
                                )}
                                <span className="text-green-600 dark:text-green-400 font-medium">
                                  Smart money activity
                                </span>
                                {displayData.zones && displayData.zones.length > 0 && (
                                  <span>
                                    Zones: {displayData.zones.length}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* High volume node notification data */}
                            {isVolumeNode && (
                              <div className="text-xs text-gray-500 mb-2 flex flex-wrap gap-2">
                                {displayData.symbol && (
                                  <span className="font-medium bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                    {displayData.symbol}
                                  </span>
                                )}
                                {displayData.node && (
                                  <>
                                    <span className="text-purple-600 dark:text-purple-400 font-medium">
                                      Node: ${displayData.node.price.toLocaleString()}
                                    </span>
                                    {displayData.node.volumeMultiplier && (
                                      <span>
                                        Volume: {displayData.node.volumeMultiplier.toFixed(1)}x
                                      </span>
                                    )}
                                  </>
                                )}
                              </div>
                            )}

                            <div className="flex items-center justify-between mt-3">
                              <span className="text-xs text-gray-400">{formatDate(n.createdAt)}</span>
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
              <div className="flex items-center justify-between">
                <button 
                  onClick={fetchNotificationUsage}
                  className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 flex items-center"
                  title="Refresh usage stats"
                >
                  <Database size={14} className="mr-1" />
                  Usage
                </button>
                <button 
                  onClick={fetchNotificationSettings}
                  className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 flex items-center"
                  title="Settings"
                >
                  <Settings size={14} className="mr-1" />
                  Settings
                </button>
                <button onClick={fetchNotifications} className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                  Refresh
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationSystem;