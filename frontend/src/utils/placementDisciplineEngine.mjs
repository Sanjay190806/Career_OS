export const JOURNEY_TOTAL_DAYS = 184;
export const MONTHLY_LEETCODE_TARGET = 50;

export const APTITUDE_TOPICS = [
  'Simple Interest',
  'Compound Interest',
  'Profit and Loss',
  'Ratio and Proportion',
  'Time and Work',
  'Speed Time Distance',
  'Percentage',
  'Number System',
  'Probability',
  'Permutation and Combination',
  'Mixtures',
  'Averages',
];

export const CORE_SUBJECTS = ['OOPS', 'DBMS', 'OS', 'CN'];
export const COMPANIES = ['Zoho', 'HCLTech', 'Accenture', 'TCS', 'Infosys', 'Wipro', 'Cognizant', 'Capgemini'];
export const COMPANY_PREP_CATEGORIES = [
  'Aptitude',
  'Java basics',
  'DSA basics',
  'SQL',
  'OOPS',
  'DBMS',
  'OS',
  'CN',
  'HR questions',
  'Communication',
  'Resume explanation',
  'Project explanation',
];

export const DEFAULT_ENTRY = {
  skillrackCount: 0,
  leetcodeEasy: 0,
  leetcodeMedium: 0,
  leetcodeHard: 0,
  aptitudeCount: 0,
  aptitudeTopic: 'Percentage',
  sqlDone: false,
  sqlNotes: '',
  coreSubject: 'OOPS',
  coreConcept: '',
  coreConceptDone: false,
  germanMinutes: 0,
  resumeUpdated: false,
  githubUpdated: false,
  linkedinUpdated: false,
  companyPrepDone: false,
  companyName: 'Zoho',
  companyPrepNotes: '',
  mockInterviewDone: false,
  interviewQuestionReviewed: false,
  mistakeNoteAdded: false,
  mistakeNotes: '',
  energyLevel: 6,
  mood: 'Focused',
  sleepHours: 7,
  biggestDistraction: '',
  tomorrowFirstTask: '',
  savedAt: '',
};

export function createEmptyEntry() {
  return { ...DEFAULT_ENTRY };
}

