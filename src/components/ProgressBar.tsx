import React from 'react';

interface ProgressBarProps {
  label: string;
  percent: number;
  colorClass: string;
  showValue?: boolean;
}

export const SingleProgressBar: React.FC<ProgressBarProps> = ({ label, percent, colorClass, showValue = true }) => {
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex justify-between items-center mb-1 text-xs">
        <span className="font-medium text-slate-600">{label}</span>
        {showValue && <span className="text-slate-500 font-semibold">{percent}%</span>}
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/50">
        <div 
          className={`h-2 rounded-full transition-all duration-500 ease-out ${colorClass}`}
          style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
        ></div>
      </div>
    </div>
  );
};

interface DualProgressBarProps {
  actualPercent: number;
  expectedPercent: number;
  statusConfig: { bgClass: string; textClass: string };
}

export const DualProgressBar: React.FC<DualProgressBarProps> = ({ actualPercent, expectedPercent, statusConfig }) => {
  return (
    <div className="space-y-3">
      <SingleProgressBar 
        label="Actual Progress" 
        percent={actualPercent} 
        colorClass={statusConfig.bgClass.replace('bg-', 'bg-')} // Just use the raw color class or override
      />
      <SingleProgressBar 
        label="Expected Progress" 
        percent={expectedPercent} 
        colorClass="bg-slate-400" 
      />
    </div>
  );
};
