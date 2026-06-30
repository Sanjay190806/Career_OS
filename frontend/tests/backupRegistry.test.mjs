import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const registrySource = readFileSync(join(root, 'src/services/backup/backupRegistry.ts'), 'utf8');
const swSource = readFileSync(join(root, 'public/sw.js'), 'utf8');
const rootPkg = JSON.parse(readFileSync(join(root, '..', 'package.json'), 'utf8'));
const manifest = JSON.parse(readFileSync(join(root, 'public/manifest.webmanifest'), 'utf8'));

test('backup registry includes core module keys', () => {
  const required = [
    'sanju-career-os-persist',
    'sanzz_os_learning_os_v1',
    'sanzz_os_smart_planner_v1',
    'sanzz_os_placement_os_v1',
    'sanzz_os_ai_brain_v1',
    'sanju-interview-coach-v1',
  ];
  for (const key of required) {
    assert.match(registrySource, new RegExp(`'${key}'`), `missing ${key}`);
  }
});

test('backup schema version is 2', () => {
  assert.match(registrySource, /BACKUP_SCHEMA_VERSION = 2/);
});

test('service worker skips API caching', () => {
  assert.match(swSource, /\/api\//);
  assert.doesNotMatch(swSource, /cache\.put\(event\.request.*api/s);
});

test('root build script exists', () => {
  assert.equal(rootPkg.scripts.build, 'npm run build:all');
});

test('manifest is canonical webmanifest with png icons', () => {
  assert.equal(manifest.short_name, 'Career OS');
  assert.ok(manifest.icons.some((icon) => icon.src.endsWith('.png')));
});

test('cloud sync health route exists in backend routes', () => {
  const routes = readFileSync(join(root, '..', 'backend/src/routes/sync.routes.ts'), 'utf8');
  assert.match(routes, /\/sync\/health/);
  assert.match(routes, /\/sync\/push/);
  assert.match(routes, /\/sync\/pull/);
});
