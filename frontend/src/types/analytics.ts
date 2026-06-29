export interface PlacementReadiness {
  readonly dsaScore: number;
  readonly sqlScore: number;
  readonly aptitudeScore: number;
  readonly cscoreScore: number;
  readonly projectsScore: number;
  readonly resumeScore: number;
  readonly consistencyScore: number;
  readonly overallScore: number;
}

export interface StudyVelocity {
  readonly avgProblemsPerDay: number;
  readonly totalProblemsLastWeek: number;
  readonly focusMinutesAvg: number;
}

export interface BurnoutAssessment {
  readonly riskLevel: 'Low' | 'Moderate' | 'High';
  readonly energyTrend: number;
  readonly distractionRating: number;
}
