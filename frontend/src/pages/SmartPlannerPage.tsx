import React, { useState } from 'react';
import { RotateCcw, Save } from 'lucide-react';
import { PlannerInsights } from '../components/smart-planner/PlannerInsights';
import { PlannerModeSelector } from '../components/smart-planner/PlannerModeSelector';
import { SmartTaskCard } from '../components/smart-planner/SmartTaskCard';
import { TodayPlanSummary } from '../components/smart-planner/TodayPlanSummary';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useSmartPlanner } from '../hooks/useSmartPlanner';
import { PlannerMode } from '../types/smartPlanner';

export const SmartPlannerPage: React.FC = () => {
  const { plan, generate, save, completeTask } = useSmartPlanner();
  const [mode, setMode] = useState<PlannerMode>(plan.mode);

  const completed = plan.tasks.filter((task) => task.status === 'completed').length;

  return (
    <div className="workspace-page flex flex-col gap-6 pb-12 md:pb-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-textPrimary">Smart Daily Planner</h1>
          <p className="mt-2 max-w-3xl text-sm text-textSecondary">Generate a realistic daily plan from AI Brain signals, placement priorities, energy, and project portfolio gaps.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => generate(mode)}><RotateCcw className="mr-2 h-4 w-4" />Regenerate</Button>
          <Button onClick={save}><Save className="mr-2 h-4 w-4" />Save plan</Button>
        </div>
      </div>
      <Card>
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-textMuted">Planner mode</p>
        <PlannerModeSelector value={mode} onChange={(next) => { setMode(next); generate(next); }} />
      </Card>
      <TodayPlanSummary plan={plan} />
      <PlannerInsights insight={plan.insight} />
      <div className="grid gap-4">
        {plan.tasks.map((task) => <SmartTaskCard key={task.id} task={task} onComplete={completeTask} />)}
      </div>
      <Card>
        <h3 className="text-lg font-semibold text-textPrimary">Completion summary</h3>
        <p className="mt-2 text-sm text-textSecondary">{completed === plan.tasks.length ? 'Plan complete. Good day to log a short reflection.' : `${completed} completed, ${plan.tasks.length - completed} remaining. Keep the plan small and finishable.`}</p>
      </Card>
    </div>
  );
};
