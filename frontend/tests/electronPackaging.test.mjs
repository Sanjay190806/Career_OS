import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const mainSource = readFileSync(join(root, 'electron/main.cjs'), 'utf8');
const preloadSource = readFileSync(join(root, 'electron/preload.cjs'), 'utf8');
const forgeSource = readFileSync(join(root, 'forge.config.cjs'), 'utf8');

test('Electron preload exposes the expected safe desktop API shape', () => {
  for (const method of ['getAppInfo', 'loadProgress', 'saveProgress', 'exportBackup', 'importBackup', 'getStorageLocation', 'openBackupFolder', 'validateBackup']) {
    assert.match(preloadSource, new RegExp(`${method}:`));
  }
  assert.match(preloadSource, /contextBridge\.exposeInMainWorld\('sanzzOS'/);
});

test('Electron BrowserWindow uses secure renderer defaults', () => {
  assert.match(mainSource, /nodeIntegration:\s*false/);
  assert.match(mainSource, /contextIsolation:\s*true/);
  assert.match(mainSource, /webSecurity:\s*true/);
  assert.doesNotMatch(mainSource, /enableRemoteModule:\s*true/);
});

test('desktop scripts do not require backend or PostgreSQL for desktop package flow', () => {
  assert.equal(packageJson.scripts['desktop:build'], 'npm run build:frontend');
  assert.match(packageJson.scripts['desktop:package'], /electron-forge package/);
  assert.match(packageJson.scripts['desktop:make'], /electron-forge make/);
  assert.doesNotMatch(packageJson.scripts['desktop:package'], /backend|prisma|db:/i);
  assert.doesNotMatch(packageJson.scripts['desktop:make'], /backend|prisma|db:/i);
});

test('Forge config targets Squirrel Windows installer output', () => {
  assert.match(forgeSource, /@electron-forge\/maker-squirrel/);
  assert.match(forgeSource, /Sanzz Career OS Setup\.exe/);
  assert.match(forgeSource, /SanzzCareerOS/);
});

test('root package metadata identifies v1.9.0 desktop release', () => {
  assert.equal(packageJson.version, '1.9.0');
  assert.equal(packageJson.productName, 'Sanzz Career OS');
  assert.equal(packageJson.main, 'electron/main.cjs');
});