export function toISODate(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function getMonthKey(dateKey) {
  return dateKey.slice(0, 7);
}

export function getDateStatus(dateKey, todayKey = toISODate()) {
  if (dateKey < todayKey) return 'past';
  if (dateKey > todayKey) return 'future';
  return 'today';
}

export function canEditDate(dateKey, todayKey = toISODate()) {
  return getDateStatus(dateKey, todayKey) === 'today';
}

export function getAccessMode(dateKey, todayKey = toISODate()) {
  const status = getDateStatus(dateKey, todayKey);
  return {
    status,
    canEdit: status === 'today',
    readOnly: status === 'past',
    blocked: status === 'future',
  };
}

export function calculateXP(entry = DEFAULT_ENTRY) {
  const skillrackXP = Number(entry.skillrackCount || 0) >= 10 ? 60 : Number(entry.skillrackCount || 0) * 5;
  const leetcodeXP =
    Number(entry.leetcodeEasy || 0) * 20 +
    Number(entry.leetcodeMedium || 0) * 40 +
    Number(entry.leetcodeHard || 0) * 80;
  const aptitudeXP = Number(entry.aptitudeCount || 0) * 3 + (Number(entry.aptitudeCount || 0) >= 20 ? 20 : 0);
  const profileXP =
    (entry.resumeUpdated ? 35 : 0) +
    (entry.githubUpdated ? 35 : 0) +
    (entry.linkedinUpdated ? 35 : 0);

  return (
    skillrackXP +
    leetcodeXP +
    aptitudeXP +
    (entry.sqlDone ? 30 : 0) +
    (entry.coreConceptDone ? 40 : 0) +
    (Number(entry.germanMinutes || 0) >= 15 ? 25 : 0) +
    profileXP +
    (entry.companyPrepDone ? 50 : 0) +
    (entry.mockInterviewDone ? 100 : 0) +
    (entry.interviewQuestionReviewed ? 30 : 0) +
    (entry.mistakeNoteAdded ? 30 : 0) +
    (String(entry.tomorrowFirstTask || '').trim() ? 20 : 0)
  );
}

export function getLeetCodeTotal(entry = DEFAULT_ENTRY) {
  return Number(entry.leetcodeEasy || 0) + Number(entry.leetcodeMedium || 0) + Number(entry.leetcodeHard || 0);
}

export function calculateMonthlyLeetCodeProgress(entriesByDate = {}, monthKey = getMonthKey(toISODate())) {
  const solved = Object.entries(entriesByDate)
    .filter(([dateKey]) => getMonthKey(dateKey) === monthKey)
    .reduce((sum, [, entry]) => sum + getLeetCodeTotal(entry), 0);
  return {
    solved,
    target: MONTHLY_LEETCODE_TARGET,
    percentage: Math.min(100, Math.round((solved / MONTHLY_LEETCODE_TARGET) * 100)),
  };
}

export function hasPlacementTask(entry = DEFAULT_ENTRY) {
  return Boolean(
    entry.resumeUpdated ||
    entry.githubUpdated ||
    entry.linkedinUpdated ||
    entry.companyPrepDone ||
    entry.interviewQuestionReviewed ||
    entry.mistakeNoteAdded ||
    entry.mockInterviewDone
  );
}

export function isSuccessfulStreakDay(entry = DEFAULT_ENTRY) {
  return Boolean(
    Number(entry.skillrackCount || 0) >= 10 &&
    Number(entry.aptitudeCount || 0) > 0 &&
    entry.coreConceptDone &&
    Number(entry.germanMinutes || 0) >= 15 &&
    hasPlacementTask(entry)
  );
}

export function calculateLightningScore(entry = DEFAULT_ENTRY, monthlyProgress = { percentage: 0 }) {
  const skillrack = Math.min(1, Number(entry.skillrackCount || 0) / 10) * 22;
  const aptitude = Number(entry.aptitudeCount || 0) > 0 ? 12 : 0;
  const core = entry.coreConceptDone ? 14 : 0;
  const german = Number(entry.germanMinutes || 0) >= 15 ? 12 : 0;
  const placement = hasPlacementTask(entry) ? 14 : 0;
  const xp = Math.min(1, calculateXP(entry) / 300) * 16;
  const leetcode = Math.min(1, Number(monthlyProgress.percentage || 0) / 100) * 10;
  return Math.max(0, Math.min(100, Math.round(skillrack + aptitude + core + german + placement + xp + leetcode)));
}

export function getGrade(score) {
  if (score >= 90) return 'S';
  if (score >= 75) return 'A';
  if (score >= 60) return 'B';
  if (score >= 40) return 'C';
  return 'D';
}

export function getLevel(totalXP = 0) {
  const levels = [
    { level: 1, title: 'Broken Starter', minXP: 0 },
    { level: 2, title: 'Comeback Builder', minXP: 750 },
    { level: 3, title: 'Daily Grinder', minXP: 1800 },
    { level: 4, title: 'Placement Soldier', minXP: 3500 },
    { level: 5, title: 'Interview Hunter', minXP: 6000 },
    { level: 6, title: 'Offer Mode', minXP: 9000 },
    { level: 7, title: 'Beast Mode', minXP: 13000 },
  ];
  return [...levels].reverse().find((item) => totalXP >= item.minXP) || levels[0];
}

export function summarizeProgress(entriesByDate = {}, todayKey = toISODate()) {
  const dated = Object.entries(entriesByDate).filter(([dateKey]) => dateKey <= todayKey);
  const enriched = dated.map(([dateKey, entry]) => {
    const monthProgress = calculateMonthlyLeetCodeProgress(entriesByDate, getMonthKey(dateKey));
    const lightningScore = calculateLightningScore(entry, monthProgress);
    return {
      dateKey,
      entry,
      xp: calculateXP(entry),
      success: isSuccessfulStreakDay(entry),
      lightningScore,
      grade: getGrade(lightningScore),
    };
  }).sort((a, b) => a.dateKey.localeCompare(b.dateKey));

  let currentStreak = 0;
  for (let index = enriched.length - 1; index >= 0; index -= 1) {
    if (!enriched[index].success) break;
    currentStreak += 1;
  }

  let longestStreak = 0;
  let running = 0;
  for (const day of enriched) {
    if (day.success) {
      running += 1;
      longestStreak = Math.max(longestStreak, running);
    } else {
      running = 0;
    }
  }

  const totalXP = enriched.reduce((sum, day) => sum + day.xp, 0);
  const missedDays = enriched.filter((day) => !day.success).length;
  const activeDays = enriched.filter((day) => day.xp > 0 || day.success).length;
  const successfulDays = enriched.filter((day) => day.success).length;
  const lastDay = enriched[enriched.length - 1];
  const previousDay = enriched[enriched.length - 2];
  const comebackBadge = Boolean(lastDay?.success && previousDay && !previousDay.success);

  return {
    totalXP,
    currentStreak,
    longestStreak,
    missedDays,
    activeDays,
    successfulDays,
    comebackBadge,
    level: getLevel(totalXP),
    days: enriched,
  };
}

export function generateTomorrowPlan(entry = DEFAULT_ENTRY, entriesByDate = {}, todayKey = toISODate()) {
  const plan = [];
  if (Number(entry.skillrackCount || 0) < 10) plan.push('SkillRack recovery: finish 10 problems before anything else.');
  if (Number(entry.aptitudeCount || 0) === 0) plan.push('Start with aptitude practice and solve at least 20 questions.');
  if (Number(entry.germanMinutes || 0) < 15) plan.push('German 15 minutes: keep the language streak alive.');
  if (!entry.coreConceptDone) plan.push('Complete one OOPS, DBMS, OS, or CN concept with notes.');
  const monthProgress = calculateMonthlyLeetCodeProgress(entriesByDate, getMonthKey(todayKey));
  const dayOfMonth = Number(todayKey.slice(8, 10));
  const paceTarget = Math.ceil((MONTHLY_LEETCODE_TARGET / 30) * dayOfMonth);
  if (monthProgress.solved < paceTarget) plan.push('LeetCode is behind monthly pace. Add 2 focused problems tomorrow.');
  const recent = Object.entries(entriesByDate)
    .filter(([dateKey]) => dateKey <= todayKey)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 4);
  if (recent.length && recent.every(([, item]) => !item.resumeUpdated && !item.githubUpdated && !item.linkedinUpdated)) {
    plan.push('Refresh one placement profile surface: resume, GitHub, or LinkedIn.');
  }
  if (!plan.length) plan.push('Protect the basics, then push one company-specific prep block.');
  return plan;
}

