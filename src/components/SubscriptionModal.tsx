import React, { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { X, Check, Crown, AlertCircle } from 'lucide-react';
import axios from 'axios';

interface SubscriptionModalProps {
  onClose: () => void;
  user: {
    email: string;
    subscription?: { plan: string | null; active: boolean; subscriptionId?: string };
  } | null;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ onClose, user }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ---------- helpers ---------- */
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });

  const currentPlan = user?.subscription?.plan;
  const isActive = user?.subscription?.active;
  const isPending = currentPlan === 'Basic' && !isActive;

  /* ---------- UI ---------- */
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] flex flex-col">
        {/* header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 relative rounded-t-xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition"
            disabled={loading}
          >
            <X size={20} />
          </button>
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Upgrade to Basic</h2>
            <p className="text-blue-100">Unlock premium time-frames & coins</p>
            {currentPlan && <p className="text-sm mt-1">Current Plan: {currentPlan}</p>}
          </div>
        </div>

        {/* body */}
        <div className="p-6 flex-1 overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle size={18} className="text-red-500" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {isPending && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
              Payment pending – you will be upgraded automatically within a minute.
            </div>
          )}

          {/* plan card */}
          <div className="bg-white rounded-xl p-6 border-2 border-blue-500 shadow-lg">
            <div className="text-center mb-4">
              <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                <Crown size={20} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Basic Plan</h3>
              <div className="text-3xl font-bold text-gray-900">$49</div>
              <div className="text-sm text-gray-500">/month</div>
              {isActive && currentPlan === 'Basic' && (
                <div className="mt-2 text-sm text-green-600 font-medium flex items-center justify-center gap-1">
                  <Check size={14} />
                  Active Plan
                </div>
              )}
            </div>

            <ul className="space-y-2 mb-6 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <Check size={14} className="text-green-500 mt-0.5" />
                <span>All time-frames</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={14} className="text-green-500 mt-0.5" />
                <span>All major cryptocurrencies</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={14} className="text-green-500 mt-0.5" />
                <span>AI sentiment & impactful news</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={14} className="text-green-500 mt-0.5" />
                <span>Market psychology metrics</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={14} className="text-green-500 mt-0.5" />
                <span>AI-driven market analysis</span>
              </li>
            </ul>

            {/* In-app PayPal buttons */}
            <PayPalScriptProvider
              options={{
                clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
                currency: 'USD',
                intent: 'subscription',
                vault: true,
              }}
            >
              <PayPalButtons
                style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'subscribe' }}
                createSubscription={async () => {
                  setLoading(true);
                  setError(null);
                  try {
                    const { data } = await api.post('/subscribe', {
                      plan: 'Basic',
                      return_url: `${window.location.origin}/billing/success`,
                      cancel_url: `${window.location.origin}/billing/cancel`,
                    });
                    return data.subscriptionId || data.id;
                  } catch (e: any) {
                    setError(e.response?.data?.error || 'Could not create subscription');
                    setLoading(false);
                    throw e;
                  }
                }}
                onApprove={async () => {
                  setLoading(false);
                  onClose();
                }}
                onCancel={() => setLoading(false)}
                onError={(err) => {
                  console.error(err);
                  setError('PayPal subscription failed. Please try again.');
                  setLoading(false);
                }}
              />
            </PayPalScriptProvider>
          </div>

          {/* footer */}
          <div className="text-center py-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              🔒 Secure payments • Cancel anytime • 30-day money-back guarantee
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};