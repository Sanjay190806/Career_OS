export interface ActivityCounts {
  leetcode: number;
  skillrack: number;
  aptitude: number;
  sql: number;
  cscore: number;
  german: number;
  ml: number;
  project: number;
  resume: number;
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
