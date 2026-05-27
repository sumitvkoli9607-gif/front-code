// src/components/TraderOverview.tsx
import React from 'react';
import {
  AlertTriangle,
  Activity as ActivityIcon,
  Target,
  BarChart3,
  Shield,
  Lightbulb,
  Layers,
  AlertCircle,
  PieChart,
  Droplets,
  Building2,
  BarChart4,
  Waves,
  Zap,
  Activity,
} from 'lucide-react';

interface LiquidityZone {
  price: number;
  strength: number;
  type: 'volume_node' | 'consolidation' | 'equal_high' | 'equal_low' | 'round_number' | 'institutional' | 'cluster';
  description: string;
  volume?: number;
  volumeMultiplier?: number;
  touches?: number;
  clusterSize?: number;
  reactions?: number;
  recentActivity?: boolean;
  quality?: number;
}

interface LiquidityAnalysis {
  status: 'neutral' | 'near_liquidity' | 'approaching_liquidity';
  nearestZone: LiquidityZone | null;
  distanceToNearest: number;
  liquidityStrength: number;
  sweepRisk: 'low' | 'medium' | 'high';
  institutionalActivity: boolean;
}

interface LiquidityZones {
  zones: LiquidityZone[];
  totalZones: number;
  strongestZone: LiquidityZone | null;
  institutionalZones: LiquidityZone[];
  highVolumeNodes: LiquidityZone[];
  consolidationZones: LiquidityZone[];
  analysis: LiquidityAnalysis;
}

interface MarketOverview {
  symbol: string;
  currentPrice: number;
  priceChange24h: number;
  
  tradeSetup: {
    signal: string;
    confidence: number;
    entryZones: number[];
    stopLoss: number;
    takeProfit: number;
    positionSize: string;
    rewardRiskRatio: number;
    reasons: string[];
    probabilityFactors?: {
      timeframeAlignment: string;
      trendConsistency: number;
      volumeConfirmation: boolean;
      supportResistanceQuality: number;
      adjustedProbability: number;
    };
  };
  
  keyLevels: {
    immediateSupport: number;
    immediateResistance: number;
    nextMajorSupport: number;
    nextMajorResistance: number;
    breakoutLevel: number;
    strongestSupport?: number;
    strongestResistance?: number;
  };
  
  momentum: {
    direction: string;
    strength: number;
    acceleration: string;
    rsi: number;
    divergence?: Array<{
      type: string;
      timeframe: string;
      strength: number;
    }>;
  };
  
  riskMetrics: {
    volatility: string;
    atr: number;
    maxRiskPerTrade: string;
    rewardRiskRatio: number;
    winProbability?: number;
  };
  
  volume: {
    status: string;
    relativeVolume: number;
    volumeSpike: boolean;
    volumeProfile?: Array<{
      price: number;
      volume: number;
      strength: number;
      description: string;
    }>;
  };
  
  marketStructure: {
    trend: string;
    phase: string;
    bias: string;
    structure?: {
      higherHighs: number;
      higherLows: number;
      lowerHighs: number;
      lowerLows: number;
    };
  };
  
  multiTimeframeAnalysis?: {
    timeframes: Record<string, any>;
    consensus: string;
    strength: number;
  };
  
  priceAction?: {
    pattern: string;
    candles: string;
    rejection: boolean;
  };
  
  timeframeAlignment: string;
  summary: string;
  timestamp: number;
  signalData?: {
    type: string;
    confidence: number;
    entryPrice: number;
    targetPrice: number;
    stopPrice: number;
    validUntil: number;
  };
  
  liquidityZones?: LiquidityZones;
  breakouts?: {
    detected: boolean;
    breakouts: Array<{
      type: string;
      strength: string;
      breakoutPercent: number;
      volumeMultiplier: number;
    }>;
    count: number;
  };
}

interface TraderOverviewProps {
  overview: MarketOverview | null;
  loading: boolean;
}

