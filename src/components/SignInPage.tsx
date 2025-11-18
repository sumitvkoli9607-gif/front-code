import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Shield,
  Zap,
  Users,
  LogOut,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
  Star,
  Lock,
} from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

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

interface SignInPageProps {
  onSignIn: (user: User, token: string) => void;
}

// Free tier features for display
const FREE_TIER_FEATURES = [
  "Access to 5 major cryptocurrencies (BTC, ETH, XRP, LTC, DOGE)",
  "Market news and sentiment analysis",
  "12h and 24h timeframe analysis",
  "Real-time market data",
  "Basic market insights"
];

const PREMIUM_FEATURES = [
  "All 25+ cryptocurrencies",
  "AI trading strategies",
  "Market psychology analysis",
  "Advanced AI market analysis",
  "1h, 3h, 6h timeframes",
  "Priority support"
];

export const SignInPage: React.FC<SignInPageProps> = ({ onSignIn }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showFeatures, setShowFeatures] = useState(false);

  // Configure axios with base URL
  const api = axios.create({
    baseURL:  import.meta.env.VITE_API_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Add a request interceptor to include the auth token
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Load user and token from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");

    if (savedUser && savedToken) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        onSignIn(parsedUser, savedToken);
      } catch (error) {
        console.error("Failed to parse stored user data:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
  }, [onSignIn]);

  // Google Sign-In handler
  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const googleToken = credentialResponse.credential;
      if (!googleToken) {
        throw new Error("No Google token received");
      }

      console.log("Google auth successful, sending token to backend...");

      const res = await api.post("/auth/google", {
        token: googleToken,
      });

      console.log("Backend response:", res.data);

      if (res.data.success) {
        const { user, token } = res.data;
        // Add default values for balance fields and subscription if not provided by backend
        const enrichedUser: User = {
          ...user,
          availableBalance: user.availableBalance ?? 0,
          totalWithdrawn: user.totalWithdrawn ?? 0,
          pendingWithdrawals: user.pendingWithdrawals ?? 0,
          subscription: user.subscription || {
            plan: 'Free',
            active: false,
            startDate: new Date().toISOString()
          }
        };
        setUser(enrichedUser);
        localStorage.setItem("user", JSON.stringify(enrichedUser));
        localStorage.setItem("token", token);
        onSignIn(enrichedUser, token);
        setSuccess("Successfully signed in! Welcome to your free tier account.");
      } else {
        throw new Error(res.data.message || "Authentication failed");
      }
    } catch (error: any) {
      console.error("Google login failed:", error);
      let errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to sign in with Google. Please try again.";
      
      if (errorMessage.includes("Token is invalid due to timing issues")) {
        errorMessage =
          "Authentication failed due to a timing issue with the Google token. Please check your system clock or try signing in again.";
      } else if (errorMessage.includes("Token has expired")) {
        errorMessage =
          "Your Google token has expired. Please sign in again to refresh your session.";
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google authentication failed. Please try again.");
    console.error("Google login failed");
    setIsLoading(false);
  };

  // Logout handler
  const handleLogout = () => {
    setUser(null);
    setSuccess("You have been logged out successfully.");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setTimeout(() => setSuccess(null), 3000);
  };

  // Clear error message
  const clearError = () => {
    setError(null);
  };

  // Quick demo login for testing free tier
  const handleDemoLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      const demoUser: User = {
        id: 'demo-user-' + Date.now(),
        name: 'Demo User',
        email: 'demo@tradepro.com',
        avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
        availableBalance: 0,
        totalWithdrawn: 0,
        pendingWithdrawals: 0,
        subscription: {
          plan: 'Free',
          active: false,
          startDate: new Date().toISOString()
        }
      };
      setUser(demoUser);
      const demoToken = 'demo-token-' + Date.now();
      localStorage.setItem("user", JSON.stringify(demoUser));
      localStorage.setItem("token", demoToken);
      onSignIn(demoUser, demoToken);
      setSuccess("Demo login successful! Welcome to your free tier account.");
      setIsLoading(false);
    }, 1000);
  };

  const features = [
    {
      icon: TrendingUp,
      title: "Real-time Market Data",
      description: "Access live prices and market movements across crypto, forex, and stocks",
    },
    {
      icon: Zap,
      title: "AI-Powered Insights",
      description: "Get intelligent market analysis and trading recommendations",
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Bank-grade security with 99.9% uptime guarantee",
    },
    {
      icon: Users,
      title: "Professional Tools",
      description: "Advanced charting, portfolio tracking, and risk management",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex">
      {/* Left Side - Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 p-12 flex-col justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full"></div>
          <div className="absolute bottom-32 right-16 w-24 h-24 bg-white rounded-full"></div>
          <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-white rounded-full"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <BarChart3 size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">TradePro</h1>
              <p className="text-blue-100 text-sm">Financial Dashboard</p>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
              Professional Trading
              <br />
              <span className="text-blue-200">Made Simple</span>
            </h2>
            <p className="text-xl text-blue-100 leading-relaxed">
              Start with our free tier and upgrade when you're ready for advanced features
            </p>
          </div>

          <div className="space-y-6 mb-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-blue-100 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Free Tier Info */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-2 mb-3">
              <Star size={20} className="text-yellow-400" />
              <h3 className="font-semibold text-white">Free Tier Includes:</h3>
            </div>
            <ul className="text-blue-100 text-sm space-y-2">
              {FREE_TIER_FEATURES.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Right Side - Sign In */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {error && (
            <div
              className="mb-4 p-4 bg-red-50 text-red-800 rounded-lg flex items-start gap-2 border border-red-200 shadow-md animate-pulse duration-300"
              role="alert"
              aria-live="assertive"
            >
              <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <span className="text-sm font-medium">{error}</span>
                {error.includes("timing issues") && (
                  <p className="text-xs mt-1 text-red-600">
                    Ensure your system clock is synchronized or try signing in again.
                  </p>
                )}
              </div>
              <button
                onClick={clearError}
                className="p-1 hover:bg-red-100 rounded-full transition-colors"
                aria-label="Dismiss error"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {success && (
            <div
              className="mb-4 p-4 bg-green-50 text-green-800 rounded-lg flex items-start gap-2 border border-green-200 shadow-md"
              role="status"
              aria-live="polite"
            >
              <CheckCircle size={20} className="mt-0.5 flex-shrink-0" />
              <span className="text-sm font-medium">{success}</span>
            </div>
          )}

          {!user ? (
            <>
              <div className="text-center mb-8">
                <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                    <BarChart3 size={28} className="text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">TradePro</h1>
                    <p className="text-gray-600 text-sm">Financial Dashboard</p>
                  </div>
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Start Trading Smarter
                </h2>
                <p className="text-gray-600 mb-4">
                  Sign in to access free market insights and analytics
                </p>

                {/* Free Tier Badge */}
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-full px-4 py-2 mb-4">
                  <Star size={16} className="text-green-600" />
                  <span className="text-sm font-medium text-green-800">Free Tier Available</span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap={false}
                    theme="filled_blue"
                    size="large"
                    text="signin_with"
                    shape="rectangular"
                  />
                </div>

                {/* Demo Login Button */}
                <button
                  onClick={handleDemoLogin}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-xl font-medium transition-all hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Zap size={20} />
                  )}
                  Try Demo Account
                </button>
              </div>

              {isLoading && (
                <div className="text-center text-blue-600 flex items-center justify-center gap-2">
                  <Loader2 size={20} className="animate-spin" />
                  <p>Signing in...</p>
                </div>
              )}

              {/* Free Tier Features Preview */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <Star size={18} className="text-blue-600" />
                  <h3 className="font-semibold text-gray-900">What's included in Free Tier:</h3>
                </div>
                <ul className="text-sm text-gray-600 space-y-2">
                  {FREE_TIER_FEATURES.slice(0, 3).map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setShowFeatures(!showFeatures)}
                  className="text-blue-600 text-sm font-medium mt-3 hover:text-blue-700"
                >
                  {showFeatures ? 'Show less' : 'View all features...'}
                </button>
                
                {showFeatures && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">Free Tier:</h4>
                    <ul className="text-sm text-gray-600 space-y-2 mb-4">
                      {FREE_TIER_FEATURES.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <Lock size={16} className="text-orange-500" />
                      Premium Features:
                    </h4>
                    <ul className="text-sm text-gray-500 space-y-2">
                      {PREMIUM_FEATURES.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Lock size={16} className="text-orange-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="text-center text-gray-600 text-sm mt-4">
                <p>Start with free tier, upgrade anytime for premium features</p>
                <p className="mt-2 text-xs">Ensure your backend is running on port 3005</p>
              </div>
            </>
          ) : (
            <div className="text-center">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-16 h-16 rounded-full mx-auto mb-4 border-2 border-blue-200"
              />
              <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>

              {/* Subscription Status */}
              <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {user.subscription?.active ? (
                    <>
                      <Star size={18} className="text-yellow-500" />
                      <span className="font-semibold text-gray-900">
                        {user.subscription.plan} Plan
                      </span>
                    </>
                  ) : (
                    <>
                      <Star size={18} className="text-blue-500" />
                      <span className="font-semibold text-gray-900">Free Tier</span>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {user.subscription?.active 
                    ? "Full platform access" 
                    : "Access to 5 cryptocurrencies with basic features"
                  }
                </p>
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Account Summary</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-600">Available Balance:</div>
                  <div className="font-medium">${(user.availableBalance ?? 0).toFixed(2)}</div>

                  <div className="text-gray-600">Total Withdrawn:</div>
                  <div className="font-medium">${(user.totalWithdrawn ?? 0).toFixed(2)}</div>

                  <div className="text-gray-600">Pending Withdrawals:</div>
                  <div className="font-medium">${(user.pendingWithdrawals ?? 0).toFixed(2)}</div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="mt-6 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-xl font-medium transition-all hover:shadow-lg mx-auto"
              >
                <LogOut size={20} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};