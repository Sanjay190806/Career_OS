import { Target } from 'lucide-react';
import { useCareerStore } from '../../app/store/useCareerStore';
import { useUIStore } from '../../app/store/useUIStore';
import { MissionCard } from '../ui/MissionCard';
import { getDateForDay } from '../../utils/dateUtils';
import { normalizeDailyCodingState, toLocalDateKey } from '../../utils/dailyCodingUtils';

export const TodayMissionPanel: React.FC = () => {
  const currentDay = useUIStore((s) => s.currentDay);
  const careerState = useCareerStore((s) => s);
  const updateDailyLog = useCareerStore((s) => s.updateDailyLog);
  const updateDailyCodingTask = useCareerStore((s) => s.updateDailyCodingTask);

  const todayLog = careerState.dailyLogs[currentDay] || {
    counts: { leetcode: 0, skillrack: 0, aptitude: 0, sql: 0, cscore: 0, german: 0, project: 0, resume: 0 },
    note: '',
    status: 'not_started'
  };

  const dateKey = toLocalDateKey(getDateForDay(currentDay, careerState.userProfile.startDate));
  const dailyCoding = normalizeDailyCodingState(todayLog as any, dateKey);

  const tasks = [
    { key: 'codechef_java_daily', title: 'Complete CodeChef Java Daily', reward: 50, completed: dailyCoding.tasks.codechef_java_daily.completed },
    { key: 'skillrack_daily', title: 'Complete SkillRack Daily', reward: 50, completed: dailyCoding.tasks.skillrack_daily.completed },
    { key: 'leetcode_daily', title: 'LeetCode starts Aug 1', reward: 0, completed: dailyCoding.tasks.leetcode_daily.active ? dailyCoding.tasks.leetcode_daily.completed : false },
    { key: 'cscore', title: 'Revise 1 CS Core Topic', reward: 15, completed: (todayLog.counts.cscore || 0) >= 1 },
    { key: 'german', title: 'Practice 15 minutes of German', reward: 15, completed: (todayLog.counts.german || 0) >= 1 },
    { key: 'project', title: 'Push 1 Project Commit', reward: 25, completed: (todayLog.counts.project || 0) >= 1 }
  ];

  const handleToggle = (key: string, currentVal: boolean) => {
    if (key === 'codechef_java_daily' || key === 'skillrack_daily' || key === 'leetcode_daily') {
      if (key === 'leetcode_daily' && !dailyCoding.tasks.leetcode_daily.active) return;
      updateDailyCodingTask(currentDay, key as any, { completed: !currentVal });
      return;
    }
    const nextVal = currentVal ? 0 : 1;
    const nextCounts = { ...todayLog.counts, [key]: nextVal };
    updateDailyLog(currentDay, { counts: nextCounts });
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-white/[0.01] p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-accentOrange" />
          <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider">Active Daily Missions</h3>
        </div>
        <span className="text-[10px] text-textMuted font-bold">DAY {currentDay}</span>
      </div>
      
      <div className="flex flex-col gap-2">
        {tasks.map((task) => (
          <MissionCard
            key={task.key}
            title={task.title}
            category={task.key.toUpperCase()}
            xpReward={task.reward}
            completed={task.completed}
            onToggle={() => handleToggle(task.key, task.completed)}
          />
        ))}
      </div>
    </div>
  );
};
export default TodayMissionPanel;
