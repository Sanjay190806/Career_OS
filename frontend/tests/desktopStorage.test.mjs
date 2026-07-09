import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  ensureDesktopDataFiles,
  exportProgressBackup,
  getDesktopDataPaths,
  importProgressBackup,
  loadProgressFile,
  saveProgressFile,
  validateProgressPayload,
} from '../../electron/storage.mjs';

async function withTempUserData(fn) {
  const dir = await mkdtemp(path.join(tmpdir(), 'sanzz-desktop-test-'));
  try {
    return await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

test('desktop storage creates data, progress, settings, and backup directories', async () => {
  await withTempUserData(async (userData) => {
    const paths = await ensureDesktopDataFiles(userData);
    assert.equal(existsSync(paths.dataDir), true);
    assert.equal(existsSync(paths.progressFile), true);
    assert.equal(existsSync(paths.settingsFile), true);
    assert.equal(existsSync(paths.backupsDir), true);
  });
});

test('desktop storage saves and loads progress entries', async () => {
  await withTempUserData(async (userData) => {
    await saveProgressFile(userData, {
      entries: {
        '2026-07-01': { skillrackCount: 10, aptitudeCount: 20 },
      },
      selectedDate: '2026-07-01',
    });
    const loaded = await loadProgressFile(userData);
    assert.equal(loaded.ok, true);
    assert.equal(loaded.data.entries['2026-07-01'].skillrackCount, 10);
  });
});

test('desktop storage preserves corrupted progress file and starts with fallback', async () => {
  await withTempUserData(async (userData) => {
    const paths = await ensureDesktopDataFiles(userData);
    await writeFile(paths.progressFile, '{ broken json', 'utf8');
    const loaded = await loadProgressFile(userData);
    assert.equal(loaded.ok, false);
    assert.ok(loaded.corruptedFile.endsWith('.json'));
    assert.equal(existsSync(loaded.corruptedFile), true);
    assert.deepEqual(loaded.data.entries, {});
  });
});

test('desktop backup export writes a backup file', async () => {
  await withTempUserData(async (userData) => {
    await saveProgressFile(userData, { entries: { '2026-07-01': { skillrackCount: 10 } } });
    const backup = await exportProgressBackup(userData);
    assert.equal(backup.ok, true);
    assert.equal(existsSync(backup.backupFile), true);
    const raw = await readFile(backup.backupFile, 'utf8');
    assert.match(raw, /desktop-progress-backup/);
  });
});

test('desktop backup import validates schema before restore', async () => {
  await withTempUserData(async (userData) => {
    const invalid = await importProgressBackup(userData, { entries: { tomorrow: {} } });
    assert.equal(invalid.ok, false);
    const valid = await importProgressBackup(userData, {
      progress: {
        entries: { '2026-07-01': { skillrackCount: 10 } },
      },
    });
    assert.equal(valid.ok, true);
    assert.ok(valid.preRestoreBackup);
  });
});

test('desktop progress validation accepts date keyed entries only', () => {
  assert.equal(validateProgressPayload({ entries: { '2026-07-01': {} } }).valid, true);
  assert.equal(validateProgressPayload({ entries: { '01-07-2026': {} } }).valid, false);
});

test('desktop storage uses the requested Windows data layout names', () => {
  const paths = getDesktopDataPaths('C:/Users/Sanjay/AppData/Roaming/SanzzCareerOS');
  assert.match(paths.progressFile, /sanzz-career-os-data[\\/]progress\.json$/);
  assert.match(paths.settingsFile, /sanzz-career-os-data[\\/]settings\.json$/);
  assert.match(paths.backupsDir, /sanzz-career-os-data[\\/]backups$/);
});

