// TelegramIntegration.tsx
import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2, MessageCircle, Link2, Unlink } from 'lucide-react';

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
}

export default function TelegramIntegration() {
  const [status, setStatus] = useState<TelegramStatus | null>(null);
  const [linkCode, setLinkCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLinking, setIsLinking] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [settings, setSettings] = useState<NotificationSettings>({
    telegramNotifications: true,
    priceAlerts: true,
    supportResistanceAlerts: true,
    majorMovementAlerts: true,
    overviewAlerts: true
  });

  const API_BASE = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchTelegramStatus();
  }, []);

  const fetchTelegramStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      const res = await fetch(`${API_BASE}/api/telegram/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to fetch status');
      
      const data = await res.json();
      setStatus(data);
      
      // Fetch notification settings
      const settingsRes = await fetch(`${API_BASE}/api/notification-settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings(settingsData);
      }
    } catch (err) {
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

      const res = await fetch(`${API_BASE}/api/telegram/link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ token: linkCode.trim().toUpperCase() })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to link account');
      }

      setSuccess('Telegram account linked successfully!');
      setLinkCode('');
      await fetchTelegramStatus(); // Refresh status
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Linking failed');
    } finally {
      setIsLinking(false);
    }
  };

  const handleUnlinkAccount = async () => {
    setIsUnlinking(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      const res = await fetch(`${API_BASE}/api/telegram/unlink`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to unlink account');
      }

      setSuccess('Telegram account unlinked successfully!');
      await fetchTelegramStatus(); // Refresh status
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unlinking failed');
    } finally {
      setIsUnlinking(false);
    }
  };

  const handleSettingChange = async (setting: keyof NotificationSettings, value: boolean) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      const updatedSettings = { ...settings, [setting]: value };
      setSettings(updatedSettings);

      const res = await fetch(`${API_BASE}/api/notification-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedSettings)
      });

      if (!res.ok) {
        // Revert on error
        setSettings(settings);
        throw new Error('Failed to update settings');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
    }
  };

  const copyBotUsername = () => {
    const botUsername = '@Trademinobot'; // Replace with your actual bot username
    navigator.clipboard.writeText(botUsername);
    setSuccess('Bot username copied to clipboard!');
    setTimeout(() => setSuccess(''), 3000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <MessageCircle className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-900">Telegram Integration</h2>
          </div>
          {status?.linked && (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Connected</span>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center space-x-2">
            <XCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-green-700 text-sm">{success}</span>
          </div>
        )}

        {!status?.linked ? (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="font-medium text-blue-900 mb-2">How to connect:</h3>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Open Telegram and search for our bot</li>
                <li>Send <code className="bg-blue-100 px-1 rounded">/start</code> to begin</li>
                <li>Send <code className="bg-blue-100 px-1 rounded">/link</code> to get your code</li>
                <li>Enter the 8-character code below</li>
              </ol>
              <button
                onClick={copyBotUsername}
                className="mt-3 text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Copy bot username
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Linking Code
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={linkCode}
                  onChange={(e) => setLinkCode(e.target.value.toUpperCase())}
                  placeholder="Enter 8-character code"
                  maxLength={8}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleLinkAccount}
                  disabled={isLinking || !linkCode.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isLinking ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Link2 className="w-4 h-4" />
                  )}
                  <span>{isLinking ? 'Linking...' : 'Link Account'}</span>
                </button>
              </div>
              <p className="text-xs text-gray-500">
                The code expires in 15 minutes
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">Account Connected</span>
              </div>
              <p className="text-sm text-green-800">
                Your Telegram account is successfully linked. You'll receive notifications here.
              </p>
              {status?.linkedAt && (
                <p className="text-xs text-green-600 mt-1">
                  Connected since {new Date(status.linkedAt).toLocaleDateString()}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Notification Settings</h3>
              
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.telegramNotifications}
                    onChange={(e) => handleSettingChange('telegramNotifications', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Enable Telegram notifications</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.priceAlerts}
                    onChange={(e) => handleSettingChange('priceAlerts', e.target.checked)}
                    disabled={!settings.telegramNotifications}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Price alerts</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.supportResistanceAlerts}
                    onChange={(e) => handleSettingChange('supportResistanceAlerts', e.target.checked)}
                    disabled={!settings.telegramNotifications}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Support/Resistance breaks</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.majorMovementAlerts}
                    onChange={(e) => handleSettingChange('majorMovementAlerts', e.target.checked)}
                    disabled={!settings.telegramNotifications}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Major price movements</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.overviewAlerts}
                    onChange={(e) => handleSettingChange('overviewAlerts', e.target.checked)}
                    disabled={!settings.telegramNotifications}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Market overview updates</span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={handleUnlinkAccount}
                disabled={isUnlinking}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isUnlinking ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Unlink className="w-4 h-4" />
                )}
                <span>{isUnlinking ? 'Unlinking...' : 'Unlink Account'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-2">Telegram Commands</h3>
        <div className="space-y-1 text-sm text-gray-600">
          <div><code className="bg-gray-100 px-2 py-1 rounded">/start</code> - Start the bot</div>
          <div><code className="bg-gray-100 px-2 py-1 rounded">/link</code> - Get linking code</div>
          <div><code className="bg-gray-100 px-2 py-1 rounded">/unlink</code> - Unlink account</div>
          <div><code className="bg-gray-100 px-2 py-1 rounded">/help</code> - Show help</div>
        </div>
      </div>
    </div>
  );
}