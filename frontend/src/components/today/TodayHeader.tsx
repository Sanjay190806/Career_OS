import React from 'react';
import { useDailyLogStore } from '../../app/store/useDailyLogStore';
import { useCareerStore } from '../../app/store/useCareerStore';
import { getDateForDay, formatDate, getPhaseName } from '../../utils/dateUtils';
import { ROADMAP } from '../../data/roadmap';
import { Badge } from '../ui/Badge';

export const TodayHeader: React.FC = () => {
  const selectedDay = useDailyLogStore((s) => s.selectedDay);
  const userProfile = useCareerStore((s) => s.userProfile);

  const dateObj = getDateForDay(selectedDay, userProfile.startDate);
  const dateFormatted = formatDate(dateObj);
  const phase = getPhaseName(selectedDay);
  const problems = ROADMAP[String(selectedDay)] || [];
  const topic = problems[0]?.topic || "Revision Phase";

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div>
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-black text-textPrimary">Day {selectedDay} — Mission</h2>
          <Badge variant="primary">{phase}</Badge>
        </div>
        <p className="text-xs text-textSecondary mt-1">{dateFormatted}</p>
      </div>

      <div className="bg-bgCard/60 border border-border-subtle p-3 rounded-xl flex items-center gap-3 w-full md:w-auto">
        <span className="text-2xl">⚡</span>
        <div>
          <span className="text-[9px] uppercase tracking-wider text-textMuted font-bold block">Syllabus Topic</span>
          <span className="text-xs font-bold text-textPrimary">{topic}</span>
        </div>
      </div>
    </div>
  );
};
