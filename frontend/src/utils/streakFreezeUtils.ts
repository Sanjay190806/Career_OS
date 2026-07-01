import { DailyLog } from '../types';
import { getTodayDay } from './dateUtils';

// Helper to get week key in format YYYY-WW
export function getWeekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export function canUseFreeze(date: Date, weeklyFreezeUsage: Record<string, boolean> = {}): boolean {
  const weekKey = getWeekKey(date);
  return !weeklyFreezeUsage[weekKey];
}

export function getFreezesLeftForWeek(date: Date, weeklyFreezeUsage: Record<string, boolean> = {}): number {
  const weekKey = getWeekKey(date);
  return weeklyFreezeUsage[weekKey] ? 0 : 1;
}

export function calculateStreakWithFreezes(dailyLogs: Record<string, DailyLog>, startDate: string): { currentStreak: number; longestStreak: number } {
  // Let's find today's day number
  const todayDay = getTodayDay(startDate);
  
  let currentStreak = 0;
  let activeStreak = 0;
  let longestStreak = 0;
  
  // Go day by day from Day 1 to todayDay
  for (let d = 1; d <= todayDay; d++) {
    const log = dailyLogs[d];
    if (!log) {
      // Unlogged day -> if it's before today, it's missed (unless it's today itself)
      if (d < todayDay) {
        activeStreak = 0; // Broke streak
      }
      continue;
    }
    
    if (log.freezeUsed) {
      // Protected by freeze -> doesn't break, doesn't increment
      continue;
    }
    
    // Check if the day is completed (or minimum day completed, which keeps streak alive!)
    // Wait, the rules say "At least 5 SkillRack problems OR 1 LeetCode problem OR 30 min Java DSA" etc. is Minimum Day.
    // If the completionType is 'minimum' or 'perfect' or the status is 'completed'
    const isCompleted = log.status === 'completed' || log.completionType === 'minimum' || log.completionType === 'perfect' || log.rescueCompleted === true;
    
    if (isCompleted) {
      activeStreak++;
      longestStreak = Math.max(longestStreak, activeStreak);
    } else {
      // Missed or partial (and not frozen) -> breaks streak
      activeStreak = 0;
    }
  }
  
  // Calculate current streak by backtracking from today
  let tempDay = todayDay;
  while (tempDay >= 1) {
    const log = dailyLogs[tempDay];
    if (!log) {
      if (tempDay === todayDay) {
        tempDay--;
        continue; // Today can be unlogged without breaking current streak yet
      }
      break; // Missed day breaks current streak
    }
    
    if (log.freezeUsed) {
      tempDay--;
      continue; // Freeze day is skipped, streak is protected
    }
    
    const isCompleted = log.status === 'completed' || log.completionType === 'minimum' || log.completionType === 'perfect' || log.rescueCompleted === true;
    if (isCompleted) {
      currentStreak++;
      tempDay--;
    } else {
      if (tempDay === todayDay) {
        // Today is logged but not completed yet -> look at yesterday
        tempDay--;
        continue;
      }
      break; // Missed day breaks current streak
    }
  }
  
  return { currentStreak, longestStreak };
}
