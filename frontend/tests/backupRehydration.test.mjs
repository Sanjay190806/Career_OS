import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateStreakFromDailyLogs,
  calculateXpFromDailyLogs,
  createLegacyCareerStorageValue,
  normalizeCareerPersistedValue,
} from '../src/utils/backupRehydration.mjs';

const completedLogs = {
  1: {
    counts: { leetcode: 0, skillrack: 5, aptitude: 20, sql: 1, cscore: 1, german: 0, project: 0, resume: 0 },
    status: 'completed',
    completionType: 'minimum',
    xpEarned: 125,
  },
  2: {
    counts: { leetcode: 0, skillrack: 5, aptitude: 20, sql: 1, cscore: 1, german: 0, project: 0, resume: 0 },
    status: 'completed',
    completionType: 'minimum',
    xpEarned: 125,
  },
};

test('normalizes imported direct XP without resetting global XP', () => {
  const raw = JSON.stringify({
    state: {
      xp: 1840,
      level: 1,
      activeDsaXp: 500,
      dailyLogs: {},
      userProfile: { name: 'Sanju', startDate: '2026-07-01', totalDays: 180 },
    },
    version: 141,
  });

  const restored = JSON.parse(normalizeCareerPersistedValue(raw));
  assert.equal(restored.state.xp, 1840);
  assert.equal(restored.state.level, 4);
  assert.equal(restored.state.activeDsaXp, 0);
  assert.equal(restored.state.activeDsaStreak, 0);
});

test('recalculates XP from activity history when direct XP is missing', () => {
  const raw = JSON.stringify({
    state: {
      xp: 0,
      dailyLogs: completedLogs,
      userProfile: { name: 'Sanju', startDate: '2026-07-01', totalDays: 180 },
    },
    version: 141,
  });

  const restored = JSON.parse(normalizeCareerPersistedValue(raw));
  assert.equal(calculateXpFromDailyLogs(completedLogs), 250);
  assert.equal(restored.state.xp, 250);
  assert.notEqual(restored.state.xp, 0);
});

test('recalculates streak from completed daily logs when direct streak is missing', () => {
  const streak = calculateStreakFromDailyLogs(completedLogs);
  assert.equal(streak.currentStreak, 2);
  assert.equal(streak.longestStreak, 2);

  const restored = JSON.parse(normalizeCareerPersistedValue(JSON.stringify({ state: { xp: 0, dailyLogs: completedLogs } })));
  assert.equal(restored.state.restoredStreakState.currentStreak, 2);
  assert.equal(restored.state.restoredStreakState.longestStreak, 2);
});

test('uses direct backup streak when provided and logs are incomplete', () => {
  const raw = JSON.stringify({ state: { xp: 100, dailyLogs: {} } });
  const restored = JSON.parse(normalizeCareerPersistedValue(raw, {
    streakState: { currentStreak: 9, longestStreak: 12 },
  }));

  assert.equal(restored.state.restoredStreakState.currentStreak, 9);
  assert.equal(restored.state.restoredStreakState.longestStreak, 12);
});

test('legacy backup shape becomes current career storage with XP, streak, and DSA reset', () => {
  const legacy = JSON.parse(createLegacyCareerStorageValue({
    totalXP: 900,
    streak: 4,
    dailyLogs: completedLogs,
    userProfile: { name: 'Sanju', startDate: '2026-07-01', totalDays: 180 },
  }));

  assert.equal(legacy.state.xp, 900);
  assert.equal(legacy.state.restoredStreakState.currentStreak, 4);
  assert.equal(legacy.state.activeDsaXp, 0);
  assert.equal(legacy.state.activeDsaStreak, 0);
  assert.deepEqual(legacy.state.dailyLogs, completedLogs);
});
