export const JOURNEY_TOTAL_DAYS: number;
export const MONTHLY_LEETCODE_TARGET: number;
export const APTITUDE_TOPICS: string[];
export const CORE_SUBJECTS: string[];
export const COMPANIES: string[];
export const COMPANY_PREP_CATEGORIES: string[];

export interface PlacementEntry {
  skillrackCount: number;
  leetcodeEasy: number;
  leetcodeMedium: number;
  leetcodeHard: number;
  aptitudeCount: number;
  aptitudeTopic: string;
  sqlDone: boolean;
  sqlNotes: string;
  coreSubject: string;
  coreConcept: string;
  coreConceptDone: boolean;
  germanMinutes: number;
  resumeUpdated: boolean;
  githubUpdated: boolean;
  linkedinUpdated: boolean;
  companyPrepDone: boolean;
  companyName: string;
  companyPrepNotes: string;
  mockInterviewDone: boolean;
  interviewQuestionReviewed: boolean;
  mistakeNoteAdded: boolean;
  mistakeNotes: string;
  energyLevel: number;
  mood: string;
  sleepHours: number;
  biggestDistraction: string;
  tomorrowFirstTask: string;
  savedAt: string;
}

export interface BackupPayload {
  app: string;
  feature: string;
  version: number;
  exportedAt: string;
  metadata: Record<string, unknown>;
  entries: Record<string, PlacementEntry>;
}

export const DEFAULT_ENTRY: PlacementEntry;
export function createEmptyEntry(): PlacementEntry;
export function toISODate(date?: Date): string;
export function getMonthKey(dateKey: string): string;
export function getDateStatus(dateKey: string, todayKey?: string): 'past' | 'today' | 'future';
export function canEditDate(dateKey: string, todayKey?: string): boolean;
export function getAccessMode(dateKey: string, todayKey?: string): { status: 'past' | 'today' | 'future'; canEdit: boolean; readOnly: boolean; blocked: boolean };
export function calculateXP(entry?: PlacementEntry): number;
export function getLeetCodeTotal(entry?: PlacementEntry): number;
export function calculateMonthlyLeetCodeProgress(entriesByDate?: Record<string, PlacementEntry>, monthKey?: string): { solved: number; target: number; percentage: number };
export function hasPlacementTask(entry?: PlacementEntry): boolean;
export function isSuccessfulStreakDay(entry?: PlacementEntry): boolean;
export function calculateLightningScore(entry?: PlacementEntry, monthlyProgress?: { percentage: number }): number;
export function getGrade(score: number): 'S' | 'A' | 'B' | 'C' | 'D';
export function getLevel(totalXP?: number): { level: number; title: string; minXP: number };
export function summarizeProgress(entriesByDate?: Record<string, PlacementEntry>, todayKey?: string): {
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  missedDays: number;
  activeDays: number;
  successfulDays: number;
  comebackBadge: boolean;
  level: { level: number; title: string; minXP: number };
  days: Array<{ dateKey: string; entry: PlacementEntry; xp: number; success: boolean; lightningScore: number; grade: string }>;
};
export function generateTomorrowPlan(entry?: PlacementEntry, entriesByDate?: Record<string, PlacementEntry>, todayKey?: string): string[];
export function calculateCompanyReadiness(entriesByDate?: Record<string, PlacementEntry>, companyName?: string): {
  companyName: string;
  readiness: number;
  codingReadiness: number;
  aptitudeReadiness: number;
  csReadiness: number;
  sqlReadiness: number;
  communicationReadiness: number;
  completedTasks: string[];
  pendingTasks: string[];
  notes: string[];
};
export function getWeeklyReview(entriesByDate?: Record<string, PlacementEntry>, todayKey?: string): {
  xp: number;
  skillrack: number;
  leetcode: number;
  aptitude: number;
  core: number;
  germanDays: number;
  profileUpdates: number;
  successfulDays: number;
  missedDays: number;
  weakestArea: string;
  bestArea: string;
  nextWeekPriority: string;
};
export function createBackup(entriesByDate?: Record<string, PlacementEntry>, metadata?: Record<string, unknown>): BackupPayload;
export function validateBackupShape(payload: unknown): { valid: boolean; reason: string };
