import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCompanyReadiness,
  calculateLightningScore,
  calculateMonthlyLeetCodeProgress,
  calculateXP,
  canEditDate,
  createBackup,
  generateTomorrowPlan,
  getAccessMode,
  getGrade,
  isSuccessfulStreakDay,
  validateBackupShape,
} from '../src/utils/placementDisciplineEngine.mjs';

const completeEntry = {
  skillrackCount: 10,
  leetcodeEasy: 1,
  leetcodeMedium: 1,
  leetcodeHard: 1,
  aptitudeCount: 20,
  aptitudeTopic: 'Percentage',
  sqlDone: true,
  sqlNotes: 'joins',
  coreSubject: 'DBMS',
  coreConcept: 'Indexes',
  coreConceptDone: true,
  germanMinutes: 15,
  resumeUpdated: true,
  githubUpdated: true,
  linkedinUpdated: true,
  companyPrepDone: true,
  companyName: 'Zoho',
  companyPrepNotes: 'Aptitude SQL OOPS Communication',
  mockInterviewDone: true,
  interviewQuestionReviewed: true,
  mistakeNoteAdded: true,
  mistakeNotes: 'Need cleaner dry run',
  energyLevel: 8,
  mood: 'Focused',
  sleepHours: 7,
  biggestDistraction: 'Phone',
  tomorrowFirstTask: 'SkillRack first',
  savedAt: '2026-07-01T00:00:00.000Z',
};

test('calculates XP using v1.8 rules without sleep or distraction penalties', () => {
  assert.equal(calculateXP(completeEntry), 710);
});

test('calculates streak basics and excludes LeetCode from mandatory daily basics', () => {
  const entry = { ...completeEntry, leetcodeEasy: 0, leetcodeMedium: 0, leetcodeHard: 0 };
  assert.equal(isSuccessfulStreakDay(entry), true);
  assert.equal(isSuccessfulStreakDay({ ...entry, germanMinutes: 10 }), false);
});

test('calculates Lightning Score and grade bands', () => {
  assert.equal(getGrade(95), 'S');
  assert.equal(getGrade(80), 'A');
  assert.equal(getGrade(62), 'B');
  assert.equal(getGrade(45), 'C');
  assert.equal(getGrade(12), 'D');
  assert.ok(calculateLightningScore(completeEntry, { percentage: 50 }) >= 90);
});

test('calculates monthly LeetCode progress', () => {
  const progress = calculateMonthlyLeetCodeProgress({
    '2026-07-01': completeEntry,
    '2026-07-02': { ...completeEntry, leetcodeEasy: 2, leetcodeMedium: 0, leetcodeHard: 0 },
    '2026-08-01': completeEntry,
  }, '2026-07');
  assert.deepEqual(progress, { solved: 5, target: 50, percentage: 10 });
});

test('blocks future dates and marks past dates read-only', () => {
  assert.equal(canEditDate('2026-07-01', '2026-07-01'), true);
  assert.deepEqual(getAccessMode('2026-06-30', '2026-07-01'), { status: 'past', canEdit: false, readOnly: true, blocked: false });
  assert.deepEqual(getAccessMode('2026-07-02', '2026-07-01'), { status: 'future', canEdit: false, readOnly: false, blocked: true });
});

test('exports backup shape and validates backup imports', () => {
  const backup = createBackup({ '2026-07-01': completeEntry }, { source: 'test' });
  assert.equal(backup.feature, 'v1.8-placement-discipline-engine');
  assert.equal(validateBackupShape(backup).valid, true);
  assert.equal(validateBackupShape({ feature: 'wrong', entries: {} }).valid, false);
  assert.equal(validateBackupShape({ ...backup, entries: { tomorrow: completeEntry } }).valid, false);
});

test('generates tomorrow plan from weak areas', () => {
  const weak = { ...completeEntry, skillrackCount: 3, aptitudeCount: 0, germanMinutes: 5, coreConceptDone: false };
  const plan = generateTomorrowPlan(weak, { '2026-07-01': weak }, '2026-07-01').join(' ');
  assert.match(plan, /SkillRack recovery/);
  assert.match(plan, /aptitude/);
  assert.match(plan, /German 15 minutes/);
  assert.match(plan, /OOPS, DBMS, OS, or CN/);
});

test('calculates company readiness with category completion and pending tasks', () => {
  const readiness = calculateCompanyReadiness({ '2026-07-01': completeEntry }, 'Zoho');
  assert.equal(readiness.companyName, 'Zoho');
  assert.ok(readiness.readiness > 0);
  assert.ok(readiness.completedTasks.includes('Aptitude'));
  assert.ok(readiness.pendingTasks.includes('Java basics'));
});
