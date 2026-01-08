// src/components/PsychologyIndicator.tsx
import React from 'react';

interface PsychologyIndicatorProps {
  label: string;
  value: number;
  icon?: React.ReactNode;
  color: 'blue' | 'red' | 'green' | 'yellow' | 'purple' | 'indigo';
}

export const PsychologyIndicator: React.FC<PsychologyIndicatorProps> = ({ label, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-600',
    red: 'bg-red-600',
    green: 'bg-green-600',
    yellow: 'bg-yellow-600',
    purple: 'bg-purple-600',
    indigo: 'bg-indigo-600'
  };

  return (
    <div className="flex flex-col items-start w-full mb-6">
      <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2">
        <div
          className={`h-2.5 rounded-full transition-all duration-500 ${colorClasses[color]}`}
          style={{ width: `${Math.min(value || 0, 100)}%` }}
        />
      </div>
      <div className="flex justify-between w-full text-sm">
        <span className="text-gray-500">0%</span>
        <span className="font-semibold text-gray-900">{(value || 0).toFixed(0)}%</span>
        <span className="text-gray-500">100%</span>
      </div>
    </div>
  );
};