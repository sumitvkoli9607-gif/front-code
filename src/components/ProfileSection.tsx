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
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Shield,
  Copy,
  ExternalLink,
  Zap,
  Bot,
  Activity,
  TestTube,
  Wifi,
  RefreshCw
} from 'lucide-react';

interface TelegramStatus {
  linked: boolean;
  telegramId?: number;
  notificationEnabled: boolean;
  linkedAt?: string;
}

interface NotificationSettings {
  telegramNotifications: boolean;
  priceAlerts: boolean;
  supportResistanceAlerts: boolean;
  majorMovementAlerts: boolean;
  overviewAlerts: boolean;
  sentimentShiftAlerts: boolean;
  alertThreshold?: number;
  notificationFrequency?: string;
}

export default function TelegramIntegration() {
  const [status, setStatus] = useState<TelegramStatus | null>(null);
  const [linkCode, setLinkCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLinking, setIsLinking] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [settings, setSettings] = useState<NotificationSettings>({
    telegramNotifications: false,
    priceAlerts: true,
    supportResistanceAlerts: true,
    majorMovementAlerts: true,
    overviewAlerts: true,
    sentimentShiftAlerts: true
  });

  const API_BASE = import.meta.env.VITE_API_URL || window.location.origin;
  const BOT_USERNAME = '@TrademinoProBot';
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
          supportResistanceAlerts: settingsData.supportResistanceAlerts ?? true,
          majorMovementAlerts: settingsData.majorMovementAlerts ?? true,
          overviewAlerts: settingsData.overviewAlerts ?? true,
          sentimentShiftAlerts: settingsData.sentimentShiftAlerts ?? true,
          alertThreshold: settingsData.alertThreshold,
          notificationFrequency: settingsData.notificationFrequency
        };
        
        setSettings(completeSettings);
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
    if (!confirm('Are you sure you want to unlink your Telegram account?')) {
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

      setSuccess('🔗 Telegram account unlinked successfully.');
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

  const handleTestNotification = async () => {
    setIsTesting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      console.log('Sending test notification...');

      const res = await fetch(`${API_BASE}/api/test/notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'TEST',
          symbol: 'BTC/USDT'
        })
      });

      const responseText = await res.text();
      console.log('Test notification response:', res.status, responseText);

      if (res.ok) {
        setSuccess('✅ Test notification sent! Check your Telegram.');
      } else {
        let errorMessage = 'Failed to send test notification';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = responseText || errorMessage;
        }
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error('Test notification error:', err);
      setError(err instanceof Error ? err.message : 'Failed to send test notification');
    } finally {
      setIsTesting(false);
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
              <p className="text-blue-100 opacity-90">Get real-time signals & alerts directly in Telegram</p>
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

      {/* Status Cards */}
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
              <Zap className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {settings.priceAlerts ? 'Live' : 'Off'}
            </span>
          </div>
          <h3 className="font-bold text-gray-900 mb-1">Price Alerts</h3>
          <p className="text-sm text-gray-600">Instant price movement alerts</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-xs font-semibold bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
              Active
            </span>
          </div>
          <h3 className="font-bold text-gray-900 mb-1">Security</h3>
          <p className="text-sm text-gray-600">End-to-end encrypted</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-orange-100 p-2 rounded-lg">
              <Wifi className="w-5 h-5 text-orange-600" />
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
          <p className="text-sm text-gray-600">API: {API_BASE.replace('https://', '')}</p>
        </div>
      </div>

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
                        Enter the 8-digit code below
                      </li>
                    </ol>
                  </div>

                  {/* Code Input */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-900">
                      Enter Linking Code
                    </label>
                    <div className="flex space-x-2">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={linkCode}
                          onChange={(e) => setLinkCode(e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase())}
                          placeholder="ABCD1234"
                          maxLength={8}
                          className="w-full px-4 py-3 text-lg font-mono tracking-widest text-center border-2 border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
                      Code expires in 15 minutes • Refresh code with /link in Telegram
                    </p>
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

                  <button
                    onClick={handleUnlinkAccount}
                    disabled={isUnlinking}
                    className="w-full px-4 py-3 bg-white border-2 border-red-300 text-red-600 rounded-xl hover:bg-red-50 hover:border-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 font-semibold"
                  >
                    {isUnlinking ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Disconnecting...</span>
                      </>
                    ) : (
                      <>
                        <Unlink className="w-5 h-5" />
                        <span>Disconnect Account</span>
                      </>
                    )}
                  </button>
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
                  onClick={handleTestNotification}
                  disabled={isTesting || !settings.telegramNotifications}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <TestTube className="w-4 h-4" />
                  <span>{isTesting ? 'Sending...' : 'Send Test'}</span>
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
                      icon: TrendingUp,
                      title: 'Price Alerts',
                      description: 'Instant notifications for significant price movements',
                      color: 'text-green-600',
                      bgColor: 'bg-green-100'
                    },
                    {
                      key: 'supportResistanceAlerts' as const,
                      icon: AlertTriangle,
                      title: 'Support/Resistance Alerts',
                      description: 'Breakouts and bounces at key levels',
                      color: 'text-yellow-600',
                      bgColor: 'bg-yellow-100'
                    },
                    {
                      key: 'majorMovementAlerts' as const,
                      icon: Zap,
                      title: 'Major Movements',
                      description: 'Large percentage moves and volume spikes',
                      color: 'text-orange-600',
                      bgColor: 'bg-orange-100'
                    },
                    {
                      key: 'overviewAlerts' as const,
                      icon: BarChart3,
                      title: 'Market Overview',
                      description: 'Daily market analysis and summary',
                      color: 'text-purple-600',
                      bgColor: 'bg-purple-100'
                    },
                    {
                      key: 'sentimentShiftAlerts' as const,
                      icon: Activity,
                      title: 'Sentiment Shift Alerts',
                      description: 'Market sentiment changes and shifts',
                      color: 'text-pink-600',
                      bgColor: 'bg-pink-100'
                    }
                  ].map((item) => (
                    <div 
                      key={item.key}
                      className={`flex items-center justify-between p-4 rounded-xl border ${settings.telegramNotifications && settings[item.key] ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50'}`}
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
                        <div className={`w-11 h-6 ${!settings.telegramNotifications ? 'bg-gray-300' : 'bg-gray-300 peer-checked:bg-blue-600'} rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                      </label>
                    </div>
                  ))}
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
                { command: '/status', description: 'Check your connection status' },
                { command: '/test', description: 'Send a test notification' }
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

          {/* Features */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-200 p-5">
            <h3 className="font-bold text-gray-900 mb-4">⚡ What You Get</h3>
            <ul className="space-y-3">
              {[
                'Real-time trade signals with entry/exit levels',
                'Support & Resistance break alerts',
                'Major price movement notifications',
                'Market sentiment updates',
                'Daily market overview',
                'Risk management alerts',
                'Volume spike notifications',
                'Pattern recognition alerts'
              ].map((feature, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
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
                    {Object.values(settings).filter(v => v === true).length - 1}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Last Updated</span>
                  <span className="font-semibold text-gray-900">
                    {status.linkedAt ? new Date(status.linkedAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Debug Info (Only in development) */}
          {import.meta.env.DEV && (
            <div className="bg-gray-900 text-white rounded-xl p-5 font-mono">
              <h3 className="font-bold mb-4 text-gray-300">🔧 Debug Info</h3>
              <div className="space-y-2 text-xs">
                <div>API: {API_BASE}</div>
                <div>Status: {JSON.stringify(status)}</div>
                <div>Settings: {JSON.stringify(settings)}</div>
                <div className="pt-2 border-t border-gray-700">
                  <button
                    onClick={() => {
                      console.log('Status:', status);
                      console.log('Settings:', settings);
                      console.log('API Base:', API_BASE);
                    }}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Log to Console
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-3 md:space-y-0">
          <div className="text-sm text-gray-600">
            <p className="font-medium text-gray-900 mb-1">🔒 Secure & Encrypted</p>
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