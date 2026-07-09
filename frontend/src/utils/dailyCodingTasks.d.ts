export const OFFICIAL_DSA_START_DATE: '2026-08-01';
export const DAILY_CODING_BONUS_XP: 25;

export type DailyCodingTaskId = 'codechef_java_daily' | 'skillrack_daily' | 'leetcode_daily';
export type DailyCodingAwardId = DailyCodingTaskId | 'daily_coding_bonus';

export interface DailyCodingTask {
  id: DailyCodingTaskId;
  label: string;
  target: number;
  count: number;
  completed: boolean;
  xpAwarded: boolean;
  xp: number;
  active: boolean;
  startsAt?: string;
}

export interface DailyCodingState {
  date: string;
  tasks: Record<DailyCodingTaskId, DailyCodingTask>;
  dailyCodingBonusAwarded: boolean;
  dailyCodingBonusXp: number;
  officialDsaStartDate: string;
  officialDsaStreakActive: boolean;
  migratedFromLegacy: boolean;
}

export const DAILY_CODING_TASKS: Record<DailyCodingTaskId, {
  id: DailyCodingTaskId;
  label: string;
  target: number;
  xp: number;
  startsAt?: string;
  activeBeforeDsaStart: boolean;
}>;
export const ACTIVE_PRE_START_TASK_IDS: DailyCodingTaskId[];
export const LEGACY_DSA_TASK_IDS: string[];

export function isOnOrAfter(dateKey: string, startDate?: string): boolean;
export function clampCount(value: unknown, target?: number): number;
export function isLeetCodeActive(dateKey: string): boolean;
export function isOfficialDsaStreakActive(dateKey: string): boolean;
export function createDailyCodingTask(taskId: DailyCodingTaskId, existing?: Partial<DailyCodingTask>, dateKey?: string): DailyCodingTask;
export function createDailyCodingState(dateKey: string, existing?: Partial<DailyCodingState>): DailyCodingState;
export function getActiveCodingTaskIds(dateKey: string): DailyCodingTaskId[];
export function isDailyCodingComplete(state: DailyCodingState, dateKey?: string): boolean;
export function getAwardKey(dateKey: string, taskId: DailyCodingAwardId): string;
export function awardXpOnce(awards: Record<string, boolean>, dateKey: string, taskId: DailyCodingAwardId, amount: number): {
  awards: Record<string, boolean>;
  xpDelta: number;
  awarded: boolean;
  key: string;
};
export function updateDailyCodingTask(state: DailyCodingState, taskId: DailyCodingTaskId, patch?: Partial<DailyCodingTask>): DailyCodingState;
export function applyDailyCodingAwards(state: DailyCodingState, awards?: Record<string, boolean>): {
  state: DailyCodingState;
  awards: Record<string, boolean>;
  xpDelta: number;
};
export function migrateDailyCodingState<T extends Record<string, unknown>>(state?: T): T & {
  officialDsaStartDate: string;
  activeDsaXp: number;
  activeDsaStreak: number;
  dailyCodingByDate: Record<string, DailyCodingState>;
  dailyCodingXpAwards: Record<string, boolean>;
  dsaResetMigrationApplied: boolean;
};
