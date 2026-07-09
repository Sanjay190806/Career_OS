import test from 'node:test';
import assert from 'node:assert/strict';
import {
  NEW_PROGRESS_KEY,
  RECOVERY_BACKUP_PREFIX,
  RECOVERY_METADATA_KEY,
  backupProgressRecoveryData,
  getIndiaDateKey,
  inspectProgressStorage,
  normalizeDateKey,
  recoverOldProgress,
} from '../src/utils/progressRecovery.mjs';
import { calculateXP, isSuccessfulStreakDay } from '../src/utils/placementDisciplineEngine.mjs';

class MemoryStorage {
  constructor(initial = {}) {
    this.map = new Map(Object.entries(initial));
  }
  get length() {
    return this.map.size;
  }
  key(index) {
    return Array.from(this.map.keys())[index] || null;
  }
  getItem(key) {
    return this.map.has(key) ? this.map.get(key) : null;
  }
  setItem(key, value) {
    this.map.set(key, String(value));
  }
  removeItem(key) {
    this.map.delete(key);
  }
  clear() {
    this.map.clear();
  }
}

const legacyLog = {
  counts: {
    leetcode: 2,
    skillrack: 10,
    aptitude: 25,
    sql: 1,
    cscore: 1,
    german: 15,
    project: 1,
    resume: 1,
    mockTechnical: 1,
  },
  lcStatus: [0, 1],
  note: 'Recovered old progress',
  mood: 4,
  energy: 8,
  distractions: 1,
  focusMinutes: 45,
  status: 'completed',
  savedAt: '2026-07-01T08:00:00.000Z',
  xpEarned: 100,
};

function legacyCareerStore() {
  return JSON.stringify({
    state: {
      userProfile: { startDate: '2026-07-01' },
      dailyLogs: {
        1: legacyLog,
      },
    },
    version: 141,
  });
}

test('detects old localStorage key migration candidates', () => {
  const localStorage = new MemoryStorage({ 'sanju-career-os-persist': legacyCareerStore() });
  const inspection = inspectProgressStorage({ localStorage, sessionStorage: new MemoryStorage() });
  assert.equal(inspection.oldDataFound, true);
  assert.equal(inspection.oldEntriesCount, 1);
  assert.equal(inspection.newDataFound, false);
  assert.equal(inspection.detectedOldSources[0].sourceKey, 'sanju-career-os-persist');
});

test('migrates existing old storage when new storage is empty', () => {
  const localStorage = new MemoryStorage({ 'sanju-career-os-persist': legacyCareerStore() });
  const result = recoverOldProgress({ localStorage, sessionStorage: new MemoryStorage() });
  assert.equal(result.ok, true);
  assert.equal(result.message, 'Previous progress found and restored.');
  const migrated = JSON.parse(localStorage.getItem(NEW_PROGRESS_KEY));
  assert.equal(migrated.state.entries['2026-07-01'].skillrackCount, 10);
});

test('does not overwrite when both old and new storage exist', () => {
  const existing = {
    state: {
      entries: {
        '2026-07-01': { skillrackCount: 1, aptitudeCount: 1 },
      },
    },
    version: 1,
  };
  const localStorage = new MemoryStorage({
    'sanju-career-os-persist': legacyCareerStore(),
    [NEW_PROGRESS_KEY]: JSON.stringify(existing),
  });
  const result = recoverOldProgress({ localStorage, sessionStorage: new MemoryStorage() });
  assert.equal(result.ok, false);
  assert.match(result.message, /Nothing was overwritten/);
  const after = JSON.parse(localStorage.getItem(NEW_PROGRESS_KEY));
  assert.equal(after.state.entries['2026-07-01'].skillrackCount, 1);
});

test('normalizes date formats during migration', () => {
  assert.equal(normalizeDateKey('01-07-2026'), '2026-07-01');
  assert.equal(normalizeDateKey('2026-07-01T18:30:00.000Z'), '2026-07-02');
  assert.equal(normalizeDateKey(1, '2026-07-01'), '2026-07-01');
});

test('uses Asia/Kolkata for today date handling', () => {
  assert.equal(getIndiaDateKey(new Date('2026-06-30T20:00:00.000Z')), '2026-07-01');
});

test('handles UTC previous-day mismatch by converting to India date', () => {
  assert.equal(normalizeDateKey('2026-06-30T20:00:00.000Z'), '2026-07-01');
});

test('creates backup before migration', () => {
  const localStorage = new MemoryStorage({ 'sanju-career-os-persist': legacyCareerStore() });
  recoverOldProgress({ localStorage, sessionStorage: new MemoryStorage() });
  const backupKey = Array.from(localStorage.map.keys()).find((key) => key.startsWith(RECOVERY_BACKUP_PREFIX));
  assert.ok(backupKey);
  assert.ok(localStorage.getItem(backupKey).includes('before-progress-recovery'));
});

test('manual backup captures old and new progress keys', () => {
  const localStorage = new MemoryStorage({
    'sanju-career-os-persist': legacyCareerStore(),
    [NEW_PROGRESS_KEY]: JSON.stringify({ state: { entries: {} }, version: 1 }),
  });
  const backup = backupProgressRecoveryData({ localStorage, sessionStorage: new MemoryStorage() });
  assert.ok(backup.key.startsWith(RECOVERY_BACKUP_PREFIX));
  assert.ok(backup.payload.data['sanju-career-os-persist']);
  assert.ok(backup.payload.data[NEW_PROGRESS_KEY]);
});

test('today progress appears after migration', () => {
  const localStorage = new MemoryStorage({ 'sanju-career-os-persist': legacyCareerStore() });
  recoverOldProgress({ localStorage, sessionStorage: new MemoryStorage() });
  const migrated = JSON.parse(localStorage.getItem(NEW_PROGRESS_KEY));
  const today = migrated.state.entries['2026-07-01'];
  assert.equal(today.mistakeNotes, 'Recovered old progress');
  assert.equal(today.germanMinutes, 15);
});

test('existing XP and streak rules still work after recovery', () => {
  const localStorage = new MemoryStorage({ 'sanju-career-os-persist': legacyCareerStore() });
  recoverOldProgress({ localStorage, sessionStorage: new MemoryStorage() });
  const migrated = JSON.parse(localStorage.getItem(NEW_PROGRESS_KEY));
  const entry = migrated.state.entries['2026-07-01'];
  assert.ok(calculateXP(entry) > 0);
  assert.equal(isSuccessfulStreakDay(entry), true);
});

test('migration metadata records source and target keys', () => {
  const localStorage = new MemoryStorage({ 'sanju-career-os-persist': legacyCareerStore() });
  recoverOldProgress({ localStorage, sessionStorage: new MemoryStorage() });
  const metadata = JSON.parse(localStorage.getItem(RECOVERY_METADATA_KEY));
  assert.equal(metadata.sourceKey, 'sanju-career-os-persist');
  assert.equal(metadata.targetKey, NEW_PROGRESS_KEY);
  assert.ok(metadata.migratedAt);
});

