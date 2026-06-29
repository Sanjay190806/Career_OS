import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { RoadmapProblem } from '../../types';

interface LeetCodeTaskCardProps {
  problem: RoadmapProblem;
  problemIndex: number;
  solved: boolean;
  confidence: number;
  notes: string;
  onSolvedChange: (val: boolean) => void;
  onConfidenceChange: (val: number) => void;
  onNotesChange: (val: string) => void;
}

export const LeetCodeTaskCard: React.FC<LeetCodeTaskCardProps> = ({
  problem,
  solved,
  confidence,
  notes,
  onSolvedChange,
  onConfidenceChange,
  onNotesChange
}) => {
  const getDiffVariant = (diff: string) => {
    if (diff === 'Easy') return 'success';
    if (diff === 'Medium') return 'warning';
    return 'danger';
  };

  return (
    <Card className={`relative overflow-hidden transition-all ${solved ? 'border-accentEmerald/30 bg-accentEmerald/5' : ''}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={solved}
            onChange={(e) => onSolvedChange(e.target.checked)}
            className="w-5 h-5 rounded-md border-border-subtle bg-bgSurface text-accentBlue focus:ring-accentBlue/30 focus:ring-1 mt-1 transition cursor-pointer shrink-0"
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-textMuted font-mono">#{problem.number}</span>
              <a
                href={problem.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-bold text-textPrimary hover:text-accentBlue hover:underline transition"
              >
                {problem.title}
              </a>
              <Badge variant={getDiffVariant(problem.difficulty)}>{problem.difficulty}</Badge>
            </div>
            <p className="text-[10px] text-textSecondary mt-1">
              Pattern: <span className="font-semibold">{problem.pattern}</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <a
            href={problem.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-bgSurface border border-border-subtle rounded-xl text-xs font-bold text-textSecondary hover:text-textPrimary hover:bg-bg-glass-hover transition shrink-0"
          >
            Solve on LeetCode ↗
          </a>
        </div>
      </div>

      {solved && (
        <div className="mt-4 pt-4 border-t border-border-subtle/50 flex flex-col md:flex-row gap-4 fade-in">
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-textSecondary uppercase pl-0.5">Confidence (1-5)</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="5"
                value={confidence}
                onChange={(e) => onConfidenceChange(parseInt(e.target.value))}
                className="w-full h-1 bg-border-subtle rounded-lg appearance-none cursor-pointer accent-accentBlue"
              />
              <span className="text-xs font-bold text-textPrimary font-mono w-4">{confidence}</span>
            </div>
          </div>

          <div className="flex-[2] flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-textSecondary uppercase pl-0.5">Mistake Log / Code Notes</label>
            <textarea
              placeholder="Record any edge cases or optimal Java pointers here..."
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              className="w-full bg-bgSurface border border-border-subtle text-textPrimary text-xs rounded-xl px-3 py-2 transition focus:outline-none focus:border-accentBlue h-12 resize-none"
            />
          </div>
        </div>
      )}
    </Card>
  );
};
