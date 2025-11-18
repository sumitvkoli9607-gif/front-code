import React, { useState, useEffect } from 'react';
import { X, Check, Star, Crown, AlertCircle } from 'lucide-react';

interface SubscriptionPlan {
  name: string;
  price: number;
  planId: string;
  features: string[];
  popular?: boolean;
}

interface SubscriptionModalProps {
  onClose: () => void;
  onSubscribe: (plan: string, subscriptionId?: string) => void;
}

const paypalPlans = {
  Basic: 'P-2U483289JN275574XNDEZYAQ',
  Pro: 'P-1A5793248D393010ENDEZ7UA',
  Enterprise: 'P-70L933710T462880ANDE2B5A'
};

const plans: SubscriptionPlan[] = [
  {
    name: 'Basic',
    price: 19,
    planId: paypalPlans.Basic,
    features: [
      'Real-time market data',
      'Basic charts and analysis',
      'News feed access',
      'Email notifications'
    ]
  },
  {
    name: 'Pro',
    price: 29,
    popular: true,
    planId: paypalPlans.Pro,
    features: [
      'Everything in Basic',
      'Advanced technical indicators',
      'AI market sentiment analysis',
      'Real-time alerts',
      'Priority support'
    ]
  },
  {
    name: 'Enterprise',
    price: 49,
    planId: paypalPlans.Enterprise,
    features: [
      'Everything in Pro',
      'Institutional-grade data',
      'Advanced AI trading insights',
      'Dedicated account manager',
      'SLA guarantee'
    ]
  }
];

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ 
  onClose, 
  onSubscribe 
}) => {
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load PayPal SDK
useEffect(() => {
  const client = import.meta.env.VITE_PAYPAL_CLIENT_ID;
  if (!client) {
    setError('PayPal client ID is missing. Please contact support.');
    return;
  }

  const script = document.createElement('script');
  script.src = `https://www.paypal.com/sdk/js?client-id=${client}&vault=true&intent=subscription`;
  script.async = true;
  script.onload = () => setPaypalLoaded(true);
  script.onerror = () => {
    setError('Failed to load PayPal SDK. Please try again later.');
    setPaypalLoaded(false);
  };
  
  document.head.appendChild(script);
  
  return () => {
    if (document.head.contains(script)) {
      document.head.removeChild(script);
    }
  };
}, []);
  // Initialize PayPal buttons
  useEffect(() => {
    if (paypalLoaded && typeof window !== 'undefined' && (window as any).paypal) {
      const paypal = (window as any).paypal;
      
      plans.forEach((plan) => {
        const containerId = `paypal-button-${plan.name}`;
        const container = document.getElementById(containerId);
        
        if (container) {
          paypal.Buttons({
            style: {
              shape: 'rect',
              color: 'gold',
              layout: 'vertical',
              label: 'subscribe'
            },
            createSubscription: (_data: any, actions: any) => {
              return actions.subscription.create({
                plan_id: plan.planId
              });
            },
            onApprove: (data: any, _actions: any) => {
              setLoading(plan.name);
              setError(null);
              
              onSubscribe(plan.name, data.subscriptionID);
              
              alert(`Successfully subscribed to ${plan.name} plan!`);
              setLoading(null);
            },
            onError: (err: any) => {
              setError('Payment failed. Please try again.');
              setLoading(null);
              console.error('PayPal error:', err);
            },
            onCancel: () => {
              setLoading(null);
              console.log('Subscription cancelled');
            }
          }).render(`#${containerId}`);
        }
      });
    }
  }, [paypalLoaded, onSubscribe]);

  const handleClose = () => {
    setLoading(null);
    setError(null);
    onClose();
  };

  const isProcessing = loading !== null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 relative rounded-t-xl">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
            disabled={isProcessing}
          >
            <X size={20} />
          </button>
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Choose Your Plan</h2>
            <p className="text-blue-100">Unlock premium trading features</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-white rounded-xl p-6 border-2 transition-all ${
                  plan.popular
                    ? 'border-blue-500 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300'
                } ${loading === plan.name ? 'opacity-60' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      <Star size={12} className="inline mr-1" />
                      Popular
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-4">
                  <div className={`w-10 h-10 mx-auto mb-3 rounded-lg flex items-center justify-center ${
                    plan.name === 'Basic' ? 'bg-green-100 text-green-600' :
                    plan.name === 'Pro' ? 'bg-blue-100 text-blue-600' :
                    'bg-purple-100 text-purple-600'
                  }`}>
                    {plan.name === 'Basic' ? <Check size={20} /> : 
                     plan.name === 'Pro' ? <Star size={20} /> : <Crown size={20} />}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="text-3xl font-bold text-gray-900">${plan.price}</div>
                  <div className="text-sm text-gray-500">/month</div>
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                      <Check size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* PayPal Button */}
                <div className="w-full">
                  <div 
                    id={`paypal-button-${plan.name}`}
                    className="w-full min-h-[45px] rounded-lg"
                  />
                  {!paypalLoaded && (
                    <div className="text-center py-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mx-auto mb-1"></div>
                      <p className="text-xs text-gray-500">Loading...</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
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