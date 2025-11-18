import { useState } from 'react';
import { ArrowLeft, Clock, DollarSign, TrendingUp, Activity, Brain, Target, BarChart3, AlertTriangle } from 'lucide-react';

type AITool = 'overview' | 'signals' | 'orderflow' | 'liquidity' | 'sentiment' | 'correlation' | 'arbitrage' | 'options' | 'liquidation';

const currencies = [
  { value: 'BTC/USDT', label: 'Bitcoin (BTC/USDT)' },
  { value: 'ETH/USDT', label: 'Ethereum (ETH/USDT)' },
  { value: 'SOL/USDT', label: 'Solana (SOL/USDT)' },
  { value: 'ADA/USDT', label: 'Cardano (ADA/USDT)' },
  { value: 'DOT/USDT', label: 'Polkadot (DOT/USDT)' },
  { value: 'LINK/USDT', label: 'Chainlink (LINK/USDT)' },
  { value: 'MATIC/USDT', label: 'Polygon (MATIC/USDT)' },
  { value: 'AVAX/USDT', label: 'Avalanche (AVAX/USDT)' },
  { value: 'UNI/USDT', label: 'Uniswap (UNI/USDT)' },
  { value: 'ATOM/USDT', label: 'Cosmos (ATOM/USDT)' }
];

const timeframes = [
  { value: '5m', label: '5m (5 Minutes)' },
  { value: '15m', label: '15m (15 Minutes)' },
  { value: '30m', label: '30m (30 Minutes)' },
  { value: '1h', label: '1h (1 Hour)' },
  { value: '3h', label: '3h (3 Hours)' },
  { value: '6h', label: '6h (6 Hours)' },
  { value: '12h', label: '12h (12 Hours)' },
  { value: '1d', label: '1d (1 Day)' }
];

interface AIToolsProps {
  isDarkMode: boolean;
}

