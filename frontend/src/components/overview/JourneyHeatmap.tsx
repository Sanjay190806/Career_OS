import React from 'react';
import { Card } from '../ui/Card';
import { useCareerStore } from '../../app/store/useCareerStore';
import { CalendarDays } from 'lucide-react';

export const JourneyHeatmap: React.FC = () => {
  const dailyLogs = useCareerStore((s) => s.dailyLogs);
  const cells = Array.from({ length: 180 }, (_, i) => i + 1);

  const getCellColorClass = (day: number) => {
    const log = dailyLogs[day];
    if (!log) return 'bg-white/[0.04] hover:bg-white/[0.08] border border-white/5';
    if (log.status === 'completed') return 'bg-accentEmerald border border-accentEmerald/40 shadow-[0_0_0_1px_rgba(16,185,129,0.2)]';
    if (log.status === 'partial' || log.status === 'in_progress') return 'bg-accentOrange/70 border border-accentOrange/35';
    if (log.status === 'missed') return 'bg-red-500/20 border border-red-500/30';
    if (log.status === 'recovery') return 'bg-accentBlue/40 border border-accentBlue/30';
    return 'bg-white/[0.04] hover:bg-white/[0.08] border border-white/5';
  };

  return (
    <Card className="flex h-full flex-col">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Journey Heatmap</p>
          <h3 className="mt-1 text-lg font-semibold text-textPrimary">180-day placement journey</h3>
        </div>
        <div className="topbar-chip text-[11px] text-textSecondary">
          <CalendarDays className="h-3.5 w-3.5 text-accentBlue" />
          <span>Completed / partial / missed / future</span>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="grid min-w-[320px] gap-1.5" style={{ gridTemplateColumns: 'repeat(15, minmax(0, 1fr))' }}>
          {cells.map((day) => {
            const log = dailyLogs[day];
            const tooltip = `Day ${day}: ${log?.status ? String(log.status).replace('_', ' ') : 'Not Started'} (${log?.xpEarned || 0} XP)`;
            return (
              <div
                key={day}
                title={tooltip}
                aria-label={tooltip}
                className={`aspect-square cursor-pointer rounded-[6px] transition-all duration-200 ${getCellColorClass(day)}`}
              />
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border-subtle/50 pt-3 text-[10px] text-textMuted">
        <div className="flex items-center gap-1.5">
          <div className="h-3.5 w-3.5 rounded-[3px] border border-white/5 bg-white/[0.04]" />
          <span>Not Started</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3.5 w-3.5 rounded-[3px] border border-accentOrange/35 bg-accentOrange/70" />
          <span>Partial</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3.5 w-3.5 rounded-[3px] border border-accentEmerald/40 bg-accentEmerald" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3.5 w-3.5 rounded-[3px] bg-red-500/20" />
          <span>Missed</span>
        </div>
      </div>
    </Card>
  );
};
