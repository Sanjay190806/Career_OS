import React from 'react';
import { ProductivityTrend } from '../../types/analytics';
import { Card } from '../ui/Card';

export const LearningHeatmap: React.FC<{ data: ProductivityTrend[] }> = ({ data }) => (
  <Card>
    <h3 className="mb-4 text-lg font-semibold text-textPrimary">Learning heatmap</h3>
    <div className="grid grid-cols-7 gap-2">
      {data.map((item) => <div key={item.label} title={item.label} className="aspect-square rounded-lg border border-border-subtle" style={{ backgroundColor: `rgba(16, 185, 129, ${Math.max(0.12, item.completionRate / 100)})` }} />)}
    </div>
  </Card>
);
