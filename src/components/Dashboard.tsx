// src/components/Dashboard.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  Menu,
  X,
  User,
  Crown,
  LogOut,
  Brain,
  Star,
  CreditCard,
  ArrowLeftRight,
  AlertCircle,
  MessageSquare,
  Bell,
  CheckCircle,
} from 'lucide-react';
import { MarketSection } from './MarketSection';
import { SubscriptionModal } from './SubscriptionModal';
import AITools from './AITools';
import TelegramVerification from './ProfileSection'; // Updated import
import PairAnalyzer from './PairAnalyzer';
import axios from 'axios';

// Import the NotificationSystem component
import NotificationSystem from './Notifications';

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */
type Section =
  | 'markets'
  | 'news'
  | 'profile'
  | 'ai-tools'
  | 'pair-analyzer'
  | 'telegram-integration';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  availableBalance?: number;
  totalWithdrawn?: number;
  pendingWithdrawals?: number;
  subscription?: {
    plan: string;
    active: boolean;
    startDate?: string;
    subscriptionId?: string;
  };
}

interface DashboardProps {
  user: User;
  onSignOut: () => void;
  onUserUpdate: (user: User) => void;
}

interface SessionExpiredModalProps {
  isOpen: boolean;
  onSignInAgain: () => void;
}

interface TelegramUser {
  linked: boolean;
  telegramId?: string;
  notificationEnabled: boolean;
  linkedAt?: string;
}

interface TelegramSettings {
  telegramNotifications: boolean;
  priceAlerts: boolean;
  supportResistanceAlerts: boolean;
  majorMovementAlerts: boolean;
  sentimentShiftAlerts: boolean;
  overviewAlerts: boolean;
  alertThreshold: number;
  notificationFrequency: 'realtime' | '5min' | '15min' | 'hourly';
}

