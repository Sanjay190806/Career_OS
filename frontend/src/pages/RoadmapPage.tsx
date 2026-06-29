import React, { useState, useMemo, useEffect } from 'react';
import { useCareerStore } from '../app/store/useCareerStore';
import { useRoadmapStore } from '../app/store/useRoadmapStore';
import { RoadmapFilters } from '../components/roadmap/RoadmapFilters';
import { RoadmapDayCard } from '../components/roadmap/RoadmapDayCard';
import { ProblemDrawer } from '../components/roadmap/ProblemDrawer';
import { RoadmapProgressSummary } from '../components/roadmap/RoadmapProgressSummary';
import { ROADMAP } from '../data/roadmap';
import { RoadmapProblem } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { TOTAL_DAYS } from '../data/constants';

export const RoadmapPage: React.FC = () => {
  const userProfile = useCareerStore((s) => s.userProfile);
  const problemLogs = useCareerStore((s) => s.problemLogs);

  // Filters State
  const searchQuery = useRoadmapStore((s) => s.searchQuery);
  const selectedTopic = useRoadmapStore((s) => s.selectedTopic);
  const selectedDifficulty = useRoadmapStore((s) => s.selectedDifficulty);
  const selectedStatus = useRoadmapStore((s) => s.selectedStatus);

  // Drawer Toggles
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeProb, setActiveProb] = useState<{ problem: RoadmapProblem; day: number; index: number } | null>(null);

  // Pagination limit
  const [visibleDaysCount, setVisibleDaysCount] = useState(30);

  // Memoize Filtered roadmap mapping
  const filteredTimeline = useMemo(() => {
    const matchedDays: { day: number; problems: RoadmapProblem[] }[] = [];

    // Solve status helper cache set
    const solvedKeys = new Set(
      Object.keys(problemLogs).filter(k => problemLogs[k]?.solved)
    );

    Array.from({ length: TOTAL_DAYS }, (_, index) => index + 1).forEach((dayNum) => {
      const problems = ROADMAP[String(dayNum)] || [];

      const matchedProblems = problems.filter((p, idx) => {
        const logKey = `d_${dayNum}_${idx}`;
        const isSolved = solvedKeys.has(logKey);

        const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.pattern.toLowerCase().includes(searchQuery.toLowerCase());
        const matchTopic = !selectedTopic || p.topic === selectedTopic;
        const matchDiff = !selectedDifficulty || p.difficulty === selectedDifficulty;
        const matchStatus = selectedStatus === 'all' || (selectedStatus === 'solved' ? isSolved : !isSolved);

        return matchSearch && matchTopic && matchDiff && matchStatus;
      });

      if (matchedProblems.length > 0) {
        matchedDays.push({ day: dayNum, problems: matchedProblems });
      }
    });

    // Sort by day key index
    return matchedDays.sort((a, b) => a.day - b.day);
  }, [searchQuery, selectedTopic, selectedDifficulty, selectedStatus, problemLogs]);

  const handleProblemClick = (problem: RoadmapProblem, day: number, index: number) => {
    setActiveProb({ problem, day, index });
    setDrawerOpen(true);
  };

  const handleLoadMore = () => {
    setVisibleDaysCount((prev) => Math.min(prev + 30, 180));
  };

  const handleShowAll = () => {
    setVisibleDaysCount(180);
  };

  useEffect(() => {
    setVisibleDaysCount(30);
  }, [searchQuery, selectedTopic, selectedDifficulty, selectedStatus]);

  const visibleTimeline = filteredTimeline.slice(0, visibleDaysCount);
  const hasMore = filteredTimeline.length > visibleDaysCount;
  const activeFilterLabel = [
    selectedTopic || 'All Topics',
    selectedDifficulty || 'All Difficulties',
    selectedStatus === 'all' ? 'All Statuses' : selectedStatus === 'solved' ? 'Solved Only' : 'Unsolved Only'
  ].join(' • ');

  return (
    <div className="flex flex-col gap-6 pb-10 fade-in">
      <Card className="grid gap-4 border-border-accent/20 bg-gradient-to-r from-accentBlue/10 via-bgCard to-bgCard p-4 md:grid-cols-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Roadmap Summary</p>
          <h3 className="mt-1 text-lg font-semibold text-textPrimary">All 180 days, 360 problems</h3>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Total Days</p>
          <p className="mt-1 text-2xl font-semibold text-textPrimary">180</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Problems</p>
          <p className="mt-1 text-2xl font-semibold text-textPrimary">360</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Active Filter</p>
          <p className="mt-1 text-sm font-medium text-textSecondary">{activeFilterLabel}</p>
        </div>
      </Card>

      {/* progress progress bars */}
      <RoadmapProgressSummary />

      {/* search inputs filter cards */}
      <RoadmapFilters />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-textSecondary">
          Showing {Math.min(visibleDaysCount, filteredTimeline.length)} of {filteredTimeline.length} matching days
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={handleShowAll}>
            Show All Days
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setVisibleDaysCount(30)}>
            Show First 30
          </Button>
        </div>
      </div>

      {/* Grid of roadmap days */}
      {visibleTimeline.length === 0 ? (
        <div className="glass-card p-12 text-center text-xs text-textSecondary">
          No days or problems matched your search filters. Try adjusting your query parameters.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visibleTimeline.map((item) => (
            <RoadmapDayCard
              key={item.day}
              day={item.day}
              startDate={userProfile.startDate}
              problems={item.problems}
              onProblemClick={(prob, index) => handleProblemClick(prob, item.day, index)}
            />
          ))}
        </div>
      )}

      {/* Load More Trigger */}
      {hasMore && (
        <div className="mt-6 flex justify-center">
          <Button type="button" onClick={handleLoadMore} variant="outline" className="w-full max-w-xs rounded-xl text-xs py-2">
            Load More Days ({Math.min(visibleDaysCount, filteredTimeline.length)}/{filteredTimeline.length})
          </Button>
        </div>
      )}

      {/* Side Problem details drawer */}
      {activeProb && (
        <ProblemDrawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          problem={activeProb.problem}
          day={activeProb.day}
          problemIndex={activeProb.index}
        />
      )}
    </div>
  );
};