export function calculateCompanyReadiness(entriesByDate = {}, companyName = 'Zoho') {
  const entries = Object.values(entriesByDate);
  const companyEntries = entries.filter((entry) => entry.companyName === companyName && entry.companyPrepDone);
  const skillrack = entries.reduce((sum, entry) => sum + Number(entry.skillrackCount || 0), 0);
  const aptitude = entries.reduce((sum, entry) => sum + Number(entry.aptitudeCount || 0), 0);
  const cs = entries.filter((entry) => entry.coreConceptDone).length;
  const sql = entries.filter((entry) => entry.sqlDone).length;
  const communication = entries.filter((entry) => entry.mockInterviewDone || entry.interviewQuestionReviewed).length;
  const completedCategories = new Set(companyEntries.flatMap((entry) => {
    const notes = String(entry.companyPrepNotes || '').toLowerCase();
    return COMPANY_PREP_CATEGORIES.filter((category) => notes.includes(category.toLowerCase()));
  }));
  if (companyEntries.length > 0) completedCategories.add('Company practice');

  const codingReadiness = Math.min(100, Math.round((skillrack / 300) * 100));
  const aptitudeReadiness = Math.min(100, Math.round((aptitude / 600) * 100));
  const csReadiness = Math.min(100, Math.round((cs / 30) * 100));
  const sqlReadiness = Math.min(100, Math.round((sql / 20) * 100));
  const communicationReadiness = Math.min(100, Math.round((communication / 12) * 100));
  const readiness = Math.round((codingReadiness + aptitudeReadiness + csReadiness + sqlReadiness + communicationReadiness) / 5);

  return {
    companyName,
    readiness,
    codingReadiness,
    aptitudeReadiness,
    csReadiness,
    sqlReadiness,
    communicationReadiness,
    completedTasks: [...completedCategories],
    pendingTasks: COMPANY_PREP_CATEGORIES.filter((category) => !completedCategories.has(category)),
    notes: companyEntries.map((entry) => entry.companyPrepNotes).filter(Boolean).slice(-3),
  };
}

