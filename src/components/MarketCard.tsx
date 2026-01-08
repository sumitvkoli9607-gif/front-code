// src/components/MarketCard.tsx
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { MarketData } from '../market';

interface MarketCardProps {
  market: MarketData;
  onClick: () => void;
}

export const MarketCard: React.FC<MarketCardProps> = ({ market, onClick }) => {
  return (
    <div
      className="flex items-center justify-between p-6 rounded-xl transition-all cursor-pointer group border border-gray-100 hover:border-blue-200 hover:shadow-md hover:bg-gray-50"
      onClick={onClick}
    >
      <div className="flex-1">
        <div className="font-semibold text-lg text-gray-900 mb-1 flex items-center gap-2">
          <span>{market?.symbol || 'N/A'}</span>
        </div>
        <div className="text-sm text-gray-500 mb-2">
          {(market?.category?.toUpperCase() || 'N/A')} • Vol: {(market?.volume?.toLocaleString() || '0')}
        </div>
      </div>
      <div className="text-right">
        <div
          className={`text-base flex items-center justify-end font-medium ${
            market?.change >= 0 ? 'text-green-500' : 'text-red-500'
          }`}
        >
          {market?.change >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
          <span className="ml-1">
            {(market?.change ? Math.abs(market.change).toFixed(2) : '0.00')}%
          </span>
        </div>
      </div>
    </div>
  );
};