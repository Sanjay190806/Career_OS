export * from './roadmap';
export * from './logs';
export * from './projects';
export * from './resume';
export * from './applications';
export * from './analytics';
export * from './settings';
export * from './achievements';
export * from './ai';
export * from './focus';
export * from './german';

import { DailyLog, ProblemLog } from './logs';
import { Project } from './projects';
import { ResumeProfile } from './resume';
import { CareerApplication } from './applications';
import { UserProfile } from './settings';
import { GermanDailyLog, GermanLessonProgress, GermanQuizHistoryItem, GermanVocabularyProgress, GermanLevel } from './german';

export interface CareerState {
  userProfile: UserProfile;
  dailyLogs: Record<string, DailyLog>;
  problemLogs: Record<string, ProblemLog>;
  projects: Record<string, Project>;
  resume: ResumeProfile;
  applications: CareerApplication[];
  xp: number;
  level: number;
  badges: string[];
  unlockedBadges: Record<string, string>;
  sqlProgress?: Record<string, { completed: boolean; confidence: number; notes: string; solvedCount: number }>;
  aptitudeProgress?: Record<string, { questionsSolved: number; accuracy: number; confidence: number; completed: boolean; notes: string }>;
  csCoreProgress?: Record<string, Record<string, { completed: boolean; confidence: number; notes: string; interviewReady: boolean; lastRevisedAt: string | null; sampleQuestion: string }>>; // Record<subject, Record<topic, ...>>
  skillRackStats?: { totalSolved: number; easyCount: number; mediumCount: number; hardCount: number; categories: Record<string, number> };
  dsaPatternMastery?: Record<string, { solvedCount: number; totalCount: number; confidenceSum: number; confidenceCount: number; mastery: 'Not Started' | 'Learning' | 'Practicing' | 'Strong' | 'Interview Ready' }>;
  germanLevel?: GermanLevel;
  germanXP?: number;
  germanStreak?: number;
  longestGermanStreak?: number;
  completedLessons?: Record<string, GermanLessonProgress>;
  vocabulary?: Record<string, GermanVocabularyProgress>;
  weakWords?: string[];
  quizHistory?: GermanQuizHistoryItem[];
  dailyGermanLogs?: Record<string, GermanDailyLog>;
  currentLessonId?: string;
  german7DayStreakRewarded?: boolean;
}