export function getWeeklyReview(entriesByDate = {}, todayKey = toISODate()) {
  const end = new Date(`${todayKey}T00:00:00`);
  const start = new Date(end);
  start.setDate(end.getDate() - 6);
  const weekEntries = Object.entries(entriesByDate).filter(([dateKey]) => {
    const date = new Date(`${dateKey}T00:00:00`);
    return date >= start && date <= end;
  });
  const totals = weekEntries.reduce((acc, [, entry]) => {
    acc.xp += calculateXP(entry);
    acc.skillrack += Number(entry.skillrackCount || 0);
    acc.leetcode += getLeetCodeTotal(entry);
    acc.aptitude += Number(entry.aptitudeCount || 0);
    acc.core += entry.coreConceptDone ? 1 : 0;
    acc.germanDays += Number(entry.germanMinutes || 0) >= 15 ? 1 : 0;
    acc.profileUpdates += (entry.resumeUpdated ? 1 : 0) + (entry.githubUpdated ? 1 : 0) + (entry.linkedinUpdated ? 1 : 0);
    acc.successfulDays += isSuccessfulStreakDay(entry) ? 1 : 0;
    return acc;
  }, { xp: 0, skillrack: 0, leetcode: 0, aptitude: 0, core: 0, germanDays: 0, profileUpdates: 0, successfulDays: 0 });

  const areas = [
    ['SkillRack', totals.skillrack / 70],
    ['LeetCode', totals.leetcode / 12],
    ['Aptitude', totals.aptitude / 140],
    ['Core CS', totals.core / 7],
    ['German', totals.germanDays / 7],
    ['Profile', totals.profileUpdates / 3],
  ];
  const sorted = [...areas].sort((a, b) => a[1] - b[1]);
  return {
    ...totals,
    missedDays: Math.max(0, weekEntries.length - totals.successfulDays),
    weakestArea: sorted[0][0],
    bestArea: sorted[sorted.length - 1][0],
    nextWeekPriority: `${sorted[0][0]} first, then maintain ${sorted[sorted.length - 1][0]}.`,
  };
}

export function createBackup(entriesByDate = {}, metadata = {}) {
  return {
    app: 'Sanzz Career OS',
    feature: 'v1.8-placement-discipline-engine',
    version: 1,
    exportedAt: new Date().toISOString(),
    metadata,
    entries: entriesByDate,
  };
}

export function validateBackupShape(payload) {
  if (!payload || typeof payload !== 'object') return { valid: false, reason: 'Backup is not an object.' };
  if (payload.feature !== 'v1.8-placement-discipline-engine') return { valid: false, reason: 'Backup feature does not match v1.8 placement engine.' };
  if (!payload.entries || typeof payload.entries !== 'object' || Array.isArray(payload.entries)) return { valid: false, reason: 'Backup entries are missing or corrupted.' };
  for (const [dateKey, entry] of Object.entries(payload.entries)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return { valid: false, reason: `Invalid date key: ${dateKey}` };
    if (!entry || typeof entry !== 'object') return { valid: false, reason: `Invalid entry for ${dateKey}` };
    if (typeof entry.skillrackCount !== 'number' || typeof entry.aptitudeCount !== 'number') {
      return { valid: false, reason: `Invalid numeric fields for ${dateKey}` };
    }
  }
  return { valid: true, reason: 'Backup is valid.' };
}
