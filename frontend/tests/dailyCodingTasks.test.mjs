import test from 'node:test';
import assert from 'node:assert/strict';
import {
  OFFICIAL_DSA_START_DATE,
  applyDailyCodingAwards,
  createDailyCodingState,
  getActiveCodingTaskIds,
  isDailyCodingComplete,
  isLeetCodeActive,
  isOfficialDsaStreakActive,
  migrateDailyCodingState,
  updateDailyCodingTask,
} from '../src/utils/dailyCodingTasks.mjs';

test('DSA reset migration sets active DSA XP to zero and preserves unrelated progress', () => {
  const migrated = migrateDailyCodingState({
    xp: 999,
    sqlProgress: { joins: { completed: true } },
    aptitudeProgress: { percentages: { questionsSolved: 25 } },
    dailyLogs: {},
  });

  assert.equal(migrated.officialDsaStartDate, OFFICIAL_DSA_START_DATE);
  assert.equal(migrated.activeDsaXp, 0);
  assert.equal(migrated.activeDsaStreak, 0);
  assert.equal(migrated.xp, 999);
  assert.deepEqual(migrated.sqlProgress, { joins: { completed: true } });
  assert.deepEqual(migrated.aptitudeProgress, { percentages: { questionsSolved: 25 } });
});

test('LeetCode is inactive before August 1 and does not gate daily coding completion', () => {
  const state = createDailyCodingState('2026-07-31');
  assert.equal(isLeetCodeActive('2026-07-31'), false);
  assert.equal(state.tasks.leetcode_daily.active, false);
  assert.deepEqual(getActiveCodingTaskIds('2026-07-31'), ['codechef_java_daily', 'skillrack_daily']);

  const codechefDone = updateDailyCodingTask(state, 'codechef_java_daily', { count: 5 });
  const bothDone = updateDailyCodingTask(codechefDone, 'skillrack_daily', { count: 5 });
  assert.equal(isDailyCodingComplete(bothDone, '2026-07-31'), true);
});

test('LeetCode and official DSA streak become active on August 1', () => {
  const state = createDailyCodingState('2026-08-01');
  assert.equal(isLeetCodeActive('2026-08-01'), true);
  assert.equal(isOfficialDsaStreakActive('2026-08-01'), true);
  assert.equal(state.tasks.leetcode_daily.active, true);
  assert.deepEqual(getActiveCodingTaskIds('2026-08-01'), ['codechef_java_daily', 'skillrack_daily', 'leetcode_daily']);
});

test('CodeChef completion clamps at five and awards XP once', () => {
  const state = createDailyCodingState('2026-07-09');
  const four = updateDailyCodingTask(state, 'codechef_java_daily', { count: 4 });
  assert.equal(four.tasks.codechef_java_daily.completed, false);

  const five = updateDailyCodingTask(four, 'codechef_java_daily', { count: 5 });
  assert.equal(five.tasks.codechef_java_daily.count, 5);
  assert.equal(five.tasks.codechef_java_daily.completed, true);

  const first = applyDailyCodingAwards(five, {});
  assert.equal(first.xpDelta, 50);
  const second = applyDailyCodingAwards(first.state, first.awards);
  assert.equal(second.xpDelta, 0);
});

test('SkillRack completion awards once and full daily bonus is idempotent', () => {
  let state = createDailyCodingState('2026-07-09');
  state = updateDailyCodingTask(state, 'codechef_java_daily', { completed: true });
  let first = applyDailyCodingAwards(state, {});
  assert.equal(first.xpDelta, 50);
  assert.equal(first.state.dailyCodingBonusAwarded, false);

  state = updateDailyCodingTask(first.state, 'skillrack_daily', { count: 5 });
  const second = applyDailyCodingAwards(state, first.awards);
  assert.equal(second.xpDelta, 75);
  assert.equal(second.state.tasks.skillrack_daily.completed, true);
  assert.equal(second.state.dailyCodingBonusAwarded, true);

  const repeat = applyDailyCodingAwards(second.state, second.awards);
  assert.equal(repeat.xpDelta, 0);
});

test('migration is idempotent and does not duplicate task or XP award records', () => {
  const once = migrateDailyCodingState({
    dailyCodingXpAwards: { 'xp_awarded_2026-07-09_codechef_java_daily': true },
    dailyCodingByDate: {
      '2026-07-09': createDailyCodingState('2026-07-09'),
    },
  });
  const twice = migrateDailyCodingState(once);

  assert.deepEqual(Object.keys(twice.dailyCodingByDate), ['2026-07-09']);
  assert.deepEqual(twice.dailyCodingXpAwards, { 'xp_awarded_2026-07-09_codechef_java_daily': true });
  assert.equal(twice.activeDsaXp, 0);
});
