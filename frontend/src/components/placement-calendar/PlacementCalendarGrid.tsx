import React from 'react';
import { PlacementDayPlan } from '../../data/placementCalendar';
import { PlacementMonthSection } from './PlacementMonthSection';
import { DayCompletionType } from '../../types/placementCalendar';
import { DailyLog } from '../../types';
import { getMonthName } from '../../utils/placementCalendarUtils';

interface PlacementCalendarGridProps {
  filteredDays: PlacementDayPlan[];
  dailyLogs: Record<string, DailyLog>;
  todayDay: number;
  onDayClick: (day: PlacementDayPlan) => void;
  getCompletionType: (log: DailyLog | undefined, day: number, todayDay: number) => DayCompletionType;
}

export const PlacementCalendarGrid: React.FC<PlacementCalendarGridProps> = ({
  filteredDays,
  dailyLogs,
  todayDay,
  onDayClick,
  getCompletionType
}) => {
  // Group days by YYYY-MM prefix
  const monthsMap: Record<string, { name: string; days: PlacementDayPlan[] }> = {};

  filteredDays.forEach((day) => {
    const monthKey = day.date.substring(0, 7); // e.g. "2026-07"
    if (!monthsMap[monthKey]) {
      monthsMap[monthKey] = {
        name: getMonthName(day.date),
        days: []
      };
    }
    monthsMap[monthKey].days.push(day);
  });

  return (
    <div className="flex flex-col gap-6 w-full select-none">
      {Object.entries(monthsMap).map(([key, monthGroup]) => (
        <PlacementMonthSection
          key={key}
          monthName={monthGroup.name}
          monthDays={monthGroup.days}
          dailyLogs={dailyLogs}
          todayDay={todayDay}
          onDayClick={onDayClick}
          getCompletionType={getCompletionType}
        />
      ))}
      
      {filteredDays.length === 0 && (
        <div className="p-12 text-center border border-dashed border-border-subtle rounded-2xl">
          <p className="text-sm font-bold text-textSecondary">No matching days found.</p>
          <p className="text-xs text-textMuted mt-1">Try resetting or loosening your filters.</p>
        </div>
      )}
    </div>
  );
};