export default function AITools({ isDarkMode }: AIToolsProps) {
  const [activeView, setActiveView] = useState<AITool>('overview');
  const [selectedCurrency, setSelectedCurrency] = useState('BTC/USDT');
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h');
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [timeframeDropdownOpen, setTimeframeDropdownOpen] = useState(false);

  const tools = [
    {
      id: 'signals' as AITool,
      title: 'AI Trade Signal Generator',
      description: 'Advanced ML algorithms analyze market patterns to generate high-confidence trading signals',
      icon: TrendingUp,
      color: 'emerald',
      stats: { signals: 24, accuracy: '87%', profit: '+12.4%' }
    },
    {
      id: 'orderflow' as AITool,
      title: 'AI Order Flow & Whale Tracker',
      description: 'Real-time detection of large orders and institutional trading patterns',
      icon: Activity,
      color: 'blue',
      stats: { whales: 8, volume: '$45M', alerts: 12 }
    },
    {
      id: 'liquidity' as AITool,
      title: 'AI Liquidity Zone & Order Block Finder',
      description: 'Identify key support/resistance levels and institutional order blocks',
      icon: Target,
      color: 'purple',
      stats: { zones: 6, blocks: 4, confidence: '91%' }
    },
    {
      id: 'sentiment' as AITool,
      title: 'AI Market Sentiment Analyzer',
      description: 'Analyze social media, news, and market data to gauge overall sentiment',
      icon: Brain,
      color: 'orange',
      stats: { sentiment: 'Bullish', score: '68%', sources: 1247 }
    },
    {
      id: 'correlation' as AITool,
      title: 'AI Correlation Analyzer',
      description: 'Track asset correlations and identify divergence trading opportunities',
      icon: BarChart3,
      color: 'cyan',
      stats: { pairs: 12, divergences: 3, correlation: '0.45' }
    },
    {
      id: 'arbitrage' as AITool,
      title: 'AI Arbitrage Finder',
      description: 'Real-time cross-exchange arbitrage opportunities with fee calculations',
      icon: Target,
      color: 'pink',
      stats: { exchanges: 8, opportunities: 5, profit: '0.5%' }
    },
    {
      id: 'options' as AITool,
      title: 'AI Options Flow Analyzer',
      description: 'Track unusual options activity and institutional positioning',
      icon: Activity,
      color: 'indigo',
      stats: { flows: 24, volume: '$45M', bias: 'Bullish' }
    },
    {
      id: 'liquidation' as AITool,
      title: 'AI Whale Liquidation Hunter',
      description: 'Predict liquidation cascades from open interest and whale positions',
      icon: AlertTriangle,
      color: 'red',
      stats: { levels: 6, risk: '$300M', distance: '2.1%' }
    }
  ];

  const renderToolOverview = () => (
    <div className="space-y-6">
      {/* Header with Dropdowns */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className={`text-2xl font-bold mb-2 transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>AI Trading Tools Coming Soon...</h2>
          <p className={`transition-colors duration-300 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>Advanced AI-powered analysis for professional trading</p>
        </div>
        
        {/* Currency and Timeframe Dropdowns */}
        <div className="flex gap-3">
          {/* Currency Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setCurrencyDropdownOpen(!currencyDropdownOpen);
                setTimeframeDropdownOpen(false);
              }}
              className={`flex items-center gap-2 border rounded-lg px-4 py-2 transition-colors ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' 
                  : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>{selectedCurrency}</span>
              <svg
                className={`w-4 h-4 transition-transform ${currencyDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {currencyDropdownOpen && (
              <div className={`absolute top-full left-0 mt-1 w-56 border rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto transition-colors duration-300 ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              }`}>
                {currencies.map((currency) => (
                  <button
                    key={currency.value}
                    onClick={() => {
                      setSelectedCurrency(currency.value);
                      setCurrencyDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 transition-colors ${
                      selectedCurrency === currency.value 
                        ? 'bg-emerald-600/20 text-emerald-400' 
                        : isDarkMode 
                          ? 'text-white hover:bg-gray-700' 
                          : 'text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {currency.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Timeframe Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setTimeframeDropdownOpen(!timeframeDropdownOpen);
                setCurrencyDropdownOpen(false);
              }}
              className={`flex items-center gap-2 border rounded-lg px-4 py-2 transition-colors ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' 
                  : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{selectedTimeframe}</span>
              <svg
                className={`w-4 h-4 transition-transform ${timeframeDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {timeframeDropdownOpen && (
              <div className={`absolute top-full left-0 mt-1 w-48 border rounded-lg shadow-xl z-50 transition-colors duration-300 ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              }`}>
                {timeframes.map((timeframe) => (
                  <button
                    key={timeframe.value}
                    onClick={() => {
                      setSelectedTimeframe(timeframe.value);
                      setTimeframeDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 transition-colors ${
                      selectedTimeframe === timeframe.value 
                        ? 'bg-emerald-600/20 text-emerald-400' 
                        : isDarkMode 
                          ? 'text-white hover:bg-gray-700' 
                          : 'text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {timeframe.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const colorClasses = {
            emerald: 'from-emerald-600 to-emerald-700 hover:shadow-emerald-500/25',
            blue: 'from-blue-600 to-blue-700 hover:shadow-blue-500/25',
            purple: 'from-purple-600 to-purple-700 hover:shadow-purple-500/25',
            orange: 'from-orange-600 to-orange-700 hover:shadow-orange-500/25',
            cyan: 'from-cyan-600 to-cyan-700 hover:shadow-cyan-500/25',
            pink: 'from-pink-600 to-pink-700 hover:shadow-pink-500/25',
            indigo: 'from-indigo-600 to-indigo-700 hover:shadow-indigo-500/25',
            red: 'from-red-600 to-red-700 hover:shadow-red-500/25'
          };

          return (
            <div
              key={tool.id}
              onClick={() => setActiveView(tool.id)}
              className={`border rounded-xl p-6 cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-2xl ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200 shadow-sm'
              } ${colorClasses[tool.color as keyof typeof colorClasses]}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${colorClasses[tool.color as keyof typeof colorClasses].split(' ')[0]} ${colorClasses[tool.color as keyof typeof colorClasses].split(' ')[1]}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-centernetwork error gap-1">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-emerald-400">Live</span>
                </div>
              </div>
              
              <h3 className={`text-xl font-semibold mb-2 transition-colors duration-300 ${
                isDarkMode ? 'text-white>' : 'text-gray-900'
              }`}>{tool.title}</h3>
              <p className={`mb-4 text-sm leading-relaxed transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>{tool.description}</p>
              
              <div className="flex justify-between items-center text-sm">
                <div className="flex gap-4">
                  {Object.entries(tool.stats).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div className={`font-semibold transition-colors duration-300 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>{value}</div>
                      <div className={`capitalize transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-600'
                      }`}>{key}</div>
                    </div>
                  ))}
                </div>
                <BarChart3 className={`w-5 h-5 transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-600'
                }`} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderActiveView = () => {
    if (activeView === 'overview') {
      return renderToolOverview();
    }

    const selectedTool = tools.find(tool => tool.id === activeView);
    const Icon = selectedTool?.icon;

    return (
      <div className={`flex flex-col items-center justify-center min-h-[400px] border rounded-xl p-8 transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700 text-white' 
          : 'bg-white border-gray-200 text-gray-900'
      }`}>
        {Icon && <Icon className="w-16 h-16 mb-4 text-emerald-500" />}
        <h2 className="text-2xl font-bold mb-2">{selectedTool?.title}</h2>
        <p className={`text-lg mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          This functionality is coming soon!
        </p>
        <p className={`text-sm mb-6 text-center max-w-md ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          We're working hard to bring you {selectedTool?.title}. Stay tuned for updates!
        </p>
        <button
          onClick={() => setActiveView('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            isDarkMode 
              ? 'bg-gray-700 text-white hover:bg-gray-600' 
              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to AI Tools
        </button>
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* Close dropdowns when clicking outside */}
      {(currencyDropdownOpen || timeframeDropdownOpen) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setCurrencyDropdownOpen(false);
            setTimeframeDropdownOpen(false);
          }}
        />
      )}

      {activeView !== 'overview' && (
        <button
          onClick={() => setActiveView('overview')}
          className={`flex items-center gap-2 transition-colors mb-6 group ${
            isDarkMode 
              ? 'text-gray-400 hover:text-white' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to AI Tools
        </button>
      )}
      
      {renderActiveView()}
    </div>
  );
}