export const CAREER_STORAGE_KEY: 'sanju-career-os-persist';

export function calculateXpFromDailyLogs(dailyLogs?: Record<string, any>): number;
export function calculateStreakFromDailyLogs(dailyLogs?: Record<string, any>): {
  currentStreak: number;
  longestStreak: number;
  completedDays: number;
};
export function getDirectXpFromBackup(input?: Record<string, any>, state?: Record<string, any>): number;
export function getDirectStreakFromBackup(input?: Record<string, any>, state?: Record<string, any>): {
  currentStreak: number;
  longestStreak: number;
};
export function normalizeCareerPersistedValue(rawValue: string, backupEnvelope?: Record<string, any>): string;
export function createLegacyCareerStorageValue(backup?: Record<string, any>): string;
