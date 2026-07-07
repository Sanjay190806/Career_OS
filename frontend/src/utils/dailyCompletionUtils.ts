import { DailyLog } from '../types';
import { getDailyCodingCompletion, normalizeDailyCodingState, toLocalDateKey } from './dailyCodingUtils';

export interface CompletionChecklist {
  dsa: boolean;
  aptitude: boolean;
  sqlOrCs: boolean;
}

export interface PerfectChecklist {
  leetcode: boolean;
  skillrack: boolean;
  aptitude: boolean;
  sql: boolean;
  csCore: boolean;
}

export function getMinimumChecklist(log: DailyLog | undefined): CompletionChecklist {
  if (!log || !log.counts) {
    return { dsa: false, aptitude: false, sqlOrCs: false };
  }
  const dateKey = log.dailyCoding?.date || toLocalDateKey(new Date());
  const dailyCoding = normalizeDailyCodingState(log, dateKey);
  return {
    dsa: getDailyCodingCompletion(dailyCoding) || (log.counts.project || 0) > 0,
    aptitude: (log.counts.aptitude >= 20 || log.counts.aptitude > 0),
    sqlOrCs: (log.counts.sql >= 15 || log.counts.sql > 0 || (log.counts.cscore || 0) >= 1)
  };
}

export function getPerfectChecklist(log: DailyLog | undefined): PerfectChecklist {
  if (!log || !log.counts) {
    return { leetcode: false, skillrack: false, aptitude: false, sql: false, csCore: false };
  }
  const dateKey = log.dailyCoding?.date || toLocalDateKey(new Date());
  const dailyCoding = normalizeDailyCodingState(log, dateKey);
  return {
    leetcode: dailyCoding.tasks.leetcode_daily.active ? dailyCoding.tasks.leetcode_daily.completed : true,
    skillrack: getDailyCodingCompletion(dailyCoding),
    aptitude: log.counts.aptitude >= 30,
    sql: (log.counts.sql >= 5 || log.counts.sql >= 30),
    csCore: ((log.counts.cscore || 0) >= 1)
  };
}

export function evaluateCompletion(log: DailyLog | undefined): 'missed' | 'partial' | 'minimum' | 'perfect' | 'freeze' {
  if (!log) return 'missed';
  if (log.freezeUsed) return 'freeze';

  const minCheck = getMinimumChecklist(log);
  const perfCheck = getPerfectChecklist(log);

  const isPerfect = (perfCheck.leetcode || perfCheck.skillrack) && perfCheck.aptitude && perfCheck.sql && perfCheck.csCore;
  if (isPerfect) return 'perfect';

  const isMin = minCheck.dsa && minCheck.aptitude && minCheck.sqlOrCs;
  if (isMin) return 'minimum';

  const hasActivity = Object.values(log.counts || {}).some(val => typeof val === 'number' && val > 0);
  if (hasActivity) return 'partial';

  return 'missed';
}
