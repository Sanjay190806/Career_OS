import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const registrySource = readFileSync(join(root, 'src/services/backup/backupRegistry.ts'), 'utf8');
const panelSource = readFileSync(join(root, 'src/components/sync/BackupRestorePanel.tsx'), 'utf8');

test('backup export includes XP, streak, daily logs, and dashboard summary fields', () => {
  for (const field of ['xpState', 'streakState', 'dailyTaskState', 'activityLogs', 'completedTasks', 'dailyLogs', 'careerProgress', 'skillProgress', 'projectProgress', 'dashboardStats']) {
    assert.match(registrySource, new RegExp(`${field}\\??:`), `missing backup summary field: ${field}`);
  }
});

test('restore normalizes career XP without resetting imported global XP to zero', () => {
  assert.match(registrySource, /normalizeCareerStateForRestore/);
  assert.match(registrySource, /existingXp > 0 \? existingXp/);
  assert.match(registrySource, /sumImportedLogXp/);
  assert.match(registrySource, /state\.xp = restoredXp/);
});

test('restore recalculates missing XP from imported activity history', () => {
  assert.match(registrySource, /log\?\.xpEarned/);
  assert.match(registrySource, /awardXPForLog\(day, log\)/);
});

test('restore recalculates streak summary from imported daily logs', () => {
  assert.match(registrySource, /getStreak\(\{/);
  assert.match(registrySource, /currentStreak/);
});

test('restore rehydrates live Zustand career state after writing localStorage', () => {
  assert.match(registrySource, /rehydrateAppStateFromStorage/);
  assert.match(registrySource, /useCareerStore\.setState/);
  assert.match(registrySource, /persistApi\.rehydrate/);
  assert.match(registrySource, /dashboard_state_synced/);
});

test('backup import UI updates immediately without forced reload', () => {
  assert.match(panelSource, /Dashboard updated immediately/);
  assert.doesNotMatch(panelSource, /window\.location\.reload/);
});

