import React from 'react';
import { AIBrainCard } from '../components/ai-brain/AIBrainCard';
import { AIRecommendationPanel } from '../components/ai-brain/AIRecommendationPanel';
import { CareerRiskCard } from '../components/ai-brain/CareerRiskCard';
import { SkillInsightCard } from '../components/ai-brain/SkillInsightCard';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useAIBrain } from '../hooks/useAIBrain';

export const AIBrainPage: React.FC = () => {
  const { summary, refresh, isFallback } = useAIBrain();

  return (
    <div className="workspace-page flex flex-col gap-6 pb-12 md:pb-8">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-3xl font-semibold text-textPrimary">AI Brain</h1>
          {isFallback && <Badge variant="warning">local fallback</Badge>}
        </div>
        <p className="max-w-3xl text-sm text-textSecondary">A typed career context layer that summarizes skill signals, project strength, placement readiness, risks, and next actions.</p>
      </div>
      <AIBrainCard summary={summary} onRefresh={refresh} />
      <div className="grid gap-6 xl:grid-cols-2">
        <SkillInsightCard title="Strongest skills" skills={summary.strongestSkills} />
        <SkillInsightCard title="Weakest skills" skills={summary.weakestSkills} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <AIRecommendationPanel recommendations={summary.recommendations} />
        <CareerRiskCard risks={summary.riskFlags} />
      </div>
      <Card>
        <h3 className="mb-4 text-lg font-semibold text-textPrimary">Project portfolio status</h3>
        <div className="grid gap-3 md:grid-cols-3">
          {summary.projects.map((project) => (
            <div key={project.id} className="rounded-2xl border border-border-subtle bg-white/[0.03] p-4">
              <p className="font-semibold text-textPrimary">{project.name}</p>
              <p className="mt-1 text-sm text-textSecondary">{project.status} · {project.score}%</p>
              <p className="mt-3 text-xs text-textMuted">{project.nextAction}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
