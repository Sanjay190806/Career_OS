import React from 'react';
import { StatCard } from '../ui/StatCard';
import { useCareerStore } from '../../app/store/useCareerStore';
import { getTotalLCSolved, getActivityTotal } from '../../utils/xpUtils';
import { Code2, Sigma, Brain, Boxes, Trophy, CalendarDays, Languages, Flame } from 'lucide-react';

export const OverviewMetrics: React.FC = () => {
  const userProfile = useCareerStore((s) => s.userProfile);
  const dailyLogs = useCareerStore((s) => s.dailyLogs);
  const problemLogs = useCareerStore((s) => s.problemLogs);
  const projects = useCareerStore((s) => s.projects);
  const resume = useCareerStore((s) => s.resume);
  const applications = useCareerStore((s) => s.applications);
  const xp = useCareerStore((s) => s.xp);
  const level = useCareerStore((s) => s.level);
  const germanXP = useCareerStore((s) => s.germanXP);
  const germanStreak = useCareerStore((s) => s.germanStreak);
  const germanLevel = useCareerStore((s) => s.germanLevel);

  const stateContext = { userProfile, dailyLogs, problemLogs, projects, resume, applications, level };

  const totalLc = getTotalLCSolved(stateContext);
  const skillrackCount = getActivityTotal(stateContext, 'skillrack');
  const aptitudeCount = getActivityTotal(stateContext, 'aptitude');
  const sqlCount = getActivityTotal(stateContext, 'sql');
  const completedDays = Object.values(dailyLogs).filter((l) => l.status === 'completed').length;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-8">
      <StatCard title="LeetCode Solved" value={totalLc} icon={<Code2 className="h-4 w-4" />} accentColor="#F97316" />
      <StatCard title="SkillRack Solved" value={skillrackCount} icon={<Boxes className="h-4 w-4" />} accentColor="#3B82F6" />
      <StatCard title="Aptitude Questions" value={aptitudeCount} icon={<Brain className="h-4 w-4" />} accentColor="#8B5CF6" />
      <StatCard title="SQL Progress" value={sqlCount} icon={<Sigma className="h-4 w-4" />} accentColor="#06B6D4" />
      <StatCard title="XP Level" value={`Lvl ${level}`} icon={<Trophy className="h-4 w-4" />} accentColor="#EAB308" description={`${xp} total XP`} />
      <StatCard title="Days Completed" value={`${completedDays}/180`} icon={<CalendarDays className="h-4 w-4" />} accentColor="#10B981" />
      <StatCard title="German XP" value={germanXP} icon={<Languages className="h-4 w-4" />} accentColor="#EF4444" />
      <StatCard title="German Streak" value={`${germanStreak} days`} icon={<Flame className="h-4 w-4" />} accentColor="#EAB308" description={germanLevel || 'A1 Beginner'} />
    </div>
  );
};
