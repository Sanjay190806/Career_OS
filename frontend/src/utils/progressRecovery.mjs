import { createEmptyEntry, toISODate } from './placementDisciplineEngine.mjs';

export const NEW_PROGRESS_KEY = 'sanzz-placement-discipline-v18';
export const RECOVERY_METADATA_KEY = 'sanzz-placement-discipline-v18-recovery-metadata';
export const RECOVERY_BACKUP_PREFIX = 'sanzz-placement-discipline-v18-recovery-backup';

export const OLD_PROGRESS_KEYS = [
  'sanju-career-os-persist',
  'sanju-career-os-v1',
  'sanju-placement-v3',
  'placement_streak_tracker_v1_sanjay',
];

function safeParse(raw) {
  if (!raw || typeof raw !== 'string') return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getPersistedState(parsed) {
  if (!parsed || typeof parsed !== 'object') return null;
  if (parsed.state && typeof parsed.state === 'object') return parsed.state;
  return parsed;
}

function readRaw(storage, key) {
  try {
    return storage?.getItem?.(key) ?? null;
  } catch {
    return null;
  }
}

function setRaw(storage, key, value) {
  storage?.setItem?.(key, value);
}

function storageKeys(storage) {
  if (!storage) return [];
  const keys = [];
  try {
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (key) keys.push(key);
    }
  } catch {
    return [];
  }
  return keys.sort();
}

export function getIndiaDateKey(date = new Date()) {
  return toISODate(date);
}

export function normalizeDateKey(value, startDateKey = '2026-07-01') {
  if (typeof value === 'number' || /^\d+$/.test(String(value || ''))) {
    const day = Math.max(1, Number(value));
    const start = new Date(`${startDateKey}T00:00:00+05:30`);
    start.setDate(start.getDate() + day - 1);
    return getIndiaDateKey(start);
  }

  const raw = String(value || '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  const ddmmyyyy = raw.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (ddmmyyyy) return `${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}`;

  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) return getIndiaDateKey(parsed);

  return '';
}

function numberFrom(value) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function moodFromLegacy(value) {
  if (typeof value === 'string') return value;
  const numeric = Number(value || 0);
  if (numeric >= 5) return 'Locked in';
  if (numeric >= 4) return 'Focused';
  if (numeric >= 3) return 'Steady';
  if (numeric >= 2) return 'Low';
  return 'Rough';
}

export function legacyDailyLogToPlacementEntry(log) {
  const counts = log?.counts || {};
  const leetcodeTotal = numberFrom(counts.leetcode || log?.lcStatus?.length || 0);
  const mockCount =
    numberFrom(counts.mockTechnical) +
    numberFrom(counts.mockHR) +
    numberFrom(counts.mockCoding) +
    numberFrom(counts.mockProject);
  const entry = createEmptyEntry();

  return {
    ...entry,
    skillrackCount: numberFrom(counts.skillrack),
    leetcodeEasy: leetcodeTotal,
    aptitudeCount: numberFrom(counts.aptitude),
    sqlDone: numberFrom(counts.sql) > 0,
    sqlNotes: typeof log?.note === 'string' && numberFrom(counts.sql) > 0 ? log.note : '',
    coreSubject: 'OOPS',
    coreConcept: '',
    coreConceptDone: numberFrom(counts.cscore) > 0,
    germanMinutes: numberFrom(counts.german),
    resumeUpdated: numberFrom(counts.resume) > 0,
    githubUpdated: false,
    linkedinUpdated: false,
    companyPrepDone: numberFrom(counts.project) > 0,
    companyPrepNotes: typeof log?.note === 'string' ? log.note : '',
    mockInterviewDone: mockCount > 0,
    interviewQuestionReviewed: false,
    mistakeNoteAdded: Boolean(log?.note),
    mistakeNotes: typeof log?.note === 'string' ? log.note : '',
    energyLevel: Math.min(10, Math.max(1, numberFrom(log?.energy) || 6)),
    mood: moodFromLegacy(log?.mood),
    biggestDistraction: log?.distractions ? `${log.distractions} distraction(s) logged` : '',
    savedAt: typeof log?.savedAt === 'string' ? log.savedAt : '',
  };
}

