import React, { useMemo, useState } from 'react';
import { LearningOverviewCard } from '../components/learning/LearningOverviewCard';
import { LearningPathCard } from '../components/learning/LearningPathCard';
import { LearningPathDetailPanel } from '../components/learning/LearningPathDetailPanel';
import { LearningSessionForm } from '../components/learning/LearningSessionForm';
import { RevisionQueue } from '../components/learning/RevisionQueue';
import { SkillMasteryGrid } from '../components/learning/SkillMasteryGrid';
import { LearningMilestones } from '../components/learning/LearningMilestones';
import { LearningRecommendations } from '../components/learning/LearningRecommendations';
import { WeakAreaPanel } from '../components/learning/WeakAreaPanel';
import { LearningResourceList } from '../components/learning/LearningResourceList';
import { useLearningOS } from '../hooks/useLearningOS';

export const LearningOSPage: React.FC = () => {
  const { state, overview, dueRevision, addSession, completeRevision } = useLearningOS();
  const [selectedPathId, setSelectedPathId] = useState(state.paths[0]?.id || '');
  const selectedPath = useMemo(() => state.paths.find((path) => path.id === selectedPathId) || state.paths[0] || null, [selectedPathId, state.paths]);

  return (
    <div className="workspace-page flex flex-col gap-6 pb-12 md:pb-8">
      <div>
        <h1 className="text-3xl font-semibold text-textPrimary">Learning OS</h1>
        <p className="mt-2 max-w-3xl text-sm text-textSecondary">A structured command center for skill mastery, learning sessions, revision, weak areas, XP, streaks, and placement-focused growth.</p>
      </div>
      <LearningOverviewCard overview={overview} />
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <LearningSessionForm paths={state.paths} selectedPathId={selectedPath?.id || ''} onSubmit={addSession} />
        <LearningPathDetailPanel path={selectedPath} sessions={state.sessions} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {state.paths.map((path) => <LearningPathCard key={path.id} path={path} onSelect={() => setSelectedPathId(path.id)} />)}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <SkillMasteryGrid paths={state.paths} />
        <RevisionQueue items={dueRevision} onComplete={completeRevision} />
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <LearningRecommendations recommendations={state.recommendations} />
        <WeakAreaPanel paths={state.paths} />
        <LearningMilestones milestones={selectedPath?.milestones || []} />
      </div>
      <LearningResourceList resources={selectedPath?.resources || []} />
    </div>
  );
};
