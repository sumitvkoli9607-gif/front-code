import React, { useState } from 'react';
import { Bell } from 'lucide-react';

interface Preferences {
  notifications: {
    email: boolean;
    push: boolean;
  };
  display: {
    theme: 'light' | 'dark' | 'auto';
    currency: string;
    language: string;
    timezone: string;
    chartType: 'candlestick' | 'line' | 'bar' | 'area';
  };
  trading: {
    defaultLeverage: string;
    riskLevel: 'low' | 'moderate' | 'high';
    autoStop: boolean;
    confirmTrades: boolean;
  };
}

export const PreferencesSection: React.FC = () => {
  const [preferences, setPreferences] = useState<Preferences>({
    notifications: {
      email: true,
      push: true
    },
    display: {
      theme: 'light',
      currency: 'USD',
      language: 'English',
      timezone: 'EST',
      chartType: 'candlestick'
    },
    trading: {
      defaultLeverage: '1:1',
      riskLevel: 'moderate',
      autoStop: true,
      confirmTrades: true
    }
  });


  const renderPreferencesTab = () => (
    <div className="space-y-8">
      {/* Notifications */}
      <div className="bg-white rounded-2xl p-8 border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <Bell size={24} className="text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
        </div>
        
        <div className="space-y-4">
          {Object.entries(preferences.notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 rounded-lg px-2">
              <div>
                <h3 className="font-medium text-gray-900 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                <p className="text-sm text-gray-500">
                  {key === 'email' && 'Receive notifications via email'}
                  {key === 'push' && 'Browser push notifications'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    notifications: {
                      ...preferences.notifications,
                      [key]: e.target.checked
                    }
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Preferences</h1>
        <p className="text-gray-600">Manage your notification preferences</p>
      </div>
      {renderPreferencesTab()}
    </div>
  );
};