function extractEntriesFromState(state, sourceKey) {
  const entries = {};
  const startDate = state?.userProfile?.startDate || '2026-07-01';

  if (state?.dailyLogs && typeof state.dailyLogs === 'object') {
    for (const [legacyKey, log] of Object.entries(state.dailyLogs)) {
      const dateKey = normalizeDateKey(legacyKey, startDate);
      if (!dateKey || !log || typeof log !== 'object') continue;
      entries[dateKey] = legacyDailyLogToPlacementEntry(log);
    }
  }

  if (state?.entries && typeof state.entries === 'object') {
    for (const [legacyKey, entry] of Object.entries(state.entries)) {
      const dateKey = normalizeDateKey(legacyKey, startDate);
      if (!dateKey || !entry || typeof entry !== 'object') continue;
      entries[dateKey] = { ...createEmptyEntry(), ...entry };
    }
  }

  return {
    sourceKey,
    entries,
    count: Object.keys(entries).length,
    latestSavedDate: Object.keys(entries).sort().slice(-1)[0] || '',
  };
}

export function readNewProgress(storage = globalThis.localStorage) {
  const raw = readRaw(storage, NEW_PROGRESS_KEY);
  const parsed = safeParse(raw);
  const state = getPersistedState(parsed);
  const entries = state?.entries && typeof state.entries === 'object' ? state.entries : {};
  return {
    raw,
    state,
    entries,
    count: Object.keys(entries).length,
    latestSavedDate: Object.keys(entries).sort().slice(-1)[0] || '',
  };
}

export function inspectProgressStorage(options = {}) {
  const local = options.localStorage || globalThis.localStorage;
  const session = options.sessionStorage || globalThis.sessionStorage;
  const detectedOldSources = [];

  for (const key of OLD_PROGRESS_KEYS) {
    const raw = readRaw(local, key);
    const parsed = safeParse(raw);
    const state = getPersistedState(parsed);
    const source = extractEntriesFromState(state, key);
    if (raw !== null || source.count > 0) {
      detectedOldSources.push({
        ...source,
        exists: raw !== null,
        rawBytes: raw?.length || 0,
      });
    }
  }

  const newProgress = readNewProgress(local);
  const oldEntriesCount = detectedOldSources.reduce((sum, source) => sum + source.count, 0);
  const latestSavedDate = [...detectedOldSources.map((source) => source.latestSavedDate), newProgress.latestSavedDate]
    .filter(Boolean)
    .sort()
    .slice(-1)[0] || '';

  return {
    detectedLocalStorageKeys: storageKeys(local),
    detectedSessionStorageKeys: storageKeys(session),
    detectedOldSources,
    oldDataFound: oldEntriesCount > 0,
    oldEntriesCount,
    newDataFound: newProgress.count > 0,
    newEntriesCount: newProgress.count,
    todayDate: getIndiaDateKey(options.now || new Date()),
    latestSavedDate,
    targetKey: NEW_PROGRESS_KEY,
    metadata: getRecoveryMetadata(local),
  };
}

export function getRecoveryMetadata(storage = globalThis.localStorage) {
  const parsed = safeParse(readRaw(storage, RECOVERY_METADATA_KEY));
  return parsed && typeof parsed === 'object' ? parsed : null;
}

function createBackupPayload(local, inspection, reason) {
  const keys = [NEW_PROGRESS_KEY, RECOVERY_METADATA_KEY, ...OLD_PROGRESS_KEYS];
  const data = {};
  for (const key of keys) {
    const value = readRaw(local, key);
    if (value !== null) data[key] = value;
  }
  return {
    app: 'Sanzz Career OS',
    feature: 'v1.8.0-data-recovery-hotfix',
    reason,
    createdAt: new Date().toISOString(),
    targetKey: NEW_PROGRESS_KEY,
    todayDate: inspection.todayDate,
    data,
  };
}

