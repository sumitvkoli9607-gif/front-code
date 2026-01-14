// components/PrivacyPolicy.tsx
import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12 pt-10">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-500 to-teal-600 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-gray-400">Last Updated: {new Date().toLocaleDateString()}</p>
        </header>

        <div className="space-y-8">
          <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-green-400">1. Introduction</h2>
            <p className="text-gray-300 leading-relaxed">
              At Trademino Pro, we take your privacy seriously. This Privacy Policy explains how we collect, 
              use, disclose, and safeguard your information when you use our cryptocurrency market analysis 
              platform. We are committed to protecting your personal data and being transparent about our practices.
            </p>
          </section>

          <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-green-400">2. Information We Collect</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-blue-300">A. Personal Information</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li><span className="font-medium">Email Address:</span> For account creation and communication</li>
                  <li><span className="font-medium">Name:</span> As provided via Google OAuth authentication</li>
                  <li><span className="font-medium">Profile Picture:</span> From Google account for personalization</li>
                  <li><span className="font-medium">Telegram Information:</span> If you link your Telegram account for alerts</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-blue-300">B. Usage Data</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li><span className="font-medium">Analytics Data:</span> Page views, feature usage, and interaction patterns</li>
                  <li><span className="font-medium">Notification Preferences:</span> Your alert settings and notification history</li>
                  <li><span className="font-medium">Technical Data:</span> IP addresses, browser type, device information</li>
                  <li><span className="font-medium">Performance Metrics:</span> Response times and system performance data</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-blue-300">C. Market Data Processing</h3>
                <div className="bg-gray-900/70 p-4 rounded-lg">
                  <p className="text-gray-300">
                    We process but <span className="font-semibold text-green-300">do not store</span> your personal trading data. 
                    Our analysis is based on:
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-300">
                    <li>Public Binance market data (price, volume, order book information)</li>
                    <li>Mathematical calculations on market data only</li>
                    <li>No access to your Binance account or trading history</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-green-400">3. How We Use Your Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-900/50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-300 mb-2">Service Provision</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Account creation and authentication</li>
                  <li>• Personalized market analysis</li>
                  <li>• Breakout and RSI alert delivery</li>
                  <li>• Subscription management</li>
                </ul>
              </div>
              <div className="bg-gray-900/50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-300 mb-2">Communication</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Important service updates</li>
                  <li>• Security notifications</li>
                  <li>• Response to inquiries</li>
                  <li>• Legal/regulatory communications</li>
                </ul>
              </div>
              <div className="bg-gray-900/50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-300 mb-2">Service Improvement</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Algorithm optimization</li>
                  <li>• Feature development</li>
                  <li>• Performance monitoring</li>
                  <li>• Bug detection and fixing</li>
                </ul>
              </div>
              <div className="bg-gray-900/50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-300 mb-2">Security & Compliance</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Fraud prevention</li>
                  <li>• Legal obligation compliance</li>
                  <li>• Terms of Service enforcement</li>
                  <li>• System security maintenance</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-green-400">4. Data Security</h2>
            <div className="space-y-4">
              <div className="bg-green-900/20 border border-green-800/50 rounded-lg p-4">
                <h3 className="font-semibold text-green-300 mb-2">Advanced Security Measures</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center">
                    <span className="mr-2">🔐</span>
                    <span><span className="font-medium">Encryption:</span> All data encrypted in transit (TLS 1.3) and at rest (AES-256)</span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">🛡️</span>
                    <span><span className="font-medium">Authentication:</span> JWT tokens with short expiration times</span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">⚡</span>
                    <span><span className="font-medium">Regular Audits:</span> Security vulnerability assessments</span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">📊</span>
                    <span><span className="font-medium">Access Controls:</span> Strict role-based data access</span>
                  </li>
                </ul>
              </div>
              <p className="text-gray-300">
                We implement industry-standard security measures to protect your personal information. However, 
                no electronic transmission or storage method is 100% secure. We cannot guarantee absolute security.
              </p>
            </div>
          </section>

          <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-green-400">5. Data Sharing & Third Parties</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-blue-300">Service Providers</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-900/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-300 mb-2">Google OAuth</h4>
                    <p className="text-sm text-gray-400">Secure authentication only - we don't access your Google data beyond email and name</p>
                  </div>
                  <div className="bg-gray-900/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-300 mb-2">Binance API</h4>
                    <p className="text-sm text-gray-400">Market data feed only - no account access or trading permissions</p>
                  </div>
                  <div className="bg-gray-900/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-300 mb-2">Telegram API</h4>
                    <p className="text-sm text-gray-400">Notification delivery only - message content is controlled by you</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-blue-300">Legal Requirements</h3>
                <p className="text-gray-300">
                  We may disclose your information if required by law, regulation, or legal process. We will 
                  notify you when legally permitted to do so.
                </p>
              </div>

              <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4">
                <h3 className="font-semibold text-red-300 mb-2">What We Never Do</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li>Sell your personal data to third parties</li>
                  <li>Share your data with advertisers</li>
                  <li>Access your cryptocurrency wallets or exchange accounts</li>
                  <li>Store sensitive financial information</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-green-400">6. Data Retention</h2>
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-gray-300">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="py-2 px-4 text-left">Data Type</th>
                      <th className="py-2 px-4 text-left">Retention Period</th>
                      <th className="py-2 px-4 text-left">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-800">
                      <td className="py-3 px-4">Account Information</td>
                      <td className="py-3 px-4">While account is active + 30 days</td>
                      <td className="py-3 px-4 text-gray-400">Service provision</td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="py-3 px-4">Notification History</td>
                      <td className="py-3 px-4">10 hours (automatic deletion)</td>
                      <td className="py-3 px-4 text-gray-400">Performance optimization</td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="py-3 px-4">Market Analysis Data</td>
                      <td className="py-3 px-4">5 minutes cache only</td>
                      <td className="py-3 px-4 text-gray-400">Real-time accuracy</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4">Telegram Alert Data</td>
                      <td className="py-3 px-4">30 days</td>
                      <td className="py-3 px-4 text-gray-400">Notification tracking</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-green-400">7. Your Rights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-900/50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-300 mb-2">Access & Control</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• Access your personal data</li>
                  <li>• Correct inaccurate information</li>
                  <li>• Delete your account and data</li>
                  <li>• Export your data (GDPR compliant)</li>
                  <li>• Opt-out of non-essential communications</li>
                </ul>
              </div>
              <div className="bg-gray-900/50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-300 mb-2">Preferences</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• Adjust notification settings</li>
                  <li>• Control Telegram integration</li>
                  <li>• Manage email preferences</li>
                  <li>• Configure alert thresholds</li>
                  <li>• Set data sharing preferences</li>
                </ul>
              </div>
            </div>
            <p className="mt-4 text-gray-300">
              To exercise your rights, contact us at <span className="text-blue-300">privacy@trademino.com</span>. 
              We will respond within 30 days as required by applicable laws.
            </p>
          </section>

          <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-green-400">8. Cookies & Tracking</h2>
            <div className="space-y-4">
              <p className="text-gray-300">
                We use essential cookies for:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-300">
                <li><span className="font-medium">Authentication:</span> Maintaining secure login sessions</li>
                <li><span className="font-medium">Security:</span> Preventing fraudulent activity</li>
                <li><span className="font-medium">Performance:</span> Optimizing service speed and reliability</li>
              </ul>
              <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-lg p-4">
                <p className="text-yellow-200">
                  We do not use tracking cookies for advertising or third-party analytics. 
                  Our focus is on service functionality, not user profiling.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-green-400">9. International Data Transfers</h2>
            <p className="text-gray-300">
              Our servers are located in secure data centers. By using our service, you acknowledge that 
              your data may be transferred to and processed in countries other than your own. We ensure 
              appropriate safeguards are in place for international data transfers.
            </p>
          </section>

          <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-green-400">10. Children's Privacy</h2>
            <p className="text-gray-300">
              Our Service is not intended for users under 18 years of age. We do not knowingly collect 
              personal information from children. If we become aware of such collection, we will take 
              steps to delete the information promptly.
            </p>
          </section>

          <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-green-400">11. Changes to Privacy Policy</h2>
            <p className="text-gray-300">
              We may update this Privacy Policy periodically. We will notify you of significant changes 
              via email or prominent notice within the Service. Your continued use after changes 
              constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-green-400">12. Contact Us</h2>
            <div className="space-y-4">
              <p className="text-gray-300">
                For privacy-related inquiries or to exercise your rights:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-900/50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-300 mb-2">Privacy Officer</h3>
                  <p className="text-gray-300">Email: privacy@trademino.com</p>
                  <p className="text-gray-400 text-sm mt-1">For data access requests and privacy concerns</p>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-300 mb-2">Technical Support</h3>
                  <p className="text-gray-300">Email: support@trademino.com</p>
                  <p className="text-gray-400 text-sm mt-1">For technical issues and account help</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                Response time: We aim to respond to all privacy inquiries within 30 days as required by law.
              </p>
            </div>
          </section>

          <div className="text-center py-8 border-t border-gray-700">
            <p className="text-gray-400 text-sm">
              This Privacy Policy is designed to be transparent about how we handle your data. 
              We believe in privacy by design and default in all our services.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;