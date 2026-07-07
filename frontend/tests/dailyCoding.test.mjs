import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dailyCodingSource = readFileSync(join(root, 'src/utils/dailyCodingUtils.ts'), 'utf8');
const storeSource = readFileSync(join(root, 'src/app/store/useCareerStore.ts'), 'utf8');
const panelSource = readFileSync(join(root, 'src/components/today/DailyCodingTargetPanel.tsx'), 'utf8');
const todayPageSource = readFileSync(join(root, 'src/pages/TodayPage.tsx'), 'utf8');
const commandCenterSource = readFileSync(join(root, 'src/components/today/TodayCommandCenter.tsx'), 'utf8');

test('daily coding constants define the official DSA restart and targets', () => {
  assert.match(dailyCodingSource, /OFFICIAL_DSA_START_DATE = '2026-08-01'/);
  assert.match(dailyCodingSource, /codechef_java_daily/);
  assert.match(dailyCodingSource, /skillrack_daily/);
  assert.match(dailyCodingSource, /leetcode_daily/);
  assert.match(dailyCodingSource, /DAILY_CODING_BONUS_XP = 25/);
});

test('LeetCode activation uses exact local date comparison', () => {
  assert.match(dailyCodingSource, /dateKey >= startDateKey/);
  assert.match(dailyCodingSource, /isLeetCodeActive\(dateKey: string\)/);
  assert.match(dailyCodingSource, /toLocalDateKey\(date: Date\)/);
});

test('store awards daily coding XP once per task and bonus once', () => {
  assert.match(storeSource, /updateDailyCodingTask/);
  assert.match(storeSource, /!dailyCoding\.tasks\[taskId\]\.xpAwarded/);
  assert.match(storeSource, /dailyCoding\.tasks\[taskId\]\.xpAwarded = true/);
  assert.match(storeSource, /!dailyCoding\.dailyCodingBonusAwarded/);
  assert.match(storeSource, /dailyCoding\.dailyCodingBonusAwarded = true/);
});

test('Command Center and Activity Logger share the same daily coding panel', () => {
  assert.match(commandCenterSource, /<DailyCodingTargetPanel compact \/>/);
  assert.match(todayPageSource, /<DailyCodingTargetPanel \/>/);
  assert.match(panelSource, /updateDailyCodingTask\(selectedDay, taskId/);
});

test('panel labels show pre-start LeetCode scheduling and official daily tasks', () => {
  assert.match(panelSource, /CodeChef Java \+ SkillRack/);
  assert.match(panelSource, /Starts Aug 1, 2026/);
  assert.match(panelSource, /Target: \{task\.target\}/);
});

