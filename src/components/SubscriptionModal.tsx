import React, { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { X, Check, Crown, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

interface SubscriptionModalProps {
  onClose: () => void;
  onSuccess?: () => void;
  user: {
    email: string;
    subscription?: {
      plan: string | null;
      active: boolean;
      expiryDate?: string;
    };
  } | null;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  onClose,
  onSuccess,
  user,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  const currentPlan = user?.subscription?.plan || 'Free';
  const isActive = user?.subscription?.active === true;

  const createOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/create-payment');
      return response.data.orderID;
    } catch (err: any) {
      const msg =
        err.response?.data?.error || 'Failed to create payment order. Try again.';
      setError(msg);
      setLoading(false);
      throw err;
    }
  };

  const onApprove = async (data: any) => {
    try {
      const response = await api.post('/capture-payment', { orderID: data.orderID });
      if (response.data.success) {
        onSuccess?.();
        onClose();
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        'Payment approved but activation failed. Contact support.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 relative rounded-t-xl">
          <button
            onClick={onClose}
            disabled={loading}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition disabled:opacity-50"
          >
            <X size={20} />
          </button>
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Upgrade to Enterprise</h2>
            <p className="text-indigo-100">Unlock everything: all coins, all timeframes, all insights.</p>
            <p className="text-sm mt-2">Current plan: <strong>{currentPlan}</strong></p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Plan Card */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border-2 border-indigo-400 shadow-xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
                <Crown size={32} className="text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Enterprise</h3>
              <div className="mt-3">
                <span className="text-5xl font-extrabold text-gray-900">$49</span>
                <span className="text-gray-600 ml-2">/ 30 days</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">One-time payment • Instant access</p>

              {isActive && currentPlan === 'Enterprise' && (
                <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  <Check size={16} />
                  Active until{' '}
                  {user?.subscription?.expiryDate
                    ? new Date(user.subscription.expiryDate).toLocaleDateString()
                    : '...'}
                </div>
              )}
            </div>

            <ul className="space-y-3 mb-8 text-gray-700">
              {[
                'All 25+ cryptocurrencies',
                'All timeframes (1h – 24h)',
                'Real-time AI news & sentiment',
                'Market psychology metrics',
                'Full AI-powered analysis',
                'High-impact news alerts',
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <Check size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            {/* PayPal Button */}
            <PayPalScriptProvider
              options={{
                clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
                currency: 'USD',
                intent: 'capture',
              }}
            >
              <PayPalButtons
                style={{
                  layout: 'vertical',
                  color: 'gold',
                  shape: 'rect',
                  label: 'paypal',
                  height: 48,
                }}
                disabled={loading || (isActive && currentPlan === 'Enterprise')}
                createOrder={createOrder}
                onApprove={onApprove}
                onCancel={() => setLoading(false)}
                onError={(err) => {
                  console.error('PayPal error:', err);
                  setError('PayPal checkout failed. Please try again.');
                  setLoading(false);
                }}
              />
            </PayPalScriptProvider>

            {(loading || (isActive && currentPlan === 'Enterprise')) && (
              <div className="mt-4 flex items-center justify-center gap-2 text-gray-600">
                <Loader2 size={18} className="animate-spin" />
                <span className="text-sm">
                  {isActive && currentPlan === 'Enterprise'
                    ? 'You already have an active Enterprise subscription'
                    : 'Processing...'}
                </span>
              </div>
            )}
          </div>

          <div className="mt-6 text-center text-xs text-gray-500">
            <p>Secure payment • Instant activation • 30-day money-back guarantee</p>
          </div>
        </div>
      </div>
    </div>
  );
};