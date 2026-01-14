// components/TermsConditions.tsx
import React from 'react';

const TermsConditions: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12 pt-10">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Terms & Conditions
          </h1>
          <p className="text-gray-400">Last Updated: {new Date().toLocaleDateString()}</p>
        </header>

        <div className="space-y-8">
          <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-blue-400">1. Acceptance of Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              By accessing and using Trademino Pro ("the Service"), you acknowledge that you have read, understood, 
              and agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, 
              you must discontinue use of the Service immediately.
            </p>
          </section>

          <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-blue-400">2. Service Description</h2>
            <div className="space-y-4">
              <p className="text-gray-300">
                Trademino Pro is an advanced cryptocurrency market analysis platform that provides:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-300">
                <li>Real-time market data analysis from Binance exchange</li>
                <li>Technical analysis using advanced mathematical models</li>
                <li>Breakout detection algorithms</li>
                <li>Support and resistance level calculations</li>
                <li>Market sentiment and psychology analysis</li>
                <li>RSI (Relative Strength Index) monitoring</li>
                <li>Multi-timeframe correlation analysis</li>
              </ul>
              <p className="text-gray-300">
                Our platform uses sophisticated mathematical models including:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-gray-900/70 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-300 mb-2">Advanced Technical Analysis</h3>
                  <p className="text-sm text-gray-400">
                    Using pivot points, Fibonacci retracements, moving averages, and volume profile analysis
                  </p>
                </div>
                <div className="bg-gray-900/70 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-300 mb-2">Breakout Detection</h3>
                  <p className="text-sm text-gray-400">
                    Proprietary algorithms detecting support/resistance breaks with volume confirmation
                  </p>
                </div>
                <div className="bg-gray-900/70 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-300 mb-2">Statistical Correlation</h3>
                  <p className="text-sm text-gray-400">
                    Pearson correlation coefficients and multi-timeframe analysis across cryptocurrency pairs
                  </p>
                </div>
                <div className="bg-gray-900/70 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-300 mb-2">Machine Learning Models</h3>
                  <p className="text-sm text-gray-400">
                    Pattern recognition and prediction models for market movement probabilities
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-blue-400">3. Data Sources & Accuracy</h2>
            <div className="space-y-4">
              <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-300 mb-2">Primary Data Source</h3>
                <p className="text-gray-300">
                  All market data is sourced from <span className="font-semibold text-yellow-400">Binance cryptocurrency exchange</span> 
                  via their official WebSocket API and REST API endpoints. We process real-time 5-minute candle data for accurate analysis.
                </p>
              </div>
              <p className="text-gray-300">
                Our mathematical calculations include but are not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-300">
                <li>RSI calculations using Wilder's smoothing method</li>
                <li>ATR (Average True Range) volatility measurements</li>
                <li>Complex correlation matrices across 55+ cryptocurrency pairs</li>
                <li>Volume-weighted price action analysis</li>
                <li>Multi-timeframe convergence/divergence detection</li>
                <li>Probability-based trade signal generation</li>
              </ul>
              <p className="text-yellow-400 font-medium">
                ⚠️ Important: While we use advanced mathematical models, all analysis is for informational purposes only. 
                Past performance does not guarantee future results. Cryptocurrency trading involves substantial risk.
              </p>
            </div>
          </section>

          <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-blue-400">4. User Responsibilities</h2>
            <div className="space-y-4">
              <ul className="list-disc pl-6 space-y-2 text-gray-300">
                <li>You are responsible for your own trading decisions and financial outcomes</li>
                <li>You must comply with all applicable laws and regulations in your jurisdiction</li>
                <li>You agree not to misuse the Service or attempt to reverse engineer our algorithms</li>
                <li>You acknowledge that cryptocurrency markets are highly volatile</li>
                <li>You understand that technical analysis has limitations and is not infallible</li>
              </ul>
            </div>
          </section>

          <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-blue-400">5. Subscription & Payments</h2>
            <div className="space-y-4">
              <p className="text-gray-300">
                Our Service offers both Free and Enterprise tiers. Enterprise subscriptions provide access to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-300">
                <li>All 55+ cryptocurrency pairs (vs limited pairs in Free tier)</li>
                <li>All timeframes from 15-minute to 24-hour analysis</li>
                <li>Advanced breakout detection with Telegram alerts</li>
                <li>Priority data updates and enhanced notification systems</li>
                <li>Unlimited historical data access</li>
              </ul>
              <p className="text-gray-300">
                Payments are processed securely through PayPal. All subscription fees are non-refundable unless 
                required by applicable law.
              </p>
            </div>
          </section>

          <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-blue-400">6. Limitation of Liability</h2>
            <p className="text-gray-300 leading-relaxed">
              Trademino Pro and its developers shall not be liable for any direct, indirect, incidental, special, 
              consequential, or exemplary damages resulting from:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-300">
              <li>Trading decisions based on our analysis</li>
              <li>Loss of capital in cryptocurrency markets</li>
              <li>Service interruptions or data inaccuracies</li>
              <li>Third-party API failures (including Binance API)</li>
              <li>Technical issues or delays in data processing</li>
            </ul>
            <p className="mt-4 text-yellow-400 font-medium">
              Maximum liability is limited to the amount paid for subscription services in the preceding 12 months.
            </p>
          </section>

          <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-blue-400">7. Changes to Terms</h2>
            <p className="text-gray-300">
              We reserve the right to modify these Terms at any time. Continued use of the Service after changes 
              constitutes acceptance of the new Terms. Users will be notified of significant changes via email or 
              in-app notifications.
            </p>
          </section>

          <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-blue-400">8. Contact Information</h2>
            <p className="text-gray-300">
              For questions about these Terms, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-gray-900/50 rounded-lg">
              <p className="text-blue-300">Email: legal@trademino.com</p>
              <p className="text-gray-400 text-sm mt-2">Response time: 2-3 business days</p>
            </div>
          </section>

          <div className="text-center py-8 border-t border-gray-700">
            <p className="text-gray-400">
              By using Trademino Pro, you acknowledge that you have read, understood, 
              and agree to be bound by these Terms and Conditions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;