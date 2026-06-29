import React, { useState } from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { MonthlyCalendar } from '../components/calendar/MonthlyCalendar';
import { FocusHistory } from '../components/calendar/FocusHistory';
import { DayInspector } from '../components/calendar/DayInspector';
import { useCareerStore } from '../app/store/useCareerStore';
import { getDateForDay, formatDate } from '../utils/dateUtils';

export const CalendarFocusPage: React.FC = () => {
  const dailyLogs = useCareerStore((s) => s.dailyLogs);
  const userProfile = useCareerStore((s) => s.userProfile);

  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1);

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
    setInspectorOpen(true);
  };

  const selectedLog = dailyLogs[selectedDay] || null;
  
  const dateObj = getDateForDay(selectedDay, userProfile.startDate);
  const dateStr = formatDate(dateObj);

  return (
    <div className="flex flex-col gap-6 fade-in pb-10">
      <SectionHeader
        title="Calendar & Focus Workspace"
        subtitle="Review historical daily logs checklists and perform pomodoro focus timer sprints"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Calendar Grid */}
        <div className="lg:col-span-2">
          <MonthlyCalendar onDayClick={handleDayClick} />
        </div>

        {/* Right Focus modules */}
        <div>
          <FocusHistory />
        </div>
      </div>

      {/* Day Inspector Modal overlay */}
      <DayInspector
        isOpen={inspectorOpen}
        onClose={() => setInspectorOpen(false)}
        day={selectedDay}
        log={selectedLog}
        dateStr={dateStr}
      />
    </div>
  );
};
