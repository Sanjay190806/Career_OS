import { CareerState, DailyLog, XPThreshold } from '../types';
import { XP_RULES } from '../data/constants';
import { ROADMAP } from '../data/roadmap';
import { LEVELS } from '../data/achievements';

export function getLevel(xp: number): XPThreshold {
  let lvl = LEVELS[0];
  for (const l of LEVELS) {
    if (xp >= l.minXp) lvl = l;
    else break;
  }
  return lvl;
}

export function getStreak(s: Partial<CareerState>): number {
  let streak = 0;
  const logs = s.dailyLogs || {};
  
  // Calculate relative day
  const start = new Date(s.userProfile?.startDate || '2026-07-01');
  const diff = Math.floor((new Date().getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  let d = Math.min(Math.max(diff + 1, 1), 180);

  if (logs[d]?.status !== 'completed') {
    d--;
  }
  while (d >= 1 && logs[d]?.status === 'completed') {
    streak++;
    d--;
  }
  return streak;
}

export function getTotalLCSolved(s: Partial<CareerState>): number {
  return Object.keys(s.dailyLogs || {}).reduce((sum, day) => {
    return sum + (s.dailyLogs![day].lcStatus?.length || 0);
  }, 0);
}

export function getActivityTotal(s: Partial<CareerState>, id: keyof DailyLog['counts']): number {
  return Object.values(s.dailyLogs || {}).reduce((sum, l) => sum + (l.counts?.[id] || 0), 0);
}

export function calcResumeScore(s: Partial<CareerState>): number {
  if (!s.resume) return 0;
  const sec = s.resume.sections;
  return Math.round(
    (sec.formatting || 0) * 0.20 +
    (sec.projects || 0) * 0.25 +
    (sec.skills || 0) * 0.10 +
    (sec.education || 0) * 0.15 +
    (sec.contact || 0) * 0.10 +
    (sec.achievements || 0) * 0.20
  );
}

export function calcConsistencyScore(s: Partial<CareerState>): number {
  const logs = s.dailyLogs || {};
  const completed = Object.values(logs).filter(l => l.status === 'completed').length;
  
  const start = new Date(s.userProfile?.startDate || '2026-07-01');
  const diff = Math.floor((new Date().getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const today = Math.min(Math.max(diff + 1, 1), 180);

  const streakScore = Math.min((getStreak(s) / 14) * 100, 100);
  const ratioScore = today > 0 ? (completed / today) * 100 : 0;
  return Math.round(streakScore * 0.4 + ratioScore * 0.6);
}

export function calcPlacementScore(s: Partial<CareerState>): number {
  const solved = getTotalLCSolved(s);
  const dsaScore = Math.min((solved / 360) * 100, 100);
  
  const skillrackTotal = getActivityTotal(s, 'skillrack');
  const skillrackScore = Math.min((skillrackTotal / 150) * 100, 100);

  const aptTotal = getActivityTotal(s, 'aptitude');
  const aptScore = Math.min((aptTotal / 900) * 100, 100); 

  const sqlTotal = getActivityTotal(s, 'sql');
  const sqlScore = Math.min((sqlTotal / 90) * 100, 100); 

  const csTotal = getActivityTotal(s, 'cscore');
  const csScore = Math.min((csTotal / 50) * 100, 100);

  const projProgresses = Object.values(s.projects || {}).map(p => {
    const valSum = Object.values(p.progress || {}).reduce((a,b)=>a+b, 0);
    return valSum / 6;
  });
  const avgProjProgress = projProgresses.length > 0 ? (projProgresses.reduce((a,b)=>a+b,0)/projProgresses.length) : 0;

  const resumeScore = calcResumeScore(s);
  const consistencyScore = calcConsistencyScore(s);

  return Math.round(
    dsaScore * 0.30 +
    skillrackScore * 0.15 +
    aptScore * 0.15 +
    sqlScore * 0.10 +
    csScore * 0.15 +
    avgProjProgress * 0.10 +
    resumeScore * 0.03 +
    consistencyScore * 0.02
  );
}

export function calcGermanyReadinessScore(s: Partial<CareerState>): number {
  const logs = s.dailyLogs || {};
  const germanLessonsTotal = Object.values(logs).reduce((sum, l) => sum + (l.counts?.german || 0), 0);
  const germanLessonScore = Math.min((germanLessonsTotal / 300) * 100, 100);
  
  const germanXp = s.germanXP || 0;
  const germanXpScore = Math.min((germanXp / 1000) * 100, 100);
  
  const germanStreak = s.germanStreak || 0;
  const streakScore = Math.min((germanStreak / 30) * 100, 100);

  const resumeScore = calcResumeScore(s);

  const projProgresses = Object.values(s.projects || {}).map(p => {
    const valSum = Object.values(p.progress || {}).reduce((a,b)=>a+b, 0);
    return valSum / 6;
  });
  const avgProjProgress = projProgresses.length > 0 ? (projProgresses.reduce((a,b)=>a+b,0)/projProgresses.length) : 0;

  const appsCount = Object.keys(s.applications || {}).length;
  const appsScore = Math.min((appsCount / 5) * 100, 100);

  return Math.round(
    germanLessonScore * 0.30 +
    germanXpScore * 0.20 +
    streakScore * 0.10 +
    resumeScore * 0.15 +
    avgProjProgress * 0.15 +
    appsScore * 0.10
  );
}

export function awardXPForLog(day: number, log: DailyLog): number {
  let xp = 0;
  
  // LeetCode problems XP weighting
  (log.lcStatus || []).forEach(idx => {
    const p = ROADMAP[String(day)]?.[idx];
    if (p) {
      if (p.difficulty === 'Easy') xp += XP_RULES.leetcode_easy;
      else if (p.difficulty === 'Medium') xp += XP_RULES.leetcode_medium;
      else xp += XP_RULES.leetcode_hard;
    }
  });

  const c = log.counts || {};
  xp += (c.leetcode || 0) * 10;
  xp += (c.skillrack || 0) * XP_RULES.skillrack;
  xp += (c.aptitude || 0) * XP_RULES.aptitude;
  if ((c.sql || 0) > 0) xp += XP_RULES.sql_session;
  if ((c.cscore || 0) > 0) xp += XP_RULES.cscore_session;
  if ((c.german || 0) >= 15) xp += XP_RULES.german_session;
  if ((c.project || 0) >= 20) xp += XP_RULES.project_work;
  if ((c.resume || 0) >= 10) xp += XP_RULES.resume_work;

  if (log.status === 'completed') xp += XP_RULES.full_day_bonus;

  return xp;
}
