import { DailyCodingState, DailyCodingTaskId, DailyCodingTaskState, DailyLog } from '../types';

export const OFFICIAL_DSA_START_DATE = '2026-08-01';
export const DAILY_CODING_BONUS_XP = 25;

export const DAILY_CODING_TASKS: Record<DailyCodingTaskId, Omit<DailyCodingTaskState, 'id' | 'count' | 'completed' | 'xpAwarded' | 'active'>> = {
  codechef_java_daily: {
    label: 'CodeChef Java',
    target: 5,
    xp: 50
  },
  skillrack_daily: {
    label: 'SkillRack',
    target: 5,
    xp: 50
  },
  leetcode_daily: {
    label: 'LeetCode',
    target: 1,
    xp: 50,
    startsAt: OFFICIAL_DSA_START_DATE
  }
};

export const DAILY_CODING_ACTIVE_TASK_IDS: DailyCodingTaskId[] = ['codechef_java_daily', 'skillrack_daily'];

export function toLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isOnOrAfterDate(dateKey: string, startDateKey = OFFICIAL_DSA_START_DATE): boolean {
  return dateKey >= startDateKey;
}

export function isLeetCodeActive(dateKey: string): boolean {
  return isOnOrAfterDate(dateKey, OFFICIAL_DSA_START_DATE);
}

export function clampDailyCodingCount(value: number, target: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(target, Math.floor(value)));
}

function getExistingCount(log: DailyLog | undefined, taskId: DailyCodingTaskId): number {
  const counts = log?.counts || ({} as DailyLog['counts']);
  if (taskId === 'codechef_java_daily') return counts.codechefJava || 0;
  if (taskId === 'skillrack_daily') return counts.skillrack || 0;
  return Math.max(counts.leetcode || 0, log?.lcStatus?.length || 0);
}

export function createDailyCodingTask(log: DailyLog | undefined, taskId: DailyCodingTaskId, dateKey: string): DailyCodingTaskState {
  const config = DAILY_CODING_TASKS[taskId];
  const existingTask = log?.dailyCoding?.tasks?.[taskId];
  const count = clampDailyCodingCount(existingTask?.count ?? getExistingCount(log, taskId), config.target);
  const active = taskId === 'leetcode_daily' ? isLeetCodeActive(dateKey) : true;

  return {
    id: taskId,
    ...config,
    active,
    count,
    completed: Boolean(existingTask?.completed) || count >= config.target,
    xpAwarded: Boolean(existingTask?.xpAwarded)
  };
}

export function normalizeDailyCodingState(log: DailyLog | undefined, dateKey: string): DailyCodingState {
  const tasks = {
    codechef_java_daily: createDailyCodingTask(log, 'codechef_java_daily', dateKey),
    skillrack_daily: createDailyCodingTask(log, 'skillrack_daily', dateKey),
    leetcode_daily: createDailyCodingTask(log, 'leetcode_daily', dateKey)
  };

  const existing = log?.dailyCoding;
  const activeDsaXp = isOnOrAfterDate(dateKey)
    ? Object.values(tasks).reduce((sum, task) => sum + (task.xpAwarded ? task.xp : 0), 0) + (existing?.dailyCodingBonusAwarded ? DAILY_CODING_BONUS_XP : 0)
    : 0;

  return {
    date: dateKey,
    tasks,
    dailyCodingBonusAwarded: Boolean(existing?.dailyCodingBonusAwarded),
    dailyCodingBonusXp: DAILY_CODING_BONUS_XP,
    activeDsaXp,
    officialDsaStreakActive: isOnOrAfterDate(dateKey),
    migratedAt: existing?.migratedAt || new Date().toISOString()
  };
}

export function getDailyCodingCompletion(state: DailyCodingState): boolean {
  return DAILY_CODING_ACTIVE_TASK_IDS.every((taskId) => state.tasks[taskId].completed);
}

export function getDailyCodingAwardedXp(state: DailyCodingState): number {
  const taskXp = Object.values(state.tasks).reduce((sum, task) => sum + (task.xpAwarded ? task.xp : 0), 0);
  return taskXp + (state.dailyCodingBonusAwarded ? state.dailyCodingBonusXp : 0);
}

export function getDailyCodingAwardKey(dateKey: string, taskId: DailyCodingTaskId | 'daily_coding_bonus'): string {
  return `xp_awarded_${dateKey}_${taskId}`;
}

