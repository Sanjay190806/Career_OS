import React from 'react';
import { PlacementApplication, PlacementCompany } from '../../types/placement';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export const ApplicationStatusBoard: React.FC<{ applications: PlacementApplication[]; companies: PlacementCompany[] }> = ({ applications, companies }) => (
  <Card>
    <h3 className="mb-4 text-lg font-semibold text-textPrimary">Application board</h3>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {applications.map((app) => {
        const company = companies.find((item) => item.id === app.companyId);
        return (
          <div key={app.id} className="rounded-2xl border border-border-subtle bg-white/[0.03] p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="font-medium text-textPrimary">{company?.name || app.companyId}</p>
              <Badge variant="primary">{app.status.replace(/_/g, ' ')}</Badge>
            </div>
            <p className="text-xs text-textMuted">{app.nextAction}</p>
          </div>
        );
      })}
    </div>
  </Card>
);