export function backupProgressRecoveryData(options = {}) {
  const local = options.localStorage || globalThis.localStorage;
  const inspection = inspectProgressStorage(options);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const key = `${RECOVERY_BACKUP_PREFIX}-${timestamp}`;
  const payload = createBackupPayload(local, inspection, options.reason || 'manual');
  setRaw(local, key, JSON.stringify(payload));
  return { key, payload };
}

export function recoverOldProgress(options = {}) {
  const local = options.localStorage || globalThis.localStorage;
  const inspection = inspectProgressStorage(options);
  const backup = backupProgressRecoveryData({ ...options, reason: 'before-progress-recovery' });
  const newProgress = readNewProgress(local);
  const existingEntries = newProgress.entries || {};

  const candidates = inspection.detectedOldSources.filter((source) => source.count > 0);
  if (candidates.length === 0) {
    return {
      ok: false,
      message: 'No old progress data was found to recover.',
      backupKey: backup.key,
      migratedCount: 0,
      skippedCount: 0,
      metadata: null,
    };
  }

  if (Object.keys(existingEntries).length > 0 && !options.allowMergeMissingDates) {
    const metadata = {
      migratedFrom: candidates.map((source) => source.sourceKey),
      migratedAt: new Date().toISOString(),
      sourceKey: candidates[0].sourceKey,
      targetKey: NEW_PROGRESS_KEY,
      backupKey: backup.key,
      status: 'skipped-new-data-exists',
      migratedCount: 0,
      skippedCount: candidates.reduce((sum, source) => sum + source.count, 0),
    };
    setRaw(local, RECOVERY_METADATA_KEY, JSON.stringify(metadata));
    return {
      ok: false,
      message: 'Old progress was found, but v1.8 already has data. Nothing was overwritten.',
      backupKey: backup.key,
      migratedCount: 0,
      skippedCount: metadata.skippedCount,
      metadata,
    };
  }

  const mergedEntries = { ...existingEntries };
  let migratedCount = 0;
  let skippedCount = 0;

  for (const source of candidates) {
    for (const [dateKey, entry] of Object.entries(source.entries)) {
      if (mergedEntries[dateKey]) {
        skippedCount += 1;
        continue;
      }
      mergedEntries[dateKey] = entry;
      migratedCount += 1;
    }
  }

  const nextState = {
    state: {
      ...(newProgress.state || {}),
      entries: mergedEntries,
      selectedDate: inspection.todayDate,
      lastBackupAt: backup.payload.createdAt,
    },
    version: 1,
  };
  setRaw(local, NEW_PROGRESS_KEY, JSON.stringify(nextState));

  const metadata = {
    migratedFrom: candidates.map((source) => source.sourceKey),
    migratedAt: new Date().toISOString(),
    sourceKey: candidates[0].sourceKey,
    targetKey: NEW_PROGRESS_KEY,
    backupKey: backup.key,
    status: migratedCount > 0 ? 'migrated' : 'nothing-to-migrate',
    migratedCount,
    skippedCount,
  };
  setRaw(local, RECOVERY_METADATA_KEY, JSON.stringify(metadata));

  return {
    ok: migratedCount > 0,
    message: migratedCount > 0 ? 'Previous progress found and restored.' : 'No missing old progress entries needed recovery.',
    backupKey: backup.key,
    migratedCount,
    skippedCount,
    metadata,
  };
}

export function exportRawRecoveryData(options = {}) {
  const local = options.localStorage || globalThis.localStorage;
  const inspection = inspectProgressStorage(options);
  return createBackupPayload(local, inspection, 'raw-recovery-export');
}
