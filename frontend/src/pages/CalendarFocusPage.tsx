import React, { useState } from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { MonthlyCalendar } from '../components/calendar/MonthlyCalendar';
import { FocusHistory } from '../components/calendar/FocusHistory';
import { DayInspector } from '../components/calendar/DayInspector';
import { useCareerStore } from '../app/store/useCareerStore';
import { useShaylaAgentStore } from '../app/store/useShaylaAgentStore';
import { getDateForDay, formatDate } from '../utils/dateUtils';
import { buildAgentContext } from '../utils/agentContextUtils';
import { buildSmartNotifications } from '../utils/smartNotificationUtils';
import { SmartNotificationCenter } from '../components/shayla-agent/SmartNotificationCenter';

export const CalendarFocusPage: React.FC = () => {
  const dailyLogs = useCareerStore((s) => s.dailyLogs);
  const userProfile = useCareerStore((s) => s.userProfile);
  const agentStore = useShaylaAgentStore((s) => s);

  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1);

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
    setInspectorOpen(true);
  };

  const selectedLog = dailyLogs[selectedDay] || null;
  const agentContext = buildAgentContext(useCareerStore.getState(), selectedDay);
  const notifications = buildSmartNotifications(agentContext).filter((notification) => !agentStore.dismissedNotifications.includes(notification.id));
  
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
        <div className="flex flex-col gap-6">
          <FocusHistory />
          <SmartNotificationCenter
            notifications={notifications}
            onDismiss={(notification) => agentStore.dismissNotification(notification.id)}
            title="Calendar nudges"
          />
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
