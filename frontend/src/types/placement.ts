export interface CompanyTarget {
  id: string;
  name: string;
  category: string;
  targetRoles: string;
  whatTheyTest: string;
  prepDirection: string;
  readinessScore: number;
  priority: 'High' | 'Medium' | 'Low';
  notes: string;
  status: 'Target' | 'Applied' | 'Interviewing' | 'Rejected' | 'Offer';
}

export interface SkillNode {
  id: string;
  title: string;
  group: 'Java DSA' | 'SkillRack / Zoho Logic' | 'Aptitude' | 'SQL + DBMS' | 'CS Fundamentals' | 'Career System';
  goal: string;
  why: string;
  whatToDo: string[];
  practiceTarget: string;
  miniBoss: string;
  status: 'locked' | 'unlocked' | 'learning' | 'completed' | 'interview-ready';
}

export interface WeeklyReview {
  weekKey: string; // YYYY-WW
  wins: string;
  problems: string;
  recoveryPlan: string;
  nextWeekMission: string;
  weakDsaPatterns: string;
  weakAptitudeTopics: string;
  weakCsCoreTopics: string;
  resumeProjectProgress: string;
  germanProgress: string;
  moodEnergySummary: string;
  
  // Weekly Metrics actual vs target
  metrics: {
    skillrackActual: number;
    skillrackTarget: number;
    leetcodeActual: number;
    leetcodeTarget: number;
    aptitudeActual: number;
    aptitudeTarget: number;
    sqlActual: number;
    sqlTarget: number;
    cscoreActual: number;
    cscoreTarget: number;
    mocksActual: number;
    mocksTarget: number;
    perfectDays: number;
    freezesUsed: number;
    studyMinutes: number;
  };
  savedAt: string;
}
