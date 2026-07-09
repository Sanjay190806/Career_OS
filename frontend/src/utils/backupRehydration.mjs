export const CAREER_STORAGE_KEY = 'sanju-career-os-persist';

function safeParse(value, fallback = null) {
  if (typeof value !== 'string') return value ?? fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function getPersistedState(payload) {
  if (!payload || typeof payload !== 'object') return {};
  if (payload.state && typeof payload.state === 'object') return payload.state;
  return payload;
}

function isCompletedLog(log) {
  return Boolean(
    log?.status === 'completed' ||
    log?.completionType === 'minimum' ||
    log?.completionType === 'perfect' ||
    log?.completionType === 'freeze' ||
    log?.rescueCompleted === true ||
    log?.completed === true
  );
}

export function calculateXpFromDailyLogs(dailyLogs = {}) {
  return Object.values(dailyLogs || {}).reduce((sum, log) => {
    if (!log || typeof log !== 'object') return sum;
    if (typeof log.xpEarned === 'number' && log.xpEarned > 0) return sum + log.xpEarned;

    const counts = log.counts || {};
    let xp = 0;
    xp += Number(counts.leetcode || 0) * 10;
    xp += Number(counts.skillrack || 0) * 5;
    xp += Number(counts.aptitude || 0) * 2;
    if (Number(counts.sql || 0) > 0) xp += 20;
    if (Number(counts.cscore || 0) > 0) xp += 20;
    if (Number(counts.german || 0) >= 15) xp += 10;
    if (Number(counts.project || 0) >= 20) xp += 40;
    if (Number(counts.resume || 0) >= 10) xp += 30;
    if (log.completionType === 'perfect') xp += 150;
    else if (log.completionType === 'minimum') xp += 50;
    else if (log.status === 'completed') xp += 100;
    return sum + xp;
  }, 0);
}

export function calculateStreakFromDailyLogs(dailyLogs = {}) {
  const days = Object.entries(dailyLogs || {})
    .map(([key, log]) => ({ day: Number(key), log }))
    .filter((item) => Number.isFinite(item.day))
    .sort((a, b) => a.day - b.day);

  let longestStreak = 0;
  let running = 0;
  let previousCompletedDay = null;
  const completedDays = [];

  for (const item of days) {
    if (isCompletedLog(item.log)) {
      running = previousCompletedDay === item.day - 1 ? running + 1 : 1;
      longestStreak = Math.max(longestStreak, running);
      previousCompletedDay = item.day;
      completedDays.push(item.day);
    } else if (!item.log?.freezeUsed) {
      running = 0;
      previousCompletedDay = null;
    }
  }

  let currentStreak = 0;
  if (completedDays.length > 0) {
    currentStreak = 1;
    for (let index = completedDays.length - 1; index > 0; index -= 1) {
      if (completedDays[index - 1] === completedDays[index] - 1) currentStreak += 1;
      else break;
    }
  }

  return { currentStreak, longestStreak, completedDays: completedDays.length };
}

export function getDirectXpFromBackup(input = {}, state = {}) {
  const candidates = [
    state.xp,
    state.totalXp,
    state.globalXp,
    state.careerXp,
    input?.xpState?.totalXp,
    input?.xpState?.globalXp,
    input?.xpState?.careerXp,
    input?.totalXP,
    input?.totalXp,
    input?.globalXp,
    input?.careerXp,
  ];
  return candidates.find((value) => typeof value === 'number' && value > 0) || 0;
}

export function getDirectStreakFromBackup(input = {}, state = {}) {
  const currentCandidates = [
    state.currentStreak,
    state.globalStreak,
    state.dailyStreak,
    state.careerStreak,
    state.activityStreak,
    input?.streakState?.currentStreak,
    input?.streakState?.globalStreak,
    input?.streakState?.dailyStreak,
    input?.currentStreak,
    input?.streak,
  ];
  const longestCandidates = [
    state.longestStreak,
    input?.streakState?.longestStreak,
    input?.longestStreak,
  ];
  return {
    currentStreak: currentCandidates.find((value) => typeof value === 'number' && value > 0) || 0,
    longestStreak: longestCandidates.find((value) => typeof value === 'number' && value > 0) || 0,
  };
}

export function normalizeCareerPersistedValue(rawValue, backupEnvelope = {}) {
  const parsed = safeParse(rawValue, {});
  const state = { ...getPersistedState(parsed) };
  const directXp = getDirectXpFromBackup(backupEnvelope, state);
  const derivedXp = calculateXpFromDailyLogs(state.dailyLogs || backupEnvelope.dailyLogs || {});
  const restoredXp = directXp > 0 ? directXp : Math.max(Number(state.xp || 0), derivedXp);
  const derivedStreak = calculateStreakFromDailyLogs(state.dailyLogs || backupEnvelope.dailyLogs || {});
  const directStreak = getDirectStreakFromBackup(backupEnvelope, state);
  const restoredStreakState = {
    currentStreak: Math.max(directStreak.currentStreak, derivedStreak.currentStreak),
    longestStreak: Math.max(directStreak.longestStreak, derivedStreak.longestStreak),
    completedDays: derivedStreak.completedDays,
  };

  const nextState = {
    ...state,
    xp: restoredXp,
    level: Math.floor(restoredXp / 500) + 1,
    activeDsaXp: 0,
    activeDsaStreak: 0,
    officialDsaStartDate: '2026-08-01',
    restoredStreakState,
  };

  return JSON.stringify({
    ...parsed,
    state: nextState,
  });
}

export function createLegacyCareerStorageValue(backup = {}) {
  const dailyLogs = backup.dailyLogs || backup.activityLogs || backup.activities || {};
  const xp = getDirectXpFromBackup(backup, {}) || calculateXpFromDailyLogs(dailyLogs);
  const directStreak = getDirectStreakFromBackup(backup, {});
  const derivedStreak = calculateStreakFromDailyLogs(dailyLogs);

  return JSON.stringify({
    state: {
      userProfile: backup.userProfile || { name: 'Sanju', startDate: '2026-07-01', totalDays: 180 },
      dailyLogs,
      xp,
      level: Math.floor(xp / 500) + 1,
      activeDsaXp: 0,
      activeDsaStreak: 0,
      officialDsaStartDate: '2026-08-01',
      restoredStreakState: {
        currentStreak: Math.max(directStreak.currentStreak, derivedStreak.currentStreak),
        longestStreak: Math.max(directStreak.longestStreak, derivedStreak.longestStreak),
        completedDays: derivedStreak.completedDays,
      },
    },
    version: 141,
  });
}
