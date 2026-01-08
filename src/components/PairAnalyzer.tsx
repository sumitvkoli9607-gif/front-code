// src/components/PairAnalyzer.tsx
import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ScatterChart,
  Scatter,
} from 'recharts';
import { TrendingUp, TrendingDown, ArrowLeftRight, Zap } from 'lucide-react';

/* --------------------  T Y P E S  -------------------- */
type Coin = { symbol: string; name: string; price: number; change24h: number };
type CorrelationAnswer = { coin1: string; coin2: string; correlation: string; dataPoints: number };
type HistoryPoint = { date: string; price: number };
type TopCorr = { coin1: string; coin2: string; correlation: number };

/* --------------------  U R L  -------------------- */
const API = (path: string) => `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${path}`;

/* --------------------  C O M P O N E N T  -------------------- */
export default function PairAnalyzer() {
  /* ---- coin selectors ---- */
  const [coin1, setCoin1] = useState('BTC');
  const [coin2, setCoin2] = useState('ETH');

  /* ---- data ---- */
  const [coins, setCoins] = useState<Coin[]>([]);
  const [correlation, setCorrelation] = useState<number | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [coin1History, setCoin1History] = useState<HistoryPoint[]>([]);
  const [coin2History, setCoin2History] = useState<HistoryPoint[]>([]);
  const [topCorrelations, setTopCorrelations] = useState<TopCorr[]>([]);

  /* ---- fetch helpers ---- */
  const fetchCoins = async () => {
    const res = await fetch(API('/api/coins'));
    const data: Coin[] = await res.json();
    setCoins(data);
  };

  const fetchCorrelation = async (c1: string, c2: string) => {
    const res = await fetch(API(`/api/correlation/${c1}/${c2}`));
    if (!res.ok) return;
    const ans: CorrelationAnswer = await res.json();
    setCorrelation(parseFloat(ans.correlation));
  };

  const fetchPairChart = async (c1: string, c2: string) => {
    const res = await fetch(API(`/api/pair-chart/${c1}/${c2}/30`));
    if (!res.ok) return;
    const data = await res.json();
    setChartData(data);
  };

  const fetchHistory = async (sym: string, setter: (d: HistoryPoint[]) => void) => {
    const res = await fetch(API(`/api/price-history/${sym}/30`));
    if (!res.ok) return;
    const data = await res.json();
    setter(data.map((d: any) => ({ date: d.date, price: d.price })));
  };

  const fetchTopCorrelations = async () => {
    const res = await fetch(API('/api/top-correlations'));
    if (!res.ok) return;
    const data: TopCorr[] = await res.json();
    setTopCorrelations(data);
  };

  /* ---- effects ---- */
  useEffect(() => {
    fetchCoins();
    fetchTopCorrelations();
  }, []);

  useEffect(() => {
    if (!coin1 || !coin2) return;
    fetchCorrelation(coin1, coin2);
    fetchPairChart(coin1, coin2);
    fetchHistory(coin1, setCoin1History);
    fetchHistory(coin2, setCoin2History);
  }, [coin1, coin2]);

  /* ---- derived ---- */
  const coin1Data = coins.find((c) => c.symbol === coin1);
  const coin2Data = coins.find((c) => c.symbol === coin2);
  const scatterData = chartData.map((d) => ({ x: d[coin1] as number, y: d[coin2] as number }));

  /* ---- UI helpers ---- */
  const strength = (r: number) =>
    Math.abs(r) >= 0.8 ? 'Very Strong' : Math.abs(r) >= 0.6 ? 'Strong' : Math.abs(r) >= 0.4 ? 'Moderate' : 'Weak';

  /* ---- render ---- */
  return (
    <div className="space-y-6 p-6">
      {/* ======  TOP 10 CORRELATIONS  ====== */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="w-6 h-6" />
          <h2 className="text-xl font-bold">Top 10 Correlations (30 d)</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {topCorrelations.map((t, _i) => (
            <div
              key={`${t.coin1}-${t.coin2}`}
              className="bg-white/10 rounded-xl p-3 text-center cursor-pointer hover:bg-white/20 transition"
              onClick={() => {
                setCoin1(t.coin1);
                setCoin2(t.coin2);
              }}
            >
              <div className="font-semibold">
                {t.coin1}/{t.coin2}
              </div>
              <div className="text-sm opacity-90">{t.correlation.toFixed(3)}</div>
              <div className="text-xs opacity-75">{strength(t.correlation)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ======  ORIGINAL HEADER  ====== */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pair Analyzer</h1>
        <p className="text-gray-600">Detailed correlation analysis between two cryptocurrencies</p>
      </div>

      {/* ======  COIN SELECTORS  ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* coin-1 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">First Coin</label>
          <select
            value={coin1}
            onChange={(e) => setCoin1(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          >
            {coins.map((c) => (
              <option key={c.symbol} value={c.symbol}>
                {c.symbol} - {c.name}
              </option>
            ))}
          </select>

          {coin1Data && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-900">${coin1Data.price.toLocaleString()}</span>
                <div className="flex items-center gap-2">
                  {coin1Data.change24h >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-500" />
                  )}
                  <span className={`font-semibold ${coin1Data.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {coin1Data.change24h >= 0 ? '+' : ''}
                    {coin1Data.change24h.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* coin-2 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">Second Coin</label>
          <select
            value={coin2}
            onChange={(e) => setCoin2(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          >
            {coins.map((c) => (
              <option key={c.symbol} value={c.symbol}>
                {c.symbol} - {c.name}
              </option>
            ))}
          </select>

          {coin2Data && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-900">${coin2Data.price.toLocaleString()}</span>
                <div className="flex items-center gap-2">
                  {coin2Data.change24h >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-500" />
                  )}
                  <span className={`font-semibold ${coin2Data.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {coin2Data.change24h >= 0 ? '+' : ''}
                    {coin2Data.change24h.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ======  CORRELATION BANNER  ====== */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <ArrowLeftRight className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Correlation Coefficient</h2>
            </div>
            <p className="text-indigo-100">Measures how closely {coin1} and {coin2} move together</p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold">{correlation?.toFixed(3) ?? '…'}</div>
            <div className="text-indigo-100 mt-1">{correlation === null ? 'Loading…' : strength(correlation)}</div>
          </div>
        </div>
      </div>

      {/* ======  30-DAY COMPARISON CHART  ====== */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Price Movement Comparison (30 Days)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
            <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
            <YAxis yAxisId="left" stroke="#6366F1" fontSize={12} />
            <YAxis yAxisId="right" orientation="right" stroke="#8B5CF6" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
              }}
            />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey={coin1} stroke="#6366F1" strokeWidth={2} dot={false} name={coin1} />
            <Line yAxisId="right" type="monotone" dataKey={coin2} stroke="#8B5CF6" strokeWidth={2} dot={false} name={coin2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ======  INDIVIDUAL 30-DAY HISTORY  ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">{coin1} Price History</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={coin1History}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                }}
              />
              <Line type="monotone" dataKey="price" stroke="#6366F1" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">{coin2} Price History</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={coin2History}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                }}
              />
              <Line type="monotone" dataKey="price" stroke="#8B5CF6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ======  SCATTER PLOT  ====== */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Scatter Plot Analysis</h3>
        <p className="text-sm text-gray-600 mb-4">Each point represents a simultaneous price observation. A linear pattern indicates strong correlation.</p>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
            <XAxis dataKey="x" name={coin1} stroke="#9CA3AF" fontSize={12} />
            <YAxis dataKey="y" name={coin2} stroke="#9CA3AF" fontSize={12} />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{
                backgroundColor: '#1F2937',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
              }}
            />
            <Scatter data={scatterData} fill="#8B5CF6" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}