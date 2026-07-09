export const OFFICIAL_DSA_START_DATE = '2026-08-01';
export const DAILY_CODING_BONUS_XP = 25;

export const DAILY_CODING_TASKS = {
  codechef_java_daily: {
    id: 'codechef_java_daily',
    label: 'CodeChef Java',
    target: 5,
    xp: 50,
    activeBeforeDsaStart: true,
  },
  skillrack_daily: {
    id: 'skillrack_daily',
    label: 'SkillRack',
    target: 5,
    xp: 50,
    activeBeforeDsaStart: true,
  },
  leetcode_daily: {
    id: 'leetcode_daily',
    label: 'LeetCode',
    target: 1,
    xp: 50,
    startsAt: OFFICIAL_DSA_START_DATE,
    activeBeforeDsaStart: false,
  },
};

export const ACTIVE_PRE_START_TASK_IDS = ['codechef_java_daily', 'skillrack_daily'];
export const LEGACY_DSA_TASK_IDS = ['dsa_daily', 'leetcode_daily', 'daily_dsa', 'skillrack_dsa', 'leetcode', 'dsa'];

export function isOnOrAfter(dateKey, startDate = OFFICIAL_DSA_START_DATE) {
  return String(dateKey || '') >= startDate;
}

export function clampCount(value, target = 5) {
  const numeric = Number.isFinite(Number(value)) ? Number(value) : 0;
  return Math.max(0, Math.min(target, Math.trunc(numeric)));
}

export function isLeetCodeActive(dateKey) {
  return isOnOrAfter(dateKey, OFFICIAL_DSA_START_DATE);
}

export function isOfficialDsaStreakActive(dateKey) {
  return isOnOrAfter(dateKey, OFFICIAL_DSA_START_DATE);
}

export function createDailyCodingTask(taskId, existing = {}, dateKey = '') {
  const config = DAILY_CODING_TASKS[taskId];
  if (!config) return null;

  const active = taskId === 'leetcode_daily' ? isLeetCodeActive(dateKey) : true;
  const count = clampCount(existing.count, config.target);
  const completed = Boolean(existing.completed) || count >= config.target;

  return {
    id: taskId,
    label: config.label,
    target: config.target,
    count: completed ? Math.max(count, config.target) : count,
    completed,
    xpAwarded: Boolean(existing.xpAwarded),
    xp: config.xp,
    active,
    startsAt: config.startsAt,
  };
}

export function createDailyCodingState(dateKey, existing = {}) {
  const tasks = {
    codechef_java_daily: createDailyCodingTask('codechef_java_daily', existing.tasks?.codechef_java_daily, dateKey),
    skillrack_daily: createDailyCodingTask('skillrack_daily', existing.tasks?.skillrack_daily, dateKey),
    leetcode_daily: createDailyCodingTask('leetcode_daily', existing.tasks?.leetcode_daily, dateKey),
  };

  return {
    date: dateKey,
    tasks,
    dailyCodingBonusAwarded: Boolean(existing.dailyCodingBonusAwarded),
    dailyCodingBonusXp: DAILY_CODING_BONUS_XP,
    officialDsaStartDate: OFFICIAL_DSA_START_DATE,
    officialDsaStreakActive: isOfficialDsaStreakActive(dateKey),
    migratedFromLegacy: Boolean(existing.migratedFromLegacy),
  };
}

export function getActiveCodingTaskIds(dateKey) {
  return isLeetCodeActive(dateKey)
    ? ['codechef_java_daily', 'skillrack_daily', 'leetcode_daily']
    : ACTIVE_PRE_START_TASK_IDS;
}

export function isDailyCodingComplete(state, dateKey = state?.date) {
  const ids = getActiveCodingTaskIds(dateKey);
  return ids.every((taskId) => Boolean(state?.tasks?.[taskId]?.completed));
}

export function getAwardKey(dateKey, taskId) {
  return `xp_awarded_${dateKey}_${taskId}`;
}

export function awardXpOnce(awards = {}, dateKey, taskId, amount) {
  const key = getAwardKey(dateKey, taskId);
  if (awards[key]) {
    return { awards, xpDelta: 0, awarded: false, key };
  }

  return {
    awards: { ...awards, [key]: true },
    xpDelta: amount,
    awarded: true,
    key,
  };
}

export function updateDailyCodingTask(state, taskId, patch = {}) {
  const task = state?.tasks?.[taskId];
  if (!task) return state;

  const explicitCompleted = typeof patch.completed === 'boolean' ? patch.completed : undefined;
  const rawCount = typeof patch.count === 'number' ? patch.count : task.count;
  const count = clampCount(rawCount, task.target);
  const completedFromCount = count >= task.target;
  const nextCompleted = task.completed || explicitCompleted === true || completedFromCount;

  return {
    ...state,
    tasks: {
      ...state.tasks,
      [taskId]: {
        ...task,
        ...patch,
        count: nextCompleted ? Math.max(count, task.target) : count,
        completed: nextCompleted,
      },
    },
  };
}

export function applyDailyCodingAwards(state, awards = {}) {
  let nextAwards = awards;
  let xpDelta = 0;
  let nextState = state;

  for (const taskId of ['codechef_java_daily', 'skillrack_daily']) {
    const task = nextState.tasks?.[taskId];
    if (!task?.completed) continue;

    const result = awardXpOnce(nextAwards, nextState.date, taskId, task.xp);
    nextAwards = result.awards;
    xpDelta += result.xpDelta;

    if (result.awarded) {
      nextState = {
        ...nextState,
        tasks: {
          ...nextState.tasks,
          [taskId]: { ...task, xpAwarded: true },
        },
      };
    }
  }

  if (isDailyCodingComplete(nextState, nextState.date)) {
    const result = awardXpOnce(nextAwards, nextState.date, 'daily_coding_bonus', DAILY_CODING_BONUS_XP);
    nextAwards = result.awards;
    xpDelta += result.xpDelta;

    if (result.awarded) {
      nextState = { ...nextState, dailyCodingBonusAwarded: true };
    }
  }

  return { state: nextState, awards: nextAwards, xpDelta };
}

export function migrateDailyCodingState(state = {}) {
  const dailyCodingByDate = { ...(state.dailyCodingByDate || {}) };
  const dailyLogs = state.dailyLogs || {};

  for (const [day, log] of Object.entries(dailyLogs)) {
    const dateKey = log?.dateKey || log?.date || '';
    const resolvedDateKey = /^\d{4}-\d{2}-\d{2}$/.test(dateKey) ? dateKey : null;
    if (!resolvedDateKey) continue;

    const existing = dailyCodingByDate[resolvedDateKey] || {};
    const next = createDailyCodingState(resolvedDateKey, existing);
    const counts = log?.counts || {};
    next.tasks.skillrack_daily.count = clampCount(counts.skillrack, 5);
    next.tasks.skillrack_daily.completed = next.tasks.skillrack_daily.completed || next.tasks.skillrack_daily.count >= 5;
    next.tasks.leetcode_daily.count = clampCount(counts.leetcode || log?.lcStatus?.length || 0, 1);
    next.tasks.leetcode_daily.completed = next.tasks.leetcode_daily.completed || next.tasks.leetcode_daily.count >= 1;
    next.migratedFromLegacy = true;
    dailyCodingByDate[resolvedDateKey] = next;
  }

  return {
    ...state,
    officialDsaStartDate: OFFICIAL_DSA_START_DATE,
    activeDsaXp: 0,
    activeDsaStreak: 0,
    dailyCodingByDate,
    dailyCodingXpAwards: state.dailyCodingXpAwards || {},
    dsaResetMigrationApplied: true,
  };
}
