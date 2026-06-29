import React from 'react';
import { Card } from '../ui/Card';

interface DailyActivityCounterProps {
  label: string;
  emoji: string;
  value: number;
  target: number;
  unit: string;
  color: string;
  onIncrement: () => void;
  onDecrement: () => void;
}

export const DailyActivityCounter: React.FC<DailyActivityCounterProps> = ({
  label,
  emoji,
  value,
  target,
  unit,
  color,
  onIncrement,
  onDecrement
}) => {
  const percentage = Math.min((value / target) * 100, 100);

  return (
    <Card className="relative overflow-hidden flex flex-col justify-between p-4 h-[120px]">
      {/* ProgressBar bottom edge indicator */}
      <div className="absolute left-0 bottom-0 right-0 h-1 bg-border-subtle/20">
        <div className="h-full transition-all duration-300" style={{ width: `${percentage}%`, backgroundColor: color }} />
      </div>

      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <span className="text-lg">{emoji}</span>
          <span className="text-xs font-bold text-textPrimary tracking-tight truncate max-w-[80px]">{label}</span>
        </div>
        <span className="text-[10px] text-textMuted uppercase font-semibold">Tgt: {target}</span>
      </div>

      <div className="flex justify-between items-center mt-2 pl-0.5">
        <span className="text-lg font-extrabold text-textPrimary font-mono">
          {value} <span className="text-[9px] font-normal text-textSecondary">{unit}</span>
        </span>
        
        <div className="flex items-center gap-1">
          <button
            onClick={onDecrement}
            className="w-6 h-6 flex items-center justify-center bg-bgSurface border border-border-subtle rounded-md text-textSecondary hover:text-textPrimary hover:bg-bg-glass-hover text-xs font-bold transition active:scale-95"
          >
            -
          </button>
          <button
            onClick={onIncrement}
            className="w-6 h-6 flex items-center justify-center bg-bgSurface border border-border-subtle rounded-md text-textSecondary hover:text-textPrimary hover:bg-bg-glass-hover text-xs font-bold transition active:scale-95"
          >
            +
          </button>
        </div>
      </div>
    </Card>
  );
};
