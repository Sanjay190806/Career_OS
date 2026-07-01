import { useCompanyIntelligenceStore } from '../app/store/useCompanyIntelligenceStore';
import { useOAAttemptsStore } from '../app/store/useOAAttemptsStore';
import { useCareerStore } from '../app/store/useCareerStore';
import { mockInterviewService } from './mockInterviewService';
import { calcResumeScore, calcPlacementScore } from '../utils/xpUtils';

export const companyIntelligenceService = {
  getCompanies() {
    return useCompanyIntelligenceStore.getState().companies;
  },

  getPrepPlans() {
    return useCompanyIntelligenceStore.getState().prepPlans;
  },

  getAttempts() {
    return useOAAttemptsStore.getState().attempts;
  },

  getStrategy() {
    return useCompanyIntelligenceStore.getState().strategy;
  },

  // Compute a multi-dimensional readiness profile (0-100) per company
  calculateReadiness(companyId: string): {
    overall: number;
    coding: number;
    aptitude: number;
    sql: number;
    resume: number;
    project: number;
    communication: number;
    band: 'Not Ready' | 'Foundation' | 'Preparing' | 'Interview Ready' | 'Strong Candidate';
    color: string;
  } {
    const careerState = useCareerStore.getState();
    const mockStats = mockInterviewService.compileMockStats();
    const company = this.getCompanies().find((c) => c.id === companyId);
    
    // Fallback if company is not found
    if (!company) {
      return {
        overall: 50, coding: 50, aptitude: 50, sql: 50, resume: 50, project: 50, communication: 50,
        band: 'Preparing', color: 'text-accentBlue'
      };
    }

    // A. Gather metrics
    const resumeScore = calcResumeScore(careerState);
    const placementScore = calcPlacementScore(careerState);
    const mockConfidence = mockStats.avgConfidenceAnswers * 20; // convert 1-5 to 0-100 scale
    const communicationScore = mockStats.avgCommunicationScore;

    // Standard coding calculations from daily checklist logs
    let codingScore = 40;
    let sqlScore = 40;
    let aptitudeScore = 40;

    Object.values(careerState.dailyLogs || {}).forEach((log) => {
      const c = log.counts || {};
      if (c.leetcode || c.skillrack) codingScore += 1.5;
      if (c.sql) sqlScore += 2.0;
      if (c.aptitude) aptitudeScore += 1.0;
    });

    codingScore = Math.min(codingScore, 100);
    sqlScore = Math.min(sqlScore, 100);
    aptitudeScore = Math.min(aptitudeScore, 100);

    // B. Calculate weighted overall score based on company focus
    let weightedScore = 0;
    if (company.category === 'Product-based') {
      // Zoho style: heavy Coding + Projects + SQL + Mock Interview Confidence
      weightedScore = codingScore * 0.35 + resumeScore * 0.15 + mockConfidence * 0.15 + sqlScore * 0.15 + communicationScore * 0.2;
    } else if (company.category === 'Analytics') {
      // Fractal/Mu Sigma style: heavy SQL + Statistics + Case thinking
      weightedScore = sqlScore * 0.35 + codingScore * 0.15 + aptitudeScore * 0.15 + resumeScore * 0.15 + mockConfidence * 0.1 + communicationScore * 0.1;
    } else {
      // Accenture style: heavy Aptitude + Communication + OOPS basics + Overall Placement XP Score
      weightedScore = aptitudeScore * 0.25 + codingScore * 0.15 + sqlScore * 0.1 + resumeScore * 0.15 + communicationScore * 0.15 + placementScore * 0.2;
    }

    // Apply multiplier based on active preparation plan if it exists
    const plan = this.getPrepPlans()[companyId];
    if (plan) {
      const completedCount = plan.dailyTasks.filter((t) => t.completed).length;
      const completionMultiplier = plan.dailyTasks.length > 0 ? (completedCount / plan.dailyTasks.length) * 10 : 0;
      weightedScore += completionMultiplier;
    }

    const overall = Math.round(Math.min(weightedScore, 100));

    // C. Determine band & color
    let band: any = 'Preparing';
    let color = 'text-accentBlue';

    if (overall >= 86) {
      band = 'Strong Candidate';
      color = 'text-accentEmerald bg-accentEmerald/10 border-accentEmerald/20';
    } else if (overall >= 71) {
      band = 'Interview Ready';
      color = 'text-accentBlue bg-accentBlue/10 border-accentBlue/20';
    } else if (overall >= 51) {
      band = 'Preparing';
      color = 'text-accentOrange bg-accentOrange/10 border-accentOrange/20';
    } else if (overall >= 26) {
      band = 'Foundation';
      color = 'text-accentYellow bg-accentYellow/10 border-accentYellow/20';
    } else {
      band = 'Not Ready';
      color = 'text-red-400 bg-red-400/10 border-red-400/20';
    }

    return {
      overall,
      coding: Math.round(codingScore),
      aptitude: Math.round(aptitudeScore),
      sql: Math.round(sqlScore),
      resume: Math.round(resumeScore),
      project: 80, // placeholder baseline project design completion
      communication: Math.round(communicationScore),
      band,
      color,
    };
  },
};
export default companyIntelligenceService;
