import React from 'react';
import { PlacementOSReadiness } from '../../types/placement';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';

export const PlacementReadinessCard: React.FC<{ readiness: PlacementOSReadiness }> = ({ readiness }) => (
  <Card>
    <p className="text-xs font-semibold uppercase tracking-widest text-textMuted">Placement OS</p>
    <h2 className="mt-1 text-2xl font-semibold text-textPrimary">{readiness.score}% ready</h2>
    <div className="mt-4">
      <ProgressBar value={readiness.score} />
    </div>
    <p className="mt-3 text-sm text-textSecondary">{readiness.nextAction}</p>
    <div className="mt-4 grid grid-cols-2 gap-3">
      <Metric label="Resume" value={readiness.resumeScore} />
      <Metric label="Companies" value={readiness.companyPrepScore} />
      <Metric label="Interviews" value={readiness.interviewScore} />
      <Metric label="OA" value={readiness.oaScore} />
    </div>
  </Card>
);

const Metric: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-3">
    <p className="text-xs text-textMuted">{label}</p>
    <p className="text-lg font-semibold text-textPrimary">{value}%</p>
  </div>
);
