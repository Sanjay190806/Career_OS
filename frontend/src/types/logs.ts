export interface ActivityCounts {
  leetcode: number;
  codechefJava?: number;
  skillrack: number;
  aptitude: number;
  sql: number;
  cscore: number;
  german: number;
  ml?: number;
  project: number;
  resume: number;
  mockTechnical?: number;
  mockHR?: number;
  mockCoding?: number;
  mockProject?: number;
}

export type DailyCodingTaskId = 'codechef_java_daily' | 'skillrack_daily' | 'leetcode_daily';

export interface DailyCodingTaskState {
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
  tasks: Record<DailyCodingTaskId, DailyCodingTaskState>;
  dailyCodingBonusAwarded: boolean;
  dailyCodingBonusXp: number;
  activeDsaXp: number;
  officialDsaStreakActive: boolean;
  migratedAt?: string;
}

export interface DailyLog {
  counts: ActivityCounts;
  lcStatus: number[];
  note: string;
  mood: number;
  energy: number;
  distractions: number;
  focusMinutes: number;
  status: 'not_started' | 'in_progress' | 'partial' | 'completed' | 'missed' | 'recovery';
  savedAt: string;
  xpEarned: number;
  freezeUsed?: boolean;
  freezeReason?: string;
  completionType?: 'missed' | 'partial' | 'minimum' | 'perfect' | 'freeze';
  rescueCompleted?: boolean;
  questsClaimed?: string[];
  dailyCoding?: DailyCodingState;
}

export interface ProblemLog {
  solved: boolean;
  confidence: number;
  solveTime: number;
  attempts: number;
  notes: string;
  mistakeLog: string;
  revisitFlag: boolean;
}
