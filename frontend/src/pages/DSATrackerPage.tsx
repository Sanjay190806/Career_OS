import React, { useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Button } from '../components/ui/Button';
import { useCareerStore } from '../app/store/useCareerStore';
import { getTotalLCSolved } from '../utils/xpUtils';
import { ROADMAP } from '../data/roadmap';
import {
  DSA_PATTERNS,
  normalizePatternName,
  getPatternMastery
} from '../utils/dsaPatternUtils';

type Mastery = 'Not Started' | 'Learning' | 'Practicing' | 'Strong' | 'Interview Ready';

export const DSATrackerPage: React.FC = () => {
  const careerState = useCareerStore((s) => s);
  const dsaPatternMastery = careerState.dsaPatternMastery || {};
  const problemLogs = careerState.problemLogs || {};
  const updateDSAPatternMastery = useCareerStore((s) => s.updateDSAPatternMastery);
  const updateProblemLog = useCareerStore((s) => s.updateProblemLog);

  const lcSolved = getTotalLCSolved(careerState);

  // Group all roadmap problems into our 23 defined primary patterns
  const patternStats = useMemo(() => {
    // Initialize stats map for all 23 primary patterns so they always render (even if 0 solved)
    const stats = new Map<string, {
      pattern: string;
      totalCount: number;
      solvedCount: number;
      lowConfidenceCount: number;
      revisionQueueCount: number;
      topics: Set<string>;
      items: Array<{ day: number; index: number; topic: string }>;
    }>();

    DSA_PATTERNS.forEach((p) => {
      stats.set(p, {
        pattern: p,
        totalCount: 0,
        solvedCount: 0,
        lowConfidenceCount: 0,
        revisionQueueCount: 0,
        topics: new Set<string>(),
        items: []
      });
    });

    // Fallback category for uncategorized/others
    stats.set('Uncategorized', {
      pattern: 'Uncategorized',
      totalCount: 0,
      solvedCount: 0,
      lowConfidenceCount: 0,
      revisionQueueCount: 0,
      topics: new Set<string>(),
      items: []
    });

    // Populate stats from 180 days roadmap
    Array.from({ length: 180 }, (_, index) => index + 1).forEach((day) => {
      const problems = ROADMAP[String(day)] || [];
      problems.forEach((problem, problemIdx) => {
        const rawPattern = problem.pattern || 'General';
        const pattern = normalizePatternName(rawPattern);
        
        const current = stats.get(pattern) || stats.get('Uncategorized')!;
        const log = problemLogs[`d_${day}_${problemIdx}`];
        
        current.totalCount += 1;
        current.topics.add(problem.topic);
        current.items.push({ day, index: problemIdx, topic: problem.topic });
        
        if (log?.solved) current.solvedCount += 1;
        if ((log?.confidence || 0) <= 2 && log?.solved) current.lowConfidenceCount += 1;
        if (log?.revisitFlag) current.revisionQueueCount += 1;
        
        stats.set(pattern, current);
      });
    });

    // Clean up empty patterns if they are not in the primary list
    return Array.from(stats.values())
      .filter((entry) => entry.totalCount > 0 || entry.pattern !== 'Uncategorized')
      .sort((a, b) => a.pattern.localeCompare(b.pattern))
      .map((entry) => ({
        ...entry,
        topics: Array.from(entry.topics)
      }));
  }, [problemLogs]);

  const handleMasteryChange = (pattern: string, val: Mastery) => {
    updateDSAPatternMastery(pattern, { mastery: val });
  };

  const handleAddToRevision = (pattern: string, items: Array<{ day: number; index: number }>) => {
    items.forEach(({ day, index }) => {
      const key = `d_${day}_${index}`;
      const current = problemLogs[key];
      if (current) {
        updateProblemLog(key, { revisitFlag: true });
      }
    });
    updateDSAPatternMastery(pattern, { mastery: 'Practicing' });
    alert(`Added related problems of pattern "${pattern}" to your Revision Queue!`);
  };

  const handleResetPattern = (pattern: string) => {
    if (window.confirm(`Reset progress tracking for pattern "${pattern}"?`)) {
      updateDSAPatternMastery(pattern, {
        solvedCount: 0,
        confidenceSum: 0,
        confidenceCount: 0,
        mastery: 'Not Started'
      });
    }
  };

  return (
    <div className="fade-in flex flex-col gap-6 pb-10">
      <SectionHeader
        title="DSA Patterns Mastery Tracker"
        subtitle="Placement-focused pattern cards derived from the 180-day Java DSA Roadmap"
      />

      <Card className="grid gap-4 border-border-accent/20 bg-gradient-to-r from-accentBlue/10 via-bgCard to-bgCard p-4 md:grid-cols-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">LeetCode Solved</p>
          <p className="mt-1 text-2xl font-semibold text-textPrimary">{lcSolved}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Core DSA Patterns</p>
          <p className="mt-1 text-2xl font-semibold text-textPrimary">{patternStats.length}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Revision Queue</p>
          <p className="mt-1 text-2xl font-semibold text-textPrimary">
            {patternStats.reduce((sum, entry) => sum + entry.revisionQueueCount, 0)}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Average Confidence</p>
          <p className="mt-1 text-2xl font-semibold text-textPrimary">
            {patternStats.length
              ? (patternStats.reduce((sum, entry) => {
                  const mastery = dsaPatternMastery[entry.pattern];
                  const avg = mastery?.confidenceCount ? mastery.confidenceSum / mastery.confidenceCount : 0;
                  return sum + (avg || 0);
                }, 0) / patternStats.length).toFixed(1)
              : '0.0'}
            /5
          </p>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {patternStats.map((entry) => {
          const current = dsaPatternMastery[entry.pattern] || {};
          const confidenceCount = current.confidenceCount || 0;
          const confidenceSum = current.confidenceSum || 0;
          const avgConfidence = confidenceCount > 0 ? (confidenceSum / confidenceCount) : 0;
          
          // Auto calculate mastery status if not manually set
          const computedMastery = getPatternMastery({
            solvedCount: entry.solvedCount,
            totalCount: entry.totalCount,
            confidenceAverage: avgConfidence
          }) as Mastery;

          const activeMastery = (current.mastery as Mastery) || computedMastery;

          const progress = entry.totalCount ? Math.round((entry.solvedCount / entry.totalCount) * 100) : 0;
          const confidenceText = avgConfidence > 0 ? avgConfidence.toFixed(1) : '0.0';

          return (
            <Card key={entry.pattern} className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-textMuted">{entry.pattern}</p>
                  <h3 className="mt-1 text-lg font-semibold text-textPrimary">Solved: {entry.solvedCount} / {entry.totalCount}</h3>
                </div>
                <Badge variant={activeMastery === 'Interview Ready' ? 'success' : activeMastery === 'Strong' ? 'primary' : 'neutral'}>
                  {activeMastery}
                </Badge>
              </div>

              <ProgressBar value={progress} color="var(--accent-blue)" />

              <div className="grid grid-cols-2 gap-3 text-xs text-textSecondary">
                <div className="rounded-2xl border border-border-subtle bg-white/[0.04] p-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-textMuted">Confidence</p>
                  <p className="mt-1 text-base font-semibold text-textPrimary">{confidenceText}/5</p>
                </div>
                <div className="rounded-2xl border border-border-subtle bg-white/[0.04] p-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-textMuted">Revision Queue</p>
                  <p className="mt-1 text-base font-semibold text-textPrimary">{entry.revisionQueueCount}</p>
                </div>
                <div className="rounded-2xl border border-border-subtle bg-white/[0.04] p-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-textMuted">Low confidence</p>
                  <p className="mt-1 text-base font-semibold text-textPrimary">{entry.lowConfidenceCount}</p>
                </div>
                <div className="rounded-2xl border border-border-subtle bg-white/[0.04] p-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-textMuted">Topic Groups</p>
                  <p className="mt-1 text-base font-semibold text-textPrimary">{entry.topics.length}</p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-textMuted">Related Syllabus</p>
                <div className="flex flex-wrap gap-2">
                  {entry.topics.slice(0, 4).map((topic) => (
                    <Badge key={topic} variant="neutral">{topic}</Badge>
                  ))}
                  {entry.topics.length > 4 && <Badge variant="neutral">+{entry.topics.length - 4} more</Badge>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-auto pt-2 border-t border-border-subtle/50">
                <Button type="button" variant="outline" size="sm" onClick={() => handleMasteryChange(entry.pattern, 'Practicing')}>
                  Mark Practiced
                </Button>
                <Button type="button" variant="primary" size="sm" onClick={() => handleMasteryChange(entry.pattern, 'Strong')}>
                  Mark Strong
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => handleAddToRevision(entry.pattern, entry.items)}>
                  Add to Revision
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => handleResetPattern(entry.pattern)}>
                  Reset Progress
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
