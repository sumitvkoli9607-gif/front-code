// src/components/Dashboard.tsx
import React, { useState } from 'react';
import {
  TrendingUp,
  Bell,
  Newspaper,
  Menu,
  X,
  User,
  Crown,
  LogOut,
  Brain,
  Star,
  CreditCard,
} from 'lucide-react';
import { MarketSection } from './MarketSection';
import { SubscriptionModal } from './SubscriptionModal';   // ✅ new import
import { NewsSection } from './NewsSection';
import AITools from './AITools';
import { PreferencesSection } from './ProfileSection';
import { NotificationDropdown } from './NotificationDropdown';

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */
type Section =
  | 'markets'
  | 'news'
  | 'profile'
  | 'ai-tools'


interface Notification {
  id: string;
  type: 'price_alert' | 'news' | 'system' | 'trade' | 'subscription';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
}

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
  onUserUpdate?: (user: User) => void;
}

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */
export const Dashboard: React.FC<DashboardProps> = ({
  user,
  onSignOut,
}) => {
  const [activeSection, setActiveSection] = useState<Section>('markets');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [notifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'price_alert',
      title: 'BTC Price Alert',
      message:
        'Bitcoin has reached your target price of $65,000. Consider reviewing your position.',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      read: false,
      priority: 'high',
    },
    {
      id: '2',
      type: 'news',
      title: 'Market Update',
      message:
        'Federal Reserve announces new monetary policy changes affecting crypto markets.',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      read: false,
      priority: 'medium',
    },
    {
      id: '3',
      type: 'trade',
      title: 'Trade Executed',
      message:
        'Your limit order for ETH at $3,400 has been successfully executed.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      read: true,
      priority: 'low',
    },
    {
      id: '4',
      type: 'system',
      title: 'Welcome to TradePro',
      message: 'You have full access to all features including AI Tools!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
      read: true,
      priority: 'medium',
    },
  ]);

  const isPremium =
    user.subscription?.active && user.subscription.plan !== 'Free';

  /* -------------------------------------------------------------- */
  /* Navigation builder – inject “Subscription” for free users      */
  /* -------------------------------------------------------------- */
  const navigation = [
    { id: 'markets', name: 'Markets', icon: TrendingUp, available: true },
    { id: 'ai-tools', name: 'AI Tools', icon: Brain, available: true },
    { id: 'news', name: 'News', icon: Newspaper, available: true },
    { id: 'profile', name: 'Settings', icon: User, available: true },
    ...(!isPremium
      ? [
          {
            id: 'subscription' as const,
            name: 'Subscription',
            icon: CreditCard,
            available: true,
          },
        ]
      : []),
  ];

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  /* ------- handlers (unchanged) -------------------------------- */
  const handleUpgradeClick = () => setShowSubscriptionModal(true);

  /* ------- content renderer – remove old inline subscription case - */
  const renderContent = () => {
    switch (activeSection) {
      case 'markets':
        return <MarketSection />;
      case 'news':
        return <NewsSection />;
      case 'ai-tools':
        return <AITools isDarkMode={false} />;
      case 'profile':
        return <PreferencesSection />;
      default:
        return <MarketSection />;
    }
  };

  /* ------- UI (unchanged except for navigation map) ------------- */
  return (
    <div className="min-h-screen bg-gray-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {showSubscriptionModal && (
           <SubscriptionModal
             onClose={() => setShowSubscriptionModal(false)}
             user={user}
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
           <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-white-600 rounded-lg flex items-center justify-center">
              <img 
                src="logo.png" // Replace with your actual PNG image path or URL
                alt="Logo" 
               className="w-9 h-9 object-contain" // Adjust size as needed; object-contain ensures it fits without distortion
                  />
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
                setActiveSection(item.id as Section);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                activeSection === item.id
                  ? 'bg-blue-50 text-blue-600 border border-blue-100'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.name}</span>
            </button>
          ))}
        </nav>

        {/* Bottom upgrade banner (unchanged) */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {!isPremium ? (
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Crown size={20} className="text-yellow-300" />
                <h3 className="font-semibold">Upgrade to Pro</h3>
              </div>
              <p className="text-sm text-blue-100 mb-3">
                Get enhanced AI tools, priority support, and more
              </p>
              <button
                onClick={handleUpgradeClick}
                className="w-full bg-white/20 hover:bg-white/30 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
              >
                Upgrade Now
              </button>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Crown size={20} className="text-yellow-300" />
                <h3 className="font-semibold">Pro Member</h3>
              </div>
              <p className="text-sm text-green-100 mb-3">
                Enjoy all premium features
              </p>
              <button
                onClick={handleUpgradeClick}
                className="w-full bg-white/20 hover:bg-white/30 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
              >
                Manage Subscription
              </button>
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
                  {activeSection.replace('-', ' ')}
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
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 hover:bg-gray-100 rounded-lg relative transition-colors"
                >
                  <Bell size={20} className="text-gray-600" />
                  {unreadNotifications > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </div>
                  )}
                </button>

               <NotificationDropdown
                 isOpen={showNotifications}
                 onClose={() => setShowNotifications(false)}
                 />
              </div>

              {/* User Menu */}
              <div className="flex items-center gap-3 pl-3 border-l border-gray-200 relative group">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border-2 border-blue-200"
                />
                <div className="hidden md:block">
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    {isPremium ? (
                      <>
                        <Crown size={12} className="text-yellow-500" />
                        {user.subscription?.plan} User
                      </>
                    ) : (
                      <>
                        <Star size={12} className="text-blue-500" />
                        Free User
                      </>
                    )}
                  </p>
                </div>

                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-3 border-b border-gray-100">
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <p
                      className={`text-xs mt-1 flex items-center gap-1 ${
                        isPremium ? 'text-green-600' : 'text-blue-600'
                      }`}
                    >
                      {isPremium ? (
                        <>
                          <Crown size={12} className="text-yellow-500" />
                          {user.subscription?.plan} Member
                        </>
                      ) : (
                        <>
                          <Star size={12} />
                          Free Tier
                        </>
                      )}
                    </p>
                  </div>
                  <div className="p-2">
                    {!isPremium && (
                      <button
                        onClick={handleUpgradeClick}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-blue-600 hover:bg-blue-50 rounded-lg transition-colors mb-1"
                      >
                        <Crown size={16} className="text-yellow-500" />
                        <span>Upgrade to Pro</span>
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

        <main className="min-h-screen pb-8">{renderContent()}</main>
      </div>
    </div>
  );
};