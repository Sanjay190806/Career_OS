import React from 'react';
import { ProductivityTrend } from '../../types/analytics';
import { Card } from '../ui/Card';

export const XPTrendChart: React.FC<{ data: ProductivityTrend[] }> = ({ data }) => (
  <Card>
    <h3 className="mb-4 text-lg font-semibold text-textPrimary">XP trend</h3>
    <div className="flex items-end gap-2">
      {data.map((item) => <div key={item.label} className="w-full rounded-t bg-accentBlue/70" style={{ height: `${Math.max(8, item.xp)}px` }} title={`${item.label}: ${item.xp} XP`} />)}
    </div>
  </Card>
);