export const TraderOverview: React.FC<TraderOverviewProps> = ({ overview, loading }) => {
  const formatPrice = (price: number) => {
    if (price === 0 || !price) return '0.0000';
    
    if (price < 0.0001) return price.toFixed(8);
    else if (price < 0.001) return price.toFixed(7);
    else if (price < 0.01) return price.toFixed(6);
    else if (price < 0.1) return price.toFixed(5);
    else if (price < 1) return price.toFixed(4);
    else if (price < 10) return price.toFixed(3);
    else if (price < 100) return price.toFixed(2);
    else if (price < 1000) return price.toFixed(1);
    else return price.toFixed(0);
  };


  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVolumeColor = (status: string) => {
    switch (status) {
      case 'accumulation':
      case 'strong_accumulation':
        return 'text-green-600 bg-green-100';
      case 'distribution':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getMomentumColor = (strength: number) => {
    if (strength > 70) return 'text-green-600 bg-green-50';
    if (strength < 30) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getRSIColor = (rsi: number) => {
    if (rsi >= 70) return 'text-red-600';
    if (rsi <= 30) return 'text-green-600';
    return 'text-gray-600';
  };

  const getDivergenceColor = (type: string) => {
    switch (type) {
      case 'bullish_divergence':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'bearish_divergence':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getLiquidityTypeColor = (type: string) => {
    switch (type) {
      case 'institutional': return 'bg-purple-100 text-purple-800';
      case 'volume_node': return 'bg-blue-100 text-blue-800';
      case 'consolidation': return 'bg-green-100 text-green-800';
      case 'equal_high':
      case 'equal_low': return 'bg-orange-100 text-orange-800';
      case 'round_number': return 'bg-gray-100 text-gray-800';
      case 'cluster': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSweepRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLiquidityStatusColor = (status: string) => {
    switch (status) {
      case 'near_liquidity': return 'bg-red-100 text-red-800';
      case 'approaching_liquidity': return 'bg-yellow-100 text-yellow-800';
      case 'neutral': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };


  // Liquidity Zones Component
  const LiquidityZonesComponent = ({ liquidityZones }: { liquidityZones: LiquidityZones }) => {
    if (!liquidityZones || !liquidityZones.zones || liquidityZones.zones.length === 0) {
      return (
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <div className="text-center text-gray-500">
            <Droplets size={32} className="mx-auto mb-2 opacity-50" />
            <p>No significant liquidity zones detected</p>
          </div>
        </div>
      );
    }

    const { analysis, zones, institutionalZones, highVolumeNodes } = liquidityZones;

    return (
      <div className="space-y-6">
        {/* Liquidity Analysis Summary */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <Waves size={20} className="text-blue-600" />
              Liquidity Analysis
            </h4>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getLiquidityStatusColor(analysis.status)}`}>
              {analysis.status.replace('_', ' ').toUpperCase()}
            </div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Sweep Risk</div>
              <div className={`text-lg font-bold px-3 py-1 rounded-lg ${getSweepRiskColor(analysis.sweepRisk)}`}>
                {analysis.sweepRisk.toUpperCase()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Distance</div>
              <div className="text-lg font-bold text-gray-900">
                {(analysis.distanceToNearest * 100).toFixed(2)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Strength</div>
              <div className="text-lg font-bold text-gray-900">
                {analysis.liquidityStrength.toFixed(1)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Institutional</div>
              <div className={`text-lg font-bold ${analysis.institutionalActivity ? 'text-purple-600' : 'text-gray-600'}`}>
                {analysis.institutionalActivity ? 'ACTIVE' : 'INACTIVE'}
              </div>
            </div>
          </div>

          {analysis.nearestZone && (
            <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Nearest Zone</span>
                <span className="text-sm text-gray-600">${formatPrice(analysis.nearestZone.price)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className={`px-2 py-1 rounded text-xs ${getLiquidityTypeColor(analysis.nearestZone.type)}`}>
                  {analysis.nearestZone.type.replace('_', ' ')}
                </span>
                <span className="text-gray-600">•</span>
                <span className="text-gray-600">Strength: {analysis.nearestZone.strength}%</span>
                {analysis.nearestZone.volumeMultiplier && (
                  <>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-600">Vol: {analysis.nearestZone.volumeMultiplier.toFixed(1)}x</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Zone Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Institutional Zones */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
            <div className="flex items-center gap-2 mb-4">
              <Building2 size={20} className="text-purple-600" />
              <h5 className="font-semibold text-gray-900">Institutional Zones</h5>
            </div>
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {institutionalZones.length}
            </div>
            <div className="space-y-2">
              {institutionalZones.slice(0, 2).map((zone, index) => (
                <div key={index} className="bg-white rounded-lg p-3 border border-purple-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">${formatPrice(zone.price)}</span>
                    <span className="text-sm text-gray-600">{zone.strength}%</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{zone.description}</div>
                </div>
              ))}
              {institutionalZones.length > 2 && (
                <div className="text-sm text-purple-600 text-center">
                  +{institutionalZones.length - 2} more zones
                </div>
              )}
            </div>
          </div>

          {/* High Volume Nodes */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-center gap-2 mb-4">
              <BarChart4 size={20} className="text-blue-600" />
              <h5 className="font-semibold text-gray-900">High Volume Nodes</h5>
            </div>
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {highVolumeNodes.length}
            </div>
            <div className="space-y-2">
              {highVolumeNodes.slice(0, 2).map((node, index) => (
                <div key={index} className="bg-white rounded-lg p-3 border border-blue-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">${formatPrice(node.price)}</span>
                    <span className="text-sm text-gray-600">{node.volumeMultiplier?.toFixed(1)}x</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{node.description}</div>
                </div>
              ))}
              {highVolumeNodes.length > 2 && (
                <div className="text-sm text-blue-600 text-center">
                  +{highVolumeNodes.length - 2} more nodes
                </div>
              )}
            </div>
          </div>

          {/* All Zones Summary */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={20} className="text-green-600" />
              <h5 className="font-semibold text-gray-900">Total Zones</h5>
            </div>
            <div className="text-2xl font-bold text-green-600 mb-2">
              {zones.length}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Consolidation:</span>
                <span className="font-medium">{zones.filter(z => z.type === 'consolidation').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Equal Levels:</span>
                <span className="font-medium">{zones.filter(z => z.type === 'equal_high' || z.type === 'equal_low').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Round Numbers:</span>
                <span className="font-medium">{zones.filter(z => z.type === 'round_number').length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Liquidity Zones */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h5 className="font-semibold text-gray-900 flex items-center gap-2">
              <Zap size={20} className="text-yellow-600" />
              Top Liquidity Zones
            </h5>
            <span className="text-sm text-gray-600">Sorted by strength</span>
          </div>
          <div className="space-y-3">
            {zones.slice(0, 5).map((zone, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">${formatPrice(zone.price)}</div>
                    <div className="text-xs text-gray-600">{zone.description}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{zone.strength}%</div>
                  <div className={`text-xs px-2 py-1 rounded ${getLiquidityTypeColor(zone.type)}`}>
                    {zone.type.replace('_', ' ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Loading Skeleton Component
  const renderLoadingSkeleton = () => (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6 mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-32 h-12 bg-gray-300 rounded-xl"></div>
              <div className="w-24 h-12 bg-gray-300 rounded-lg"></div>
            </div>
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            <div className="mt-4 h-12 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="w-40 h-24 bg-gray-300 rounded-xl"></div>
        </div>

        {/* Trade Setup Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="h-6 bg-gray-300 rounded w-32 mb-4"></div>
              <div className="h-8 bg-gray-300 rounded w-24 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          ))}
        </div>

        {/* Liquidity Zones Skeleton */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
          <div className="h-6 bg-gray-300 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center">
                <div className="h-4 bg-gray-300 rounded w-16 mx-auto mb-2"></div>
                <div className="h-6 bg-gray-300 rounded w-12 mx-auto"></div>
              </div>
            ))}
          </div>
          <div className="h-20 bg-gray-200 rounded-lg"></div>
        </div>
      </div>

      {/* Key Levels & Market Structure Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-lg">
            <div className="h-8 bg-gray-300 rounded w-48 mb-6"></div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="h-24 bg-gray-200 rounded-xl"></div>
                <div className="h-24 bg-gray-200 rounded-xl"></div>
              </div>
              <div className="h-20 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Liquidity Zones Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="h-6 bg-gray-300 rounded w-32 mb-4"></div>
            <div className="h-8 bg-gray-300 rounded w-16 mb-4"></div>
            <div className="space-y-2">
              {[1, 2].map((j) => (
                <div key={j} className="h-16 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Rest of existing skeleton... */}
    </div>
  );

  if (loading) {
    return renderLoadingSkeleton();
  }

  if (!overview) {
    return (
      <div className="space-y-8">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100 shadow-lg">
          <div className="text-center py-12">
            <AlertTriangle size={48} className="text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Overview Data</h3>
            <p className="text-gray-600">Market overview data is not available for this asset.</p>
          </div>
        </div>
      </div>
    );
  }

  const tradeSetup = overview.tradeSetup || {};
  const keyLevels = overview.keyLevels || {};
  const momentum = overview.momentum || {};
  const riskMetrics = overview.riskMetrics || {};
  const volume = overview.volume || {};
  const marketStructure = overview.marketStructure || {};
  const priceAction = overview.priceAction || { pattern: 'neutral', candles: 'neutral', rejection: false };
  const liquidityZones = overview.liquidityZones;

  return (
    <div className="space-y-8">
      {/* Header with Signal */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6 mb-8">
          <div className="flex-1">
            <p className="text-gray-600">Signal based on multi-timeframe analysis and market structure</p>
          </div>
        </div>

        {/* Probability Factors */}
        {tradeSetup.probabilityFactors && (
          <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <PieChart size={20} className="text-purple-600" />
              Signal Probability Analysis
            </h4>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Timeframe</div>
                <div className="text-lg font-bold text-gray-900">
                  {tradeSetup.probabilityFactors.timeframeAlignment?.split('_')[0]}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Trend</div>
                <div className="text-lg font-bold text-gray-900">
                  {tradeSetup.probabilityFactors.trendConsistency}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Volume</div>
                <div className={`text-lg font-bold ${tradeSetup.probabilityFactors.volumeConfirmation ? 'text-green-600' : 'text-gray-600'}`}>
                  {tradeSetup.probabilityFactors.volumeConfirmation ? '✓' : '✗'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">SR Quality</div>
                <div className="text-lg font-bold text-gray-900">
                  {tradeSetup.probabilityFactors.supportResistanceQuality}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Adj. Probability</div>
                <div className="text-lg font-bold text-blue-600">
                  {tradeSetup.probabilityFactors.adjustedProbability}%
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Liquidity Zones Section */}
      {liquidityZones && (
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-8 border border-cyan-100 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Droplets size={24} className="text-cyan-600" />
            Liquidity Zones Analysis
          </h3>
          <LiquidityZonesComponent liquidityZones={liquidityZones} />
        </div>
      )}

      {/* Key Levels & Market Structure */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Key Levels */}
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Target size={24} className="text-blue-600" />
            Key Levels
          </h3>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                <div className="text-sm text-gray-600 mb-1">Immediate Support</div>
                <div className="text-xl font-bold text-gray-900">
                  ${formatPrice(keyLevels.immediateSupport || 0)}
                </div>
                <div className="text-xs text-gray-500 mt-1">Nearest support level</div>
              </div>
              <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                <div className="text-sm text-gray-600 mb-1">Immediate Resistance</div>
                <div className="text-xl font-bold text-gray-900">
                  ${formatPrice(keyLevels.immediateResistance || 0)}
                </div>
                <div className="text-xs text-gray-500 mt-1">Nearest resistance level</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-100 rounded-xl p-4 border border-green-200">
                <div className="text-sm text-gray-700 mb-1">Major Support</div>
                <div className="text-lg font-bold text-gray-900">
                  ${formatPrice(keyLevels.nextMajorSupport || 0)}
                </div>
              </div>
              <div className="bg-red-100 rounded-xl p-4 border border-red-200">
                <div className="text-sm text-gray-700 mb-1">Major Resistance</div>
                <div className="text-lg font-bold text-gray-900">
                  ${formatPrice(keyLevels.nextMajorResistance || 0)}
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
              <div className="text-sm text-gray-600 mb-1">Breakout Level</div>
              <div className="text-xl font-bold text-gray-900">
                ${formatPrice(keyLevels.breakoutLevel || 0)}
              </div>
              <div className="text-xs text-gray-500 mt-1">Watch for breakout confirmation</div>
            </div>
          </div>
        </div>

        {/* Market Structure & Momentum */}
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <ActivityIcon size={24} className="text-purple-600" />
            Market Momentum
          </h3>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <div className="text-sm text-gray-600 mb-1">Momentum</div>
                <div className={`text-lg font-bold ${getMomentumColor(momentum.strength || 50)}`}>
                  {momentum.strength || 50}/100
                </div>
                <div className="text-xs text-gray-500 mt-1 capitalize">
                  {momentum.direction || 'neutral'} • {momentum.acceleration || 'stable'}
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                <div className="text-sm text-gray-600 mb-1">RSI</div>
                <div className={`text-lg font-bold ${getRSIColor(momentum.rsi || 50)}`}>
                  {momentum.rsi || 50}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {(momentum.rsi || 50) > 70 ? 'Overbought' : (momentum.rsi || 50) < 30 ? 'Oversold' : 'Neutral'}
                </div>
              </div>
            </div>
            
            {/* Divergence */}
            {momentum.divergence && momentum.divergence.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">Divergence Detected:</div>
                {momentum.divergence.map((div, index) => (
                  <div key={index} className={`rounded-lg p-3 border ${getDivergenceColor(div.type)}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium capitalize">{div.type.replace('_', ' ')}</span>
                      <span className="text-sm">{div.timeframe}</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Strength: {div.strength}/100</div>
                  </div>
                ))}
              </div>
            )}

            {/* Timeframe Alignment */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
              <div className="text-sm text-gray-600 mb-1">Timeframe Alignment</div>
              <div className="text-lg font-bold text-gray-900">
                {overview.timeframeAlignment?.replace(/_/g, ' ').toUpperCase() || 'MIXED'}
              </div>
              <div className="text-xs text-gray-500 mt-1">Multi-timeframe consensus</div>
            </div>
          </div>
        </div>
      </div>

      {/* Risk & Market Structure */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Risk Metrics */}
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Shield size={24} className="text-red-600" />
            Risk Metrics
          </h3>
          <div className="space-y-6">
            <div className={`inline-block px-4 py-2 rounded-full text-lg font-bold mb-4 ${getRiskColor(riskMetrics.volatility || 'medium')}`}>
              {(riskMetrics.volatility || 'medium').toUpperCase()} VOLATILITY
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm text-gray-600 mb-1">ATR</div>
                <div className="text-lg font-bold text-gray-900">{riskMetrics.atr?.toFixed(4) || '0.0000'}</div>
                <div className="text-xs text-gray-500 mt-1">Average True Range</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm text-gray-600 mb-1">Max Risk</div>
                <div className="text-lg font-bold text-gray-900">{riskMetrics.maxRiskPerTrade || '2%'}</div>
                <div className="text-xs text-gray-500 mt-1">Per trade</div>
              </div>
            </div>
            {riskMetrics.winProbability && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                <div className="text-sm text-gray-600 mb-1">Win Probability</div>
                <div className="text-lg font-bold text-green-600">{riskMetrics.winProbability}%</div>
                <div className="text-xs text-gray-500 mt-1">Estimated success rate</div>
              </div>
            )}
          </div>
        </div>

        {/* Market Structure */}
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Layers size={24} className="text-blue-600" />
            Market Structure
          </h3>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <div className="text-sm text-gray-600 mb-1">Trend</div>
                <div className={`text-lg font-bold ${
                  marketStructure.trend === 'uptrend' ? 'text-green-600' :
                  marketStructure.trend === 'downtrend' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {(marketStructure.trend || 'sideways').toUpperCase()}
                </div>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-100">
                <div className="text-sm text-gray-600 mb-1">Phase</div>
                <div className="text-lg font-bold text-gray-900">
                  {(marketStructure.phase || 'neutral').replace('_', ' ').toUpperCase()}
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
              <div className="text-sm text-gray-600 mb-1">Bias</div>
              <div className={`text-lg font-bold ${
                marketStructure.bias === 'bullish' ? 'text-green-600' :
                marketStructure.bias === 'bearish' ? 'text-red-600' :
                'text-gray-600'
              }`}>
                {(marketStructure.bias || 'neutral').toUpperCase()}
              </div>
            </div>
            
            {/* Market Structure Details */}
            {marketStructure.structure && (
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Structure Analysis</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center">
                    <div className="text-xs text-gray-600">Higher Highs</div>
                    <div className="text-lg font-bold text-green-600">{marketStructure.structure.higherHighs}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-600">Higher Lows</div>
                    <div className="text-lg font-bold text-green-600">{marketStructure.structure.higherLows}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-600">Lower Highs</div>
                    <div className="text-lg font-bold text-red-600">{marketStructure.structure.lowerHighs}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-600">Lower Lows</div>
                    <div className="text-lg font-bold text-red-600">{marketStructure.structure.lowerLows}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Volume & Price Action */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Volume Analysis */}
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <BarChart3 size={24} className="text-green-600" />
            Volume Analysis
          </h3>
          <div className="space-y-6">
            <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium mb-4 ${getVolumeColor(volume.status || 'normal')}`}>
              {(volume.status || 'normal').replace('_', ' ').toUpperCase()} VOLUME
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                <div className="text-sm text-gray-600 mb-1">Relative Volume</div>
                <div className="text-lg font-bold text-gray-900">{(volume.relativeVolume || 1).toFixed(2)}x</div>
                <div className="text-xs text-gray-500 mt-1">vs Average</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
                <div className="text-sm text-gray-600 mb-1">Volume Spike</div>
                <div className={`text-lg font-bold ${volume.volumeSpike ? 'text-green-600' : 'text-gray-600'}`}>
                  {volume.volumeSpike ? 'YES' : 'NO'}
                </div>
              </div>
            </div>
            
            {/* Volume Profile */}
            {volume.volumeProfile && volume.volumeProfile.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Volume Profile</div>
                <div className="space-y-2">
                  {volume.volumeProfile.slice(0, 3).map((node, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">${formatPrice(node.price)}</span>
                      <span className="font-medium">{node.strength}% strength</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Price Action */}
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Target size={24} className="text-yellow-600" />
            Price Action
          </h3>
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-4 border border-yellow-100">
              <div className="text-sm text-gray-600 mb-1">Pattern</div>
              <div className="text-lg font-bold text-gray-900">
                {priceAction.pattern?.replace('_', ' ').toUpperCase() || 'NEUTRAL'}
              </div>
              <div className="text-xs text-gray-500 mt-1">Candle bias: {priceAction.candles || 'neutral'}</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                <div className="text-sm text-gray-600 mb-1">Rejection</div>
                <div className={`text-lg font-bold ${priceAction.rejection ? 'text-red-600' : 'text-gray-600'}`}>
                  {priceAction.rejection ? 'PRESENT' : 'NONE'}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {priceAction.rejection ? 'Key level rejection detected' : 'No significant rejection'}
                </div>
              </div>
              
              {/* Multi-Timeframe Analysis */}
              {overview.multiTimeframeAnalysis && (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                  <div className="text-sm text-gray-600 mb-1">TF Consensus</div>
                  <div className={`text-lg font-bold ${
                    overview.multiTimeframeAnalysis.consensus === 'bullish' ? 'text-green-600' :
                    overview.multiTimeframeAnalysis.consensus === 'bearish' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {overview.multiTimeframeAnalysis.consensus?.toUpperCase() || 'NEUTRAL'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Strength: {overview.multiTimeframeAnalysis.strength}%
                  </div>
                </div>
              )}
            </div>

            {/* Signal Validity */}
            {overview.signalData && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Signal Validity</div>
                    <div className="text-lg font-bold text-gray-900">
                      {new Date(overview.signalData.validUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <AlertCircle size={20} className="text-yellow-500" />
                </div>
                <div className="text-xs text-gray-500 mt-1">Signal expires at</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Summary */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <Lightbulb size={24} className="text-yellow-600" />
          Quick Summary
        </h3>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="text-lg text-gray-800 leading-relaxed">
            {overview.summary || 'No summary available'}
          </div>
        </div>
      </div>
    </div>
  );
};