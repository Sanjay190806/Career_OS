import React from 'react';
import { useDailyLogStore } from '../../app/store/useDailyLogStore';
import { useCareerStore } from '../../app/store/useCareerStore';
import { getDateForDay, formatDate } from '../../utils/dateUtils';

export const WeekStrip: React.FC = () => {
  const selectedDay = useDailyLogStore((s) => s.selectedDay);
  const setSelectedDay = useDailyLogStore((s) => s.setSelectedDay);
  const userProfile = useCareerStore((s) => s.userProfile);

  const days = [];
  for (let offset = -3; offset <= 3; offset++) {
    const dayIndex = selectedDay + offset;
    if (dayIndex >= 1 && dayIndex <= 180) {
      days.push(dayIndex);
    }
  }

  return (
    <div className="flex gap-2 items-center justify-between bg-bgSurface/40 p-2 border border-border-subtle rounded-2xl mb-6 overflow-x-auto select-none animate-fadeIn">
      {days.map((day) => {
        const isSelected = day === selectedDay;
        const dateObj = getDateForDay(day, userProfile.startDate);
        const dayLabel = formatDate(dateObj).split(',')[1]?.trim() || formatDate(dateObj);
        
        return (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`flex-1 min-w-[55px] flex flex-col items-center justify-center p-2 rounded-xl transition ${
              isSelected
                ? 'bg-accentBlue text-white shadow-glow-blue'
                : 'text-textSecondary hover:text-textPrimary hover:bg-bg-glass'
            }`}
          >
            <span className="text-[10px] font-bold uppercase opacity-80">Day {day}</span>
            <span className="text-xs font-semibold mt-0.5">{dayLabel.split(' ')[0]}</span>
          </button>
        );
      })}
    </div>
  );
};