/* ------------------------------------------------------------------ */
/* Session Expired Modal Component                                    */
/* ------------------------------------------------------------------ */
const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({
  isOpen,
  onSignInAgain,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Session Expired</h3>
            <p className="text-gray-500 text-sm">Your session has ended</p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <p className="text-gray-700">
            For security reasons, your session has expired. Please sign in again to continue using the platform.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              All unsaved data will be lost. Make sure to save any important changes before signing out.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onSignInAgain}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Sign In Again
          </button>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Main Dashboard Component                                           */
/* ------------------------------------------------------------------ */
export const Dashboard: React.FC<DashboardProps> = ({
  user,
  onSignOut,
  onUserUpdate,
}) => {
  const [activeSection, setActiveSection] = useState<Section>('markets');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showSessionExpired, setShowSessionExpired] = useState(false);
  const [currentUser, setCurrentUser] = useState<User>(user);
  const [token, setToken] = useState<string>('');
  const [telegramSettings, setTelegramSettings] = useState<TelegramSettings>({
    telegramNotifications: false,
    priceAlerts: true,
    supportResistanceAlerts: true,
    majorMovementAlerts: true,
    sentimentShiftAlerts: false,
    overviewAlerts: false,
    alertThreshold: 2.0,
    notificationFrequency: '15min',
  });
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  const [isLoadingTelegram, setIsLoadingTelegram] = useState(true);
  const [, setShowTelegramBanner] = useState(false);

  // Track last activity for auto-logout
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());

  // Session timeout duration (24 hours in milliseconds)
  const SESSION_TIMEOUT = 24 * 60 * 60 * 1000;

  // Update last activity time on user interaction
  const updateActivityTime = useCallback(() => {
    setLastActivityTime(Date.now());
  }, []);

  // Get token from localStorage on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      loadTelegramData(storedToken);
    }
  }, []);

  // Setup activity listeners
  useEffect(() => {
    const handleUserActivity = () => updateActivityTime();
    
    // Listen for user interactions
    window.addEventListener('mousedown', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('scroll', handleUserActivity);
    window.addEventListener('click', handleUserActivity);
    window.addEventListener('touchstart', handleUserActivity);

    return () => {
      window.removeEventListener('mousedown', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('scroll', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
    };
  }, [updateActivityTime]);

  // Telegram API functions
  const loadTelegramData = async (authToken: string) => {
    try {
      setIsLoadingTelegram(true);
      
      // Load telegram status
      const statusResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/telegram/status`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      
      setTelegramUser(statusResponse.data);
      
      // Load notification settings
      const settingsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/notification-settings`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      
      if (settingsResponse.data) {
        // Map backend settings to our TelegramSettings interface
        const mappedSettings: TelegramSettings = {
          telegramNotifications: settingsResponse.data.telegramNotifications || false,
          priceAlerts: settingsResponse.data.priceAlerts || true,
          supportResistanceAlerts: settingsResponse.data.supportResistanceAlerts || true,
          majorMovementAlerts: settingsResponse.data.majorMovementAlerts || true,
          sentimentShiftAlerts: settingsResponse.data.sentimentShiftAlerts || false,
          overviewAlerts: settingsResponse.data.overviewAlerts || false,
          alertThreshold: settingsResponse.data.alertThreshold || 2.0,
          notificationFrequency: settingsResponse.data.notificationFrequency || '15min',
        };
        setTelegramSettings(mappedSettings);
      }

      // Show banner if not linked and is enterprise user
      if (!statusResponse.data.linked && currentUser.subscription?.plan === 'Enterprise') {
        setShowTelegramBanner(true);
      }
    } catch (error) {
      console.error('Error loading Telegram data:', error);
      // If 401/403, session might be expired
      if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
        setShowSessionExpired(true);
      }
    } finally {
      setIsLoadingTelegram(false);
    }
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setShowSessionExpired(true);
      return;
    }

    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedUser = res.data;
      setCurrentUser(updatedUser);
      onUserUpdate(updatedUser);
      
      // Refresh telegram data
      await loadTelegramData(token);
      
    } catch (err: any) {
      console.error('Failed to refresh user:', err);
      
      // Check for 401 Unauthorized or 403 Forbidden
      if (err.response?.status === 401 || err.response?.status === 403) {
        setShowSessionExpired(true);
      }
    }
  };

  // Intercept axios responses to check for session expiration
  useEffect(() => {
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          // Session expired
          setShowSessionExpired(true);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const handleSignInAgain = () => {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('token_timestamp');
    localStorage.removeItem('user');
    
    // Call sign out callback
    onSignOut();
    
    // Close modal
    setShowSessionExpired(false);
  };

  const isPremium =
    currentUser.subscription?.active && currentUser.subscription.plan === 'Enterprise';

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  /* -------------------------------------------------------------- */
  /* Navigation                                                     */
  /* -------------------------------------------------------------- */
  const navigation = [
    { id: 'markets', name: 'Markets', icon: TrendingUp, available: true },
    { id: 'ai-tools', name: 'AI Tools', icon: Brain, available: true },
    { id: 'pair-analyzer', name: 'Pair Analyzer', icon: ArrowLeftRight, available: true },
    { 
      id: 'telegram-integration', 
      name: 'Telegram', 
      icon: MessageSquare, 
      available: true,
      badge: telegramUser?.linked ? '●' : undefined 
    },
    ...(!isPremium
      ? [
          {
            id: 'subscription' as const,
            name: 'Upgrade',
            icon: CreditCard,
            available: true,
          },
        ]
      : []),
  ];

  /* ------- handlers --------------------------------------------- */
  const handleUpgradeClick = () => setShowSubscriptionModal(true);

  // Handle notification click from NotificationSystem
  const handleNotificationClick = (notification: any) => {
    console.log('Notification clicked:', notification);
    // You can add custom logic here based on notification type
    if (notification.type === 'PRICE_ALERT' && notification.data?.symbol) {
      // Navigate to market section or specific pair
      setActiveSection('markets');
      // You could also trigger a specific market view here
    }
  };

  // Check for session expiration periodically
  useEffect(() => {
    const checkSession = () => {
      const token = localStorage.getItem('token');
      const tokenTimestamp = localStorage.getItem('token_timestamp');
      
      if (!token) {
        // No token found, session expired
        setShowSessionExpired(true);
        return;
      }
      
      if (tokenTimestamp) {
        const tokenTime = parseInt(tokenTimestamp, 10);
        const now = Date.now();
        
        // Check if token is older than 24 hours
        if (now - tokenTime > SESSION_TIMEOUT) {
          setShowSessionExpired(true);
        }
      }
      
      // Check inactivity (e.g., 30 minutes of inactivity)
      const inactiveTime = Date.now() - lastActivityTime;
      const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
      
      if (inactiveTime > INACTIVITY_TIMEOUT) {
        setShowSessionExpired(true);
      }
    };

    // Check every minute
    const interval = setInterval(checkSession, 60000);
    
    // Initial check
    checkSession();

    return () => clearInterval(interval);
  }, [lastActivityTime]);

  /* ------- content renderer ------------------------------------- */
  const renderContent = () => {
    switch (activeSection) {
      case 'markets':
        return (
          <div onClick={updateActivityTime}>
            <MarketSection user={currentUser} onUserUpdate={setCurrentUser} />
          </div>
        );
      case 'ai-tools':
        return (
          <div onClick={updateActivityTime}>
            <AITools isDarkMode={false} />
          </div>
        );
      case 'pair-analyzer':
        return (
          <div onClick={updateActivityTime}>
            <PairAnalyzer />
          </div>
        );
      case 'telegram-integration':
        return (
          <div onClick={updateActivityTime} className="bg-gray-50 min-h-screen">
            <TelegramVerification />
          </div>
        );
      default:
        return (
          <div onClick={updateActivityTime}>
            <MarketSection user={currentUser} onUserUpdate={setCurrentUser} />
          </div>
        );
    }
  };

  /* ------- Telegram Banner Component ----------------------------- */

  // Telegram status indicator for sidebar
  const TelegramStatusIndicator = () => {
    if (isLoadingTelegram) {
      return (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gray-300" />
          <span className="text-xs font-medium text-gray-700">Loading...</span>
          <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin ml-auto" />
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              telegramUser?.linked ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
            }`} />
            <span className="text-xs font-medium text-gray-700">
              Telegram: {telegramUser?.linked ? 'Connected' : 'Not Connected'}
            </span>
          </div>
        </div>
        
        {telegramUser?.linked && (
          <div className="text-xs text-gray-500 pl-4 space-y-1">
            <div className="flex items-center gap-1">
              <MessageSquare size={10} />
              <span>ID: {telegramUser.telegramId?.substring(0, 8)}...</span>
            </div>
            <div className="flex items-center gap-1">
              <Bell size={10} />
              <span>Notifications: {telegramSettings.telegramNotifications ? 'On' : 'Off'}</span>
            </div>
            <div className="text-xs text-gray-400 pt-1">
              Linked {formatDate(telegramUser.linkedAt)}
            </div>
          </div>
        )}
        
        {!telegramUser?.linked && (
          <button
            onClick={() => setActiveSection('telegram-integration')}
            className="w-full text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 py-1 px-2 rounded transition-colors flex items-center justify-center gap-1"
          >
            <MessageSquare size={10} />
            Connect Telegram
          </button>
        )}
      </div>
    );
  };

  /* ------------------ UI ---------------------------------------- */
  return (
    <div className="min-h-screen bg-gray-50" onClick={updateActivityTime}>
      {/* Session Expired Modal */}
      <SessionExpiredModal
        isOpen={showSessionExpired}
        onSignInAgain={handleSignInAgain}
      />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {showSubscriptionModal && (
        <SubscriptionModal
          onClose={() => setShowSubscriptionModal(false)}
          user={currentUser}
          onSuccess={() => {
            setShowSubscriptionModal(false);
            refreshUser();
          }}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-transform duration-300 ease-in-out z-50`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <div className="w-9 h-9 flex items-center justify-center text-white font-bold text-lg">
                IX
              </div>
            </div>
            <div>
              <h1 className="font-bold text-xl text-gray-900">InsightX</h1>
              <p className="text-xs text-gray-500">Financial Dashboard</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-gray-200">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium ${
              isPremium
                ? 'text-green-600 bg-green-50 border-green-200'
                : 'text-blue-600 bg-blue-50 border-blue-200'
            }`}
          >
            {isPremium ? (
              <Crown size={12} className="text-yellow-500" />
            ) : (
              <Star size={12} />
            )}
            {isPremium ? `${user.subscription?.plan} Plan` : 'Free Tier'}
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'subscription') {
                  handleUpgradeClick();
                } else {
                  setActiveSection(item.id as Section);
                  setSidebarOpen(false);
                  updateActivityTime();
                }
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                activeSection === item.id
                  ? 'bg-blue-50 text-blue-600 border border-blue-100'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              } ${item.id === 'subscription' ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:from-blue-100 hover:to-indigo-100' : ''}`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.name}</span>
              {item.id === 'subscription' && !isPremium && (
                <span className="ml-auto animate-pulse">
                  🔥
                </span>
              )}
              {item.id === 'telegram-integration' && telegramUser?.linked && (
                <span className="ml-auto text-green-500 text-xs animate-pulse">
                  ●
                </span>
              )}
              {item.badge && (
                <span className="ml-auto text-green-500 text-xs animate-pulse">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Telegram Connection Status in Sidebar */}
        <div className="px-4 py-3 border-t border-gray-200 mt-4">
          <TelegramStatusIndicator />
        </div>

        {/* Bottom upgrade banner */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {!isPremium ? (
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Crown size={20} className="text-yellow-300" />
                <h3 className="font-semibold">Upgrade to Enterprise</h3>
              </div>
              <p className="text-sm text-blue-100 mb-3">
                Get real-time alerts, advanced AI tools, and priority support
              </p>
              <button
                onClick={handleUpgradeClick}
                className="w-full bg-white/20 hover:bg-white/30 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
              >
                Upgrade Now
              </button>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Crown size={20} className="text-yellow-300" />
                <h3 className="font-semibold">Enterprise Member</h3>
              </div>
              <p className="text-sm text-green-100 mb-3">
                Enjoy all premium features including real-time Telegram alerts
              </p>
              <div className="flex items-center gap-2 text-xs">
                <div className={`w-2 h-2 rounded-full ${telegramUser?.linked ? 'bg-yellow-400 animate-pulse' : 'bg-gray-300'}`} />
                <span>Telegram: {telegramUser?.linked ? 'Connected' : 'Not connected'}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="md:ml-64">
        <header className="bg-white shadow-sm border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu size={20} />
              </button>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 capitalize">
                  {activeSection === 'telegram-integration' 
                    ? 'Telegram Integration' 
                    : activeSection.replace('-', ' ')}
                </h2>
                <p className="text-sm text-gray-500">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Telegram Status Badge */}
              {!isLoadingTelegram && (
                <button
                  onClick={() => setActiveSection('telegram-integration')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all hover:shadow-sm ${
                    telegramUser?.linked
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border-green-200 hover:from-green-100 hover:to-emerald-100'
                      : 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 border-blue-200 hover:from-blue-100 hover:to-indigo-100'
                  }`}
                >
                  {telegramUser?.linked ? (
                    <CheckCircle size={14} className="text-green-600" />
                  ) : (
                    <MessageSquare size={14} className="text-blue-600" />
                  )}
                  <span>
                    {telegramUser?.linked ? '📱 Connected' : '🔗 Connect Telegram'}
                  </span>
                  {!telegramUser?.linked && isPremium && (
                    <span className="animate-pulse">✨</span>
                  )}
                </button>
              )}

              {/* NotificationSystem Component - Integrated */}
              {token && (
                <div className="relative">
                  <NotificationSystem
                    token={token}
                    userId={currentUser.id}
                    onNotificationClick={handleNotificationClick}
                    autoRefresh={true}
                    refreshInterval={30000} // 30 seconds
                    maxNotifications={50}
                  />
                </div>
              )}

              {/* User Menu */}
              <div className="flex items-center gap-3 pl-3 border-l border-gray-200 relative group">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-medium text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block">
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    {isPremium ? (
                      <>
                        <Crown size={12} className="text-yellow-500" />
                        Enterprise User
                      </>
                    ) : (
                      <>
                        <Star size={12} className="text-blue-500" />
                        Free Tier
                      </>
                    )}
                  </p>
                </div>

                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-medium text-lg">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className={`flex items-center gap-2 px-2 py-1 rounded-lg ${isPremium ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                        {isPremium ? (
                          <>
                            <Crown size={14} className="text-yellow-500" />
                            <span className="text-sm font-medium">Enterprise Plan Active</span>
                          </>
                        ) : (
                          <>
                            <Star size={14} />
                            <span className="text-sm font-medium">Free Tier</span>
                          </>
                        )}
                      </div>
                      {telegramUser?.linked && (
                        <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-green-50 text-green-700">
                          <CheckCircle size={14} className="text-green-600" />
                          <div className="flex-1">
                            <span className="text-sm font-medium">Telegram Connected</span>
                            <p className="text-xs text-green-600">
                              {telegramSettings.telegramNotifications ? 'Alerts enabled' : 'Alerts disabled'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => setActiveSection('telegram-integration')}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors mb-1"
                    >
                      <MessageSquare size={16} />
                      <span>Telegram Settings</span>
                    </button>
                    {!isPremium && (
                      <button
                        onClick={handleUpgradeClick}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-blue-600 hover:bg-blue-50 rounded-lg transition-colors mb-1"
                      >
                        <Crown size={16} className="text-yellow-500" />
                        <span>Upgrade to Enterprise</span>
                      </button>
                    )}
                    <button
                      onClick={onSignOut}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="min-h-screen">{renderContent()}</main>

        {/* Footer with Telegram info */}
        <footer className="bg-white border-t border-gray-200 p-4 mt-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Get market alerts on{' '}
                  <a 
                    href="https://t.me/CryptoInsightProBot " 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Telegram
                  </a>
                </span>
              </div>
              {!telegramUser?.linked && (
                <button
                  onClick={() => setActiveSection('telegram-integration')}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-1 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Connect Now
                </button>
              )}
            </div>
            <div className="text-sm text-gray-500">
              © {new Date().getFullYear()} InsightX. All rights reserved.
              {isPremium && telegramUser?.linked && telegramSettings.telegramNotifications && (
                <span className="ml-2 text-green-600">⚡ Real-time alerts active</span>
              )}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};