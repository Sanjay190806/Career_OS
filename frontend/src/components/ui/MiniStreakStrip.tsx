import React, { useMemo } from 'react';
import { useCareerStore } from '../../app/store/useCareerStore';
import { Card } from './Card';
import { getTodayDay } from '../../utils/dateUtils';


export const MiniStreakStrip: React.FC = () => {
  const { dailyLogs, userProfile } = useCareerStore();
  const todayDay = getTodayDay(userProfile.startDate);

  const days = useMemo(() => {
    // Generate last 28 days ending with todayDay (or todayDay + 2 to show some future cells)
    const end = Math.min(todayDay + 2, 184);
    const start = Math.max(end - 27, 1);
    
    const list = [];
    for (let d = start; d <= end; d++) {
      const log = dailyLogs[d];
      const dateObj = new Date(userProfile.startDate);
      dateObj.setDate(dateObj.getDate() + (d - 1));
      const dateStr = dateObj.toLocaleDateString('default', { month: 'short', day: 'numeric' });
      
      let colorClass = 'bg-white/5 border-white/5 opacity-40'; // Future/grey
      let statusText = 'Future';
      let xp = 0;
      let tasksText = 'No tasks logged';

      if (d <= todayDay) {
        if (log) {
          xp = log.xpEarned || 0;
          tasksText = log.note || 'Logged work';
          
          if (log.freezeUsed) {
            colorClass = 'bg-accentBlue border-accentBlue/30 text-white';
            statusText = 'Streak Frozen';
          } else if (log.completionType === 'perfect') {
            colorClass = 'bg-accentGold border-accentGold/30 text-white';
            statusText = 'Perfect Day';
          } else if (log.completionType === 'minimum' || log.status === 'completed') {
            colorClass = 'bg-accentEmerald border-accentEmerald/30 text-white';
            statusText = 'Minimum Day Qualified';
          } else if (log.status === 'partial') {
            colorClass = 'bg-accentOrange border-accentOrange/30 text-white';
            statusText = 'Partial Work';
          } else {
            colorClass = 'bg-red-500/20 border-red-500/30 text-red-400';
            statusText = 'Missed';
          }
        } else {
          // No log but in past -> missed
          if (d < todayDay) {
            colorClass = 'bg-red-500/20 border-red-500/30 text-red-400';
            statusText = 'Missed';
          } else {
            // Today unlogged
            colorClass = 'bg-white/5 border-white/10 opacity-70';
            statusText = 'Today (Pending)';
          }
        }
      }

      list.push({
        dayNum: d,
        dateStr,
        colorClass,
        statusText,
        xp,
        tasksText,
        isToday: d === todayDay
      });
    }
    return list;
  }, [dailyLogs, todayDay, userProfile.startDate]);

  return (
    <Card className="p-4 border-white/5 flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider">Last 28-day Streak Strip</h4>
        <span className="text-[9px] text-textMuted font-medium">green (qualified) / blue (freeze) / red (missed)</span>
      </div>

      <div className="grid grid-cols-7 sm:grid-cols-14 lg:grid-cols-28 gap-2.5">
        {days.map((day) => (
          <div
            key={day.dayNum}
            title={`Day ${day.dayNum} (${day.dateStr}) - ${day.statusText} (${day.xp} XP)`}
            className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold transition relative cursor-help ${
              day.colorClass
            } ${day.isToday ? 'outline-double outline-accentGold outline-2 shadow-glow-yellow' : ''}`}
          >
            <span>{day.dayNum}</span>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-50 pointer-events-none bg-bgSurface/95 border border-border-subtle p-2 rounded-lg text-[9px] w-36 shadow-glow-blue leading-normal">
              <span className="font-bold text-textPrimary block">Day {day.dayNum} ({day.dateStr})</span>
              <span className="text-accentBlue block mt-0.5">{day.statusText}</span>
              <span className="text-accentEmerald font-bold block">+{day.xp} XP</span>
              <span className="text-textSecondary line-clamp-2 mt-1">{day.tasksText}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
