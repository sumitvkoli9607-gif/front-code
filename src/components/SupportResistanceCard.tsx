// src/components/SupportResistanceCard.tsx
import React from 'react';
import {
  Scale,
  Target,
  Zap,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  ChevronUp,
  ChevronDown,
  DollarSign,
} from 'lucide-react';

import { SupportResistance, MarketData } from '../market';

interface SupportResistanceCardProps {
  srData: SupportResistance | null;
  currentPrice?: number;
  selectedAsset?: MarketData | null;
}

export const SupportResistanceCard: React.FC<SupportResistanceCardProps> = ({ 
  srData, 
  currentPrice, 
  selectedAsset 
}) => {
  // Return loading state if srData is null
  if (!srData) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8 text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading support/resistance data...</p>
        </div>
      </div>
    );
  }

  // Function to format price with appropriate decimal places
  const formatPrice = (price: number) => {
    if (price === 0 || !price) return '0.0000';
    
    // Determine appropriate decimal places based on price magnitude
    if (price < 0.0001) {
      return price.toFixed(8);
    } else if (price < 0.001) {
      return price.toFixed(7);
    } else if (price < 0.01) {
      return price.toFixed(6);
    } else if (price < 0.1) {
      return price.toFixed(5);
    } else if (price < 1) {
      return price.toFixed(4);
    } else if (price < 10) {
      return price.toFixed(3);
    } else if (price < 100) {
      return price.toFixed(2);
    } else if (price < 1000) {
      return price.toFixed(1);
    } else {
      return price.toFixed(0);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'buy': return 'bg-green-100 text-green-800';
      case 'sell': return 'bg-red-100 text-red-800';
      case 'hold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'up': return <ArrowUpRight className="text-green-600" size={20} />;
      case 'down': return <ArrowDownRight className="text-red-600" size={20} />;
      default: return <Minus className="text-gray-600" size={20} />;
    }
  };

  // Calculate distance from current price for each level
  const calculateDistance = (levelPrice: number) => {
    if (!currentPrice || currentPrice === 0) return 'N/A';
    const distance = ((levelPrice - currentPrice) / currentPrice) * 100;
    return `${distance >= 0 ? '+' : ''}${distance.toFixed(2)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Current Price Display */}
      {currentPrice && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={18} className="text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Current Price</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            ${formatPrice(currentPrice)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {selectedAsset?.symbol || 'Asset'}
          </div>
        </div>
      )}

      {/* Current Level & Recommendation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <Scale size={18} className="text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Current Level</span>
          </div>
          <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-2 ${
            srData.currentLevel === 'support'
              ? 'bg-green-100 text-green-800'
              : srData.currentLevel === 'resistance'
              ? 'bg-red-100 text-red-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {srData.currentLevel?.toUpperCase() || 'NEUTRAL'}
          </div>
          <p className="text-xs text-gray-600">Price is near {srData.currentLevel || 'neutral'} level</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
          <div className="flex items-center gap-2 mb-2">
            <Target size={18} className="text-green-600" />
            <span className="text-sm font-medium text-gray-700">Recommendation</span>
          </div>
          <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-2 ${getActionColor(srData.recommendedAction)}`}>
            {srData.recommendedAction?.toUpperCase() || 'WAIT'}
          </div>
          <p className="text-xs text-gray-600">{srData.confidence || 0}% confidence</p>
        </div>
      </div>

      {/* Breakout Analysis */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
        <div className="flex items-center gap-2 mb-3">
          <Zap size={18} className="text-purple-600" />
          <span className="text-sm font-medium text-gray-700">Breakout Analysis</span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {getDirectionIcon(srData.breakoutDirection || 'sideways')}
            <span className="text-sm font-medium text-gray-900">
              {srData.breakoutDirection === 'up' ? 'Bullish' : srData.breakoutDirection === 'down' ? 'Bearish' : 'Sideways'} Breakout
            </span>
          </div>
          <div className="text-sm font-bold text-gray-900">
            {srData.breakoutProbability || 0}%
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              srData.breakoutDirection === 'up'
                ? 'bg-green-500'
                : srData.breakoutDirection === 'down'
                ? 'bg-red-500'
                : 'bg-gray-500'
            }`}
            style={{ width: `${Math.min(srData.breakoutProbability || 0, 100)}%` }}
          />
        </div>
      </div>

      {/* Support Levels */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <TrendingDownIcon size={16} className="text-green-600" />
          Key Support Levels
        </h4>
        {srData.supports && srData.supports.length > 0 ? (
          srData.supports.slice(0, 3).map((support, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900">${formatPrice(support.price || 0)}</span>
                  {currentPrice && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      support.price > currentPrice 
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {calculateDistance(support.price)}
                      {support.price > currentPrice ? <ChevronUp size={12} className="inline ml-1" /> : <ChevronDown size={12} className="inline ml-1" />}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-600">{support.description || 'Support level'}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-green-700">{support.strength || 0}/100</div>
                <div className="text-xs text-gray-500">Strength</div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-3 bg-gray-50 rounded-lg text-center text-gray-500 text-sm">
            No support levels available
          </div>
        )}
      </div>

      {/* Resistance Levels */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <TrendingUpIcon size={16} className="text-red-600" />
          Key Resistance Levels
        </h4>
        {srData.resistances && srData.resistances.length > 0 ? (
          srData.resistances.slice(0, 3).map((resistance, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900">${formatPrice(resistance.price || 0)}</span>
                  {currentPrice && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      resistance.price > currentPrice 
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {calculateDistance(resistance.price)}
                      {resistance.price > currentPrice ? <ChevronUp size={12} className="inline ml-1" /> : <ChevronDown size={12} className="inline ml-1" />}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-600">{resistance.description || 'Resistance level'}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-red-700">{resistance.strength || 0}/100</div>
                <div className="text-xs text-gray-500">Strength</div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-3 bg-gray-50 rounded-lg text-center text-gray-500 text-sm">
            No resistance levels available
          </div>
        )}
      </div>

      {/* Additional Metrics */}
      {srData.pivotPoint > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-gray-100">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-600">Pivot Point</div>
            <div className="font-semibold text-gray-900">${formatPrice(srData.pivotPoint)}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-600">Recent High</div>
            <div className="font-semibold text-gray-900">${formatPrice(srData.recentHigh)}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-600">Recent Low</div>
            <div className="font-semibold text-gray-900">${formatPrice(srData.recentLow)}</div>
          </div>
        </div>
      )}
    </div>
  );
};