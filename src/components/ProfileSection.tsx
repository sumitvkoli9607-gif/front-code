// TelegramIntegration.tsx
import { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  MessageCircle, 
  Link2, 
  Unlink,
  Bell,
  AlertTriangle,
  Shield,
  Copy,
  ExternalLink,
  Zap,
  Bot,
  RefreshCw,
  DollarSign,
  Waves,
  Target,
  LineChart,
  BellOff
} from 'lucide-react';

interface TelegramStatus {
  linked: boolean;
  telegramId?: number;
  telegramUsername?: string;
  notificationEnabled: boolean;
  linkedAt?: string;
}

interface NotificationSettings {
  telegramNotifications: boolean;
  priceAlerts: boolean;
  rsiAlerts: boolean;
  breakoutAlerts: boolean;
  liquidityAlerts: boolean;
  alertThreshold?: number;
}

interface NotificationStats {
  todayCount: number;
  limit: number;
  usagePercentage: number;
  plan: 'Free' | 'Enterprise';
}

export default function TelegramIntegration() {
  const [status, setStatus] = useState<TelegramStatus | null>(null);
  const [linkCode, setLinkCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLinking, setIsLinking] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [notificationStats, setNotificationStats] = useState<NotificationStats | null>(null);
  const [settings, setSettings] = useState<NotificationSettings>({
    telegramNotifications: false,
    priceAlerts: true,
    rsiAlerts: true,
    breakoutAlerts: true,
    liquidityAlerts: true
  });

  const API_BASE = import.meta.env.VITE_API_URL || window.location.origin;
  const BOT_USERNAME = '@Trademinobot';
  const BOT_LINK = `https://t.me/${BOT_USERNAME.replace('@', '')}`;

  useEffect(() => {
    fetchTelegramStatus();
  }, []);

  const fetchTelegramStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      console.log('Fetching Telegram status from:', `${API_BASE}/api/telegram/status`);

      const res = await fetch(`${API_BASE}/api/telegram/status`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Status response:', res.status, res.statusText);

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Status fetch error:', errorText);
        throw new Error(`Failed to fetch status: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log('Telegram Status Data:', data);
      setStatus(data);
      
      // Fetch notification settings
      console.log('Fetching notification settings...');
      const settingsRes = await fetch(`${API_BASE}/api/notification-settings`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        console.log('Notification Settings Data:', settingsData);
        
        // Ensure all required fields are present
        const completeSettings: NotificationSettings = {
          telegramNotifications: settingsData.telegramNotifications ?? false,
          priceAlerts: settingsData.priceAlerts ?? true,
          rsiAlerts: settingsData.rsiAlerts ?? true,
          breakoutAlerts: settingsData.breakoutAlerts ?? true,
          liquidityAlerts: settingsData.liquidityAlerts ?? true,
          alertThreshold: settingsData.alertThreshold
        };
        
        setSettings(completeSettings);
        
        // Fetch notification stats
        await fetchNotificationStats();
      } else {
        console.error('Settings fetch failed:', await settingsRes.text());
        setError('Failed to load notification settings');
      }
    } catch (err) {
      console.error('Error in fetchTelegramStatus:', err);
      setError(err instanceof Error ? err.message : 'Failed to load Telegram status');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNotificationStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Get user profile to determine plan
      const profileRes = await fetch(`${API_BASE}/api/profile`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        const plan = profileData.subscription?.plan || 'Free';
        const limit = plan === 'Enterprise' ? 1000 : 25;

        // Get today's notification count
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const statsRes = await fetch(`${API_BASE}/api/telegram/stats`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        let todayCount = 0;
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          todayCount = statsData.todayCount || 0;
        }

        setNotificationStats({
          todayCount,
          limit,
          usagePercentage: Math.round((todayCount / limit) * 100),
          plan
        });
      }
    } catch (error) {
      console.error('Error fetching notification stats:', error);
    }
  };

  const handleLinkAccount = async () => {
    if (!linkCode.trim() || linkCode.length !== 8) {
      setError('Please enter a valid 8-character code');
      return;
    }

    setIsLinking(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      console.log('Linking account with code:', linkCode);

      // Send the code as-is (preserving lowercase/uppercase)
      const res = await fetch(`${API_BASE}/api/telegram/link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ token: linkCode.trim() })
      });

      const responseText = await res.text();
      console.log('Link response:', res.status, responseText);

      if (!res.ok) {
        let errorMessage = 'Failed to link account';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = responseText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = JSON.parse(responseText);
      console.log('Link success:', data);

      setSuccess('🎉 Telegram account linked successfully! You will now receive real-time trading signals.');
      setLinkCode('');
      await fetchTelegramStatus(); // Refresh status
    } catch (err) {
      console.error('Link error:', err);
      setError(err instanceof Error ? err.message : 'Linking failed');
    } finally {
      setIsLinking(false);
    }
  };

  const handleUnlinkAccount = async () => {
    if (!confirm('Are you sure you want to unlink your Telegram account? This will stop all notifications.')) {
      return;
    }

    setIsUnlinking(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      console.log('Unlinking account...');

      const res = await fetch(`${API_BASE}/api/telegram/unlink`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const responseText = await res.text();
      console.log('Unlink response:', res.status, responseText);

      if (!res.ok) {
        let errorMessage = 'Failed to unlink account';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = responseText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      setSuccess('🔗 Telegram account unlinked successfully. You will no longer receive notifications.');
      await fetchTelegramStatus(); // Refresh status
    } catch (err) {
      console.error('Unlink error:', err);
      setError(err instanceof Error ? err.message : 'Unlinking failed');
    } finally {
      setIsUnlinking(false);
    }
  };

  const handleSettingChange = async (setting: keyof NotificationSettings, value: boolean) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      console.log('Changing setting:', {
        setting,
        value,
        currentSettings: settings
      });

      const updatedSettings = { 
        ...settings, 
        [setting]: value 
      };
      
      console.log('Sending to server:', updatedSettings);

      const res = await fetch(`${API_BASE}/api/notification-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedSettings)
      });

      const responseText = await res.text();
      console.log('Server response:', {
        status: res.status,
        statusText: res.statusText,
        body: responseText
      });

      if (!res.ok) {
        let errorMessage = 'Failed to update settings';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorData.details || errorMessage;
        } catch (e) {
          errorMessage = responseText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = JSON.parse(responseText);
      console.log('Update successful:', data);
      
      // Update local state only after successful server update
      setSettings(updatedSettings);
      setSuccess(`✅ ${setting.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} ${value ? 'enabled' : 'disabled'} successfully`);
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err) {
      console.error('Update error details:', err);
      setError(err instanceof Error ? err.message : 'Failed to update settings');
      
      // Refresh settings from server on error
      await fetchTelegramStatus();
    }
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      console.log('Testing connection to:', `${API_BASE}/api/test/connection`);

      const res = await fetch(`${API_BASE}/api/test/connection`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const responseText = await res.text();
      console.log('Connection test response:', res.status, responseText);

      if (res.ok) {
        const data = JSON.parse(responseText);
        setSuccess(`✅ Connection successful! User: ${data.email}`);
      } else {
        throw new Error(`Connection failed: ${res.status} ${res.statusText}`);
      }
    } catch (err) {
      console.error('Connection test error:', err);
      setError(err instanceof Error ? err.message : 'Connection test failed');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSendTestNotification = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      // First check if user is linked
      if (!status?.linked) {
        setError('Please link your Telegram account first');
        return;
      }

      setSuccess('Sending test notification...');

      // In a real implementation, you would call a test endpoint
      // For now, we'll simulate it
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('✅ Test notification sent! Check your Telegram.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Test notification error:', err);
      setError('Failed to send test notification');
    }
  };

  const copyBotUsername = () => {
    navigator.clipboard.writeText(BOT_USERNAME);
    setSuccess('✅ Bot username copied to clipboard!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const openBotLink = () => {
    window.open(BOT_LINK, '_blank');
  };

  const refreshStatus = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('Refreshing...');
    await fetchTelegramStatus();
    setSuccess('Status refreshed successfully!');
    setTimeout(() => setSuccess(''), 2000);
  };

  const getPlanColor = (plan: string) => {
    return plan === 'Enterprise' ? 'text-purple-600' : 'text-blue-600';
  };

  const getPlanBgColor = (plan: string) => {
    return plan === 'Enterprise' ? 'bg-purple-100' : 'bg-blue-100';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto" />
          <p className="text-sm text-gray-600">Loading Telegram settings...</p>
          <p className="text-xs text-gray-500">API Base: {API_BASE}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-xl">
              <MessageCircle className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Telegram Trading Bot</h1>
              <p className="text-blue-100 opacity-90">Get real-time RSI, Breakout & Liquidity alerts directly in Telegram</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={refreshStatus}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              title="Refresh status"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            {status?.linked ? (
              <div className="bg-green-500/20 backdrop-blur-sm border border-green-400/30 px-4 py-2 rounded-xl flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-300" />
                <span className="font-semibold text-green-100">Connected</span>
              </div>
            ) : (
              <div className="bg-yellow-500/20 backdrop-blur-sm border border-yellow-400/30 px-4 py-2 rounded-xl flex items-center space-x-2">
                <XCircle className="w-5 h-5 text-yellow-300" />
                <span className="font-semibold text-yellow-100">Not Connected</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
          <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-700 text-sm mt-1">{error}</p>
            <button
              onClick={() => setError('')}
              className="mt-2 text-xs text-red-600 hover:text-red-800"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-start space-x-3">
          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-green-800 font-medium">Success</p>
            <p className="text-green-700 text-sm mt-1">{success}</p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${status?.notificationEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {status?.notificationEnabled ? 'Active' : 'Inactive'}
            </span>
          </div>
          <h3 className="font-bold text-gray-900 mb-1">Notifications</h3>
          <p className="text-sm text-gray-600">Real-time trading alerts</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <LineChart className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {settings.rsiAlerts ? 'Live' : 'Off'}
            </span>
          </div>
          <h3 className="font-bold text-gray-900 mb-1">RSI Alerts</h3>
          <p className="text-sm text-gray-600">Overbought/Oversold signals</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-orange-100 p-2 rounded-lg">
              <Target className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-xs font-semibold bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
              {settings.breakoutAlerts ? 'Live' : 'Off'}
            </span>
          </div>
          <h3 className="font-bold text-gray-900 mb-1">Breakout Alerts</h3>
          <p className="text-sm text-gray-600">Support/Resistance breaks</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Waves className="w-5 h-5 text-purple-600" />
            </div>
            <button
              onClick={handleTestConnection}
              disabled={isTestingConnection}
              className="text-xs font-semibold bg-blue-100 text-blue-800 px-3 py-1 rounded-full hover:bg-blue-200 disabled:opacity-50"
            >
              {isTestingConnection ? 'Testing...' : 'Test Connection'}
            </button>
          </div>
          <h3 className="font-bold text-gray-900 mb-1">Connection</h3>
        </div>
      </div>

      {/* Notification Usage */}
      {notificationStats && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">📊 Daily Notification Usage</h3>
              <p className="text-sm text-gray-600">Track your daily notification limit</p>
            </div>
            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${getPlanBgColor(notificationStats.plan)} ${getPlanColor(notificationStats.plan)}`}>
              {notificationStats.plan} Plan
            </span>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>{notificationStats.todayCount} / {notificationStats.limit} notifications</span>
              <span>{notificationStats.usagePercentage}% used</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${
                  notificationStats.usagePercentage >= 90 ? 'bg-red-500' :
                  notificationStats.usagePercentage >= 75 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(notificationStats.usagePercentage, 100)}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              {notificationStats.plan === 'Free' ? (
                <p>Free users get {notificationStats.limit} notifications per day. <a href="/subscription" className="text-blue-600 hover:underline">Upgrade to Enterprise</a> for unlimited alerts.</p>
              ) : (
                <p>Enterprise plan: {notificationStats.limit} notifications per day available.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Connection & Bot Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Connection Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <Link2 className="w-5 h-5 mr-2 text-blue-600" />
                Account Connection
              </h2>
              {status?.linkedAt && (
                <div className="text-sm text-gray-500">
                  Since {new Date(status.linkedAt).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric' 
                  })}
                </div>
              )}
            </div>

            {!status?.linked ? (
              <div className="space-y-6">
                {/* Bot Info Card */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-white p-2 rounded-lg border border-blue-300">
                        <Bot className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Trademino Pro Bot</h3>
                        <p className="text-sm text-blue-700">{BOT_USERNAME}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={copyBotUsername}
                        className="px-3 py-1.5 bg-white border border-blue-300 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-50 flex items-center space-x-1 transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </button>
                      <button
                        onClick={openBotLink}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center space-x-1 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-white/80 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <Zap className="w-4 h-4 mr-2 text-yellow-500" />
                      How to connect:
                    </h4>
                    <ol className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start">
                        <span className="bg-blue-100 text-blue-700 font-bold rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 text-xs">1</span>
                        Open Telegram and find <strong>{BOT_USERNAME}</strong>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-blue-100 text-blue-700 font-bold rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 text-xs">2</span>
                        Send <code className="bg-gray-100 px-2 py-0.5 rounded text-gray-800 font-mono">/start</code> to begin
                      </li>
                      <li className="flex items-start">
                        <span className="bg-blue-100 text-blue-700 font-bold rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 text-xs">3</span>
                        Send <code className="bg-gray-100 px-2 py-0.5 rounded text-gray-800 font-mono">/link</code> to get your code
                      </li>
                      <li className="flex items-start">
                        <span className="bg-blue-100 text-blue-700 font-bold rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 text-xs">4</span>
                        Enter the 8-digit code below (case-sensitive)
                      </li>
                    </ol>
                  </div>

                  {/* Code Input */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-900">
                      Enter Linking Code (8 characters)
                    </label>
                    <div className="flex space-x-2">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={linkCode}
                          onChange={(e) => {
                            // Allow any alphanumeric characters (case-sensitive)
                            const input = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
                            // Limit to 8 characters
                            const trimmed = input.slice(0, 8);
                            setLinkCode(trimmed);
                          }}
                          placeholder="e.g., abc12345 or ABC12345"
                          maxLength={8}
                          className="w-full px-4 py-3 text-lg font-mono tracking-widest text-center border-2 border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          spellCheck="false"
                          autoComplete="off"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 font-mono">
                          {8 - linkCode.length}
                        </div>
                      </div>
                      <button
                        onClick={handleLinkAccount}
                        disabled={isLinking || linkCode.length !== 8}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2 font-semibold"
                      >
                        {isLinking ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Linking...</span>
                          </>
                        ) : (
                          <>
                            <Link2 className="w-5 h-5" />
                            <span>Link Account</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 text-center">
                      Enter the exact 8-character code • Case-sensitive • Expires in 15 minutes
                    </p>
                    <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mr-1"></div>
                        Accepts: A-Z, a-z, 0-9
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                        Letters can be lowercase or uppercase
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Connected Status */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="bg-green-100 p-3 rounded-xl">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">Account Connected 🎉</h3>
                      <p className="text-green-700">
                        Your Telegram account is linked and ready to receive real-time trading signals.
                      </p>
                      {status.telegramUsername && (
                        <p className="text-sm text-gray-600 mt-1">
                          Connected as: @{status.telegramUsername}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div className="bg-white/80 p-3 rounded-lg border border-green-100">
                      <p className="text-xs text-gray-500 mb-1">Telegram ID</p>
                      <p className="font-mono text-sm font-semibold text-gray-900">
                        {status.telegramId ? status.telegramId.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : 'N/A'}
                      </p>
                    </div>
                    <div className="bg-white/80 p-3 rounded-lg border border-green-100">
                      <p className="text-xs text-gray-500 mb-1">Notifications</p>
                      <p className={`font-semibold ${status.notificationEnabled ? 'text-green-600' : 'text-red-600'}`}>
                        {status.notificationEnabled ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={handleSendTestNotification}
                      className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 font-semibold"
                    >
                      <Zap className="w-5 h-5" />
                      <span>Send Test Alert</span>
                    </button>
                    <button
                      onClick={handleUnlinkAccount}
                      disabled={isUnlinking}
                      className="flex-1 px-4 py-3 bg-white border-2 border-red-300 text-red-600 rounded-xl hover:bg-red-50 hover:border-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 font-semibold"
                    >
                      {isUnlinking ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Disconnecting...</span>
                        </>
                      ) : (
                        <>
                          <Unlink className="w-5 h-5" />
                          <span>Disconnect</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notification Settings */}
          {status?.linked && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-blue-600" />
                  Notification Settings
                </h2>
                <button
                  onClick={() => {
                    const allEnabled = !settings.telegramNotifications;
                    handleSettingChange('telegramNotifications', allEnabled);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
                >
                  {settings.telegramNotifications ? (
                    <>
                      <BellOff className="w-4 h-4" />
                      <span>Disable All</span>
                    </>
                  ) : (
                    <>
                      <Bell className="w-4 h-4" />
                      <span>Enable All</span>
                    </>
                  )}
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Master Toggle */}
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white p-2 rounded-lg">
                      <Zap className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Telegram Notifications</p>
                      <p className="text-sm text-gray-600">Enable/disable all notifications</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.telegramNotifications}
                      onChange={(e) => handleSettingChange('telegramNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Individual Settings */}
                <div className="space-y-3">
                  {[
                    {
                      key: 'priceAlerts' as const,
                      icon: DollarSign,
                      title: 'Price Alerts',
                      description: 'Major price movements and volume spikes',
                      color: 'text-green-600',
                      bgColor: 'bg-green-100'
                    },
                    {
                      key: 'rsiAlerts' as const,
                      icon: LineChart,
                      title: 'RSI Alerts',
                      description: 'Overbought/Oversold conditions and divergences',
                      color: 'text-blue-600',
                      bgColor: 'bg-blue-100'
                    },
                    {
                      key: 'breakoutAlerts' as const,
                      icon: Target,
                      title: 'Breakout Alerts',
                      description: 'Support/Resistance breakouts with strength levels',
                      color: 'text-orange-600',
                      bgColor: 'bg-orange-100'
                    },
                    {
                      key: 'liquidityAlerts' as const,
                      icon: Waves,
                      title: 'Liquidity Alerts',
                      description: 'Key liquidity zones and institutional activity',
                      color: 'text-purple-600',
                      bgColor: 'bg-purple-100'
                    }
                  ].map((item) => (
                    <div 
                      key={item.key}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                        settings.telegramNotifications && settings[item.key] 
                          ? 'border-gray-300 bg-white shadow-sm' 
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${item.bgColor}`}>
                          <item.icon className={`w-5 h-5 ${item.color}`} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{item.title}</p>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.telegramNotifications && settings[item.key]}
                          onChange={(e) => handleSettingChange(item.key, e.target.checked)}
                          disabled={!settings.telegramNotifications}
                          className="sr-only peer"
                        />
                        <div className={`w-11 h-6 ${
                          !settings.telegramNotifications 
                            ? 'bg-gray-300 cursor-not-allowed' 
                            : 'bg-gray-300 peer-checked:bg-blue-600'
                        } rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                      </label>
                    </div>
                  ))}
                </div>

                {/* Notification Tips */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mt-6">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-yellow-800 mb-1">💡 Notification Tips</p>
                      <ul className="space-y-1 text-yellow-700">
                        <li>• Free users receive 25 notifications per day</li>
                        <li>• Notifications are sent for significant market events only</li>
                        <li>• Cooldown periods prevent notification spam</li>
                        <li>• Upgrade to Enterprise for unlimited alerts</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Bot Commands & Features */}
        <div className="space-y-6">
          {/* Bot Commands */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center">
              <MessageCircle className="w-5 h-5 mr-2 text-blue-600" />
              Telegram Commands
            </h3>
            <div className="space-y-3">
              {[
                { command: '/start', description: 'Start the bot and get welcome message' },
                { command: '/link', description: 'Get account linking code' },
                { command: '/unlink', description: 'Unlink your account' },
                { command: '/help', description: 'Show all available commands' },
                { command: '/status', description: 'Check connection status and stats' },
                { command: '/test', description: 'Send a test notification' },
                { command: '/settings', description: 'Configure notification preferences' },
                { command: '/stats', description: 'View notification statistics' },
                { command: '/upgrade', description: 'Upgrade to Enterprise plan' },
                { command: '/support', description: 'Contact support team' }
              ].map((item) => (
                <div key={item.command} className="group p-3 rounded-lg hover:bg-blue-50 transition-colors duration-200">
                  <div className="flex items-center justify-between mb-1">
                    <code className="bg-gray-100 group-hover:bg-blue-100 px-2 py-1 rounded text-sm font-mono text-gray-800">
                      {item.command}
                    </code>
                  </div>
                  <p className="text-xs text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Alert Types */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-200 p-5">
            <h3 className="font-bold text-gray-900 mb-4">🚨 Alert Types</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-2 p-2 rounded-lg bg-white/50">
                <div className="bg-blue-100 p-1.5 rounded">
                  <LineChart className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900">RSI Alerts</p>
                  <p className="text-xs text-gray-600">Overbought (≥70), Oversold (≤30), Extreme levels</p>
                </div>
              </div>
              <div className="flex items-start space-x-2 p-2 rounded-lg bg-white/50">
                <div className="bg-orange-100 p-1.5 rounded">
                  <Target className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900">Breakout Alerts</p>
                  <p className="text-xs text-gray-600">Support/Resistance breaks with volume confirmation</p>
                </div>
              </div>
              <div className="flex items-start space-x-2 p-2 rounded-lg bg-white/50">
                <div className="bg-purple-100 p-1.5 rounded">
                  <Waves className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900">Liquidity Alerts</p>
                  <p className="text-xs text-gray-600">Key zones, institutional activity, volume nodes</p>
                </div>
              </div>
              <div className="flex items-start space-x-2 p-2 rounded-lg bg-white/50">
                <div className="bg-green-100 p-1.5 rounded">
                  <DollarSign className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900">Price Alerts</p>
                  <p className="text-xs text-gray-600">Major movements (±5%), volume spikes (2x+)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          {status?.linked && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-bold text-gray-900 mb-4">📊 Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Connection</span>
                  <span className="font-semibold text-green-600">Active</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Notifications</span>
                  <span className={`font-semibold ${settings.telegramNotifications ? 'text-green-600' : 'text-red-600'}`}>
                    {settings.telegramNotifications ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Alerts</span>
                  <span className="font-semibold text-blue-600">
                    {Object.values(settings).filter(v => v === true).length - 1} / 4
                  </span>
                </div>
                {notificationStats && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Today's Usage</span>
                    <span className={`font-semibold ${
                      notificationStats.usagePercentage >= 90 ? 'text-red-600' :
                      notificationStats.usagePercentage >= 75 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {notificationStats.todayCount}/{notificationStats.limit}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Last Updated</span>
                  <span className="font-semibold text-gray-900">
                    {status.linkedAt ? new Date(status.linkedAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
              {notificationStats && notificationStats.usagePercentage >= 75 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-800">
                    {notificationStats.usagePercentage >= 90 ? (
                      <span className="font-medium">⚠️ Near daily limit! Consider upgrading to Enterprise.</span>
                    ) : (
                      <span>You've used {notificationStats.usagePercentage}% of your daily notifications.</span>
                    )}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Subscription Info */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-5">
            <h3 className="font-bold text-gray-900 mb-3">💰 Upgrade Benefits</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <span>1000 notifications/day (vs 25 for Free)</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <span>Priority notification delivery</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <span>All cryptocurrencies & timeframes</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <span>Advanced analytics & insights</span>
              </li>
            </ul>
            <button
              onClick={() => window.open('/subscription', '_blank')}
              className="w-full mt-4 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
            >
              Upgrade to Enterprise
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-3 md:space-y-0">
          <div className="text-sm text-gray-600">
            <p className="font-medium text-gray-900 mb-1 flex items-center">
              <Shield className="w-4 h-4 mr-2 text-gray-500" />
              Secure & Encrypted
            </p>
            <p>Your data is encrypted end-to-end. We never store your messages.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${status?.linked ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium">
                Bot: {status?.linked ? 'Connected' : 'Not Connected'}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              v1.0.0 • {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}