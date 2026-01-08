import { Coin, CorrelationData, ChartData } from './type3';

export const COINS: Coin[] = [
  { symbol: 'BTC', name: 'Bitcoin', price: 42350.67, change24h: 2.45, marketCap: 828000000000, volume24h: 28500000000 },
  { symbol: 'ETH', name: 'Ethereum', price: 2245.89, change24h: 3.21, marketCap: 270000000000, volume24h: 15200000000 },
  { symbol: 'SOL', name: 'Solana', price: 98.45, change24h: 5.67, marketCap: 42000000000, volume24h: 2800000000 },
  { symbol: 'BNB', name: 'BNB', price: 312.34, change24h: 1.89, marketCap: 48000000000, volume24h: 1200000000 },
  { symbol: 'XRP', name: 'Ripple', price: 0.6234, change24h: -1.23, marketCap: 33000000000, volume24h: 1800000000 },
  { symbol: 'ADA', name: 'Cardano', price: 0.5678, change24h: 2.34, marketCap: 20000000000, volume24h: 580000000 },
  { symbol: 'DOGE', name: 'Dogecoin', price: 0.0892, change24h: -0.45, marketCap: 12600000000, volume24h: 920000000 },
  { symbol: 'AVAX', name: 'Avalanche', price: 37.89, change24h: 4.12, marketCap: 14000000000, volume24h: 680000000 },
  { symbol: 'TON', name: 'Toncoin', price: 2.34, change24h: 3.45, marketCap: 8000000000, volume24h: 340000000 },
  { symbol: 'TRX', name: 'Tron', price: 0.1045, change24h: 1.67, marketCap: 9200000000, volume24h: 450000000 },
];

const correlationMatrix: { [key: string]: number } = {
  'BTC-ETH': 0.92,
  'BTC-SOL': 0.78,
  'BTC-BNB': 0.85,
  'BTC-XRP': 0.65,
  'BTC-ADA': 0.72,
  'BTC-DOGE': 0.58,
  'BTC-AVAX': 0.81,
  'BTC-TON': 0.68,
  'BTC-TRX': 0.62,
  'ETH-SOL': 0.88,
  'ETH-BNB': 0.82,
  'ETH-XRP': 0.61,
  'ETH-ADA': 0.75,
  'ETH-DOGE': 0.54,
  'ETH-AVAX': 0.86,
  'ETH-TON': 0.71,
  'ETH-TRX': 0.59,
  'SOL-BNB': 0.76,
  'SOL-XRP': 0.55,
  'SOL-ADA': 0.69,
  'SOL-DOGE': 0.48,
  'SOL-AVAX': 0.84,
  'SOL-TON': 0.73,
  'SOL-TRX': 0.56,
  'BNB-XRP': 0.64,
  'BNB-ADA': 0.71,
  'BNB-DOGE': 0.52,
  'BNB-AVAX': 0.79,
  'BNB-TON': 0.67,
  'BNB-TRX': 0.61,
  'XRP-ADA': 0.77,
  'XRP-DOGE': 0.63,
  'XRP-AVAX': 0.58,
  'XRP-TON': 0.66,
  'XRP-TRX': 0.81,
  'ADA-DOGE': 0.59,
  'ADA-AVAX': 0.68,
  'ADA-TON': 0.65,
  'ADA-TRX': 0.72,
  'DOGE-AVAX': 0.51,
  'DOGE-TON': 0.55,
  'DOGE-TRX': 0.64,
  'AVAX-TON': 0.74,
  'AVAX-TRX': 0.63,
  'TON-TRX': 0.69,
};

export function getCorrelation(coin1: string, coin2: string): number {
  if (coin1 === coin2) return 1.0;

  const key1 = `${coin1}-${coin2}`;
  const key2 = `${coin2}-${coin1}`;

  return correlationMatrix[key1] || correlationMatrix[key2] || 0;
}

export function getAllCorrelations(): CorrelationData[] {
  const correlations: CorrelationData[] = [];

  for (let i = 0; i < COINS.length; i++) {
    for (let j = i; j < COINS.length; j++) {
      correlations.push({
        coin1: COINS[i].symbol,
        coin2: COINS[j].symbol,
        correlation: getCorrelation(COINS[i].symbol, COINS[j].symbol),
      });
    }
  }

  return correlations;
}

export function getTopCorrelatedPairs(limit: number = 6): CorrelationData[] {
  return getAllCorrelations()
    .filter(c => c.coin1 !== c.coin2)
    .sort((a, b) => b.correlation - a.correlation)
    .slice(0, limit);
}

export function generateMockChartData(coin1: string, coin2: string, days: number = 30): ChartData[] {
  const data: ChartData[] = [];
  const coin1Data = COINS.find(c => c.symbol === coin1);
  const coin2Data = COINS.find(c => c.symbol === coin2);

  if (!coin1Data || !coin2Data) return data;

  let price1 = coin1Data.price;
  let price2 = coin2Data.price;

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const volatility1 = 0.03;
    const volatility2 = 0.03;
    const change1 = (Math.random() - 0.5) * volatility1;
    const change2 = (Math.random() - 0.5) * volatility2;

    price1 *= (1 + change1);
    price2 *= (1 + change2);

    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      [coin1]: parseFloat(price1.toFixed(2)),
      [coin2]: parseFloat(price2.toFixed(2)),
    });
  }

  return data;
}

export function generatePriceHistory(symbol: string, days: number = 30): ChartData[] {
  const data: ChartData[] = [];
  const coinData = COINS.find(c => c.symbol === symbol);

  if (!coinData) return data;

  let price = coinData.price;

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const volatility = 0.03;
    const change = (Math.random() - 0.5) * volatility;
    price *= (1 + change);

    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: parseFloat(price.toFixed(2)),
    });
  }

  return data;
}
