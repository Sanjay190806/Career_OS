import React from 'react';
import { ApplicationStatus, PlacementCompany } from '../../types/placement';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

const statuses: ApplicationStatus[] = ['not_started', 'preparing', 'applied', 'oa_scheduled', 'oa_completed', 'interview_scheduled', 'interview_completed', 'selected', 'rejected', 'on_hold'];

export const CompanyDetailPanel: React.FC<{
  company: PlacementCompany | null;
  status: ApplicationStatus;
  onStatusChange: (status: ApplicationStatus) => void;
}> = ({ company, status, onStatusChange }) => {
  if (!company) {
    return (
      <Card>
        <p className="text-sm text-textSecondary">Select a company to inspect rounds, focus areas, and next actions.</p>
      </Card>
    );
  }

  return (
    <Card className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold text-textPrimary">{company.name}</h3>
        <p className="mt-1 text-sm text-textSecondary">{company.hiringProcess}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Info label="DSA" value={company.dsaFocus} />
        <Info label="SQL" value={company.sqlFocus} />
        <Info label="Aptitude" value={company.aptitudeFocus} />
        <Info label="Resume tip" value={company.resumeTips} />
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-textMuted">Application status</p>
        <div className="flex flex-wrap gap-2">
          {statuses.map((item) => (
            <Button key={item} size="sm" variant={status === item ? 'primary' : 'outline'} onClick={() => onStatusChange(item)}>
              {item.replace(/_/g, ' ')}
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
};

const Info: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-3">
    <p className="text-xs font-semibold uppercase tracking-widest text-textMuted">{label}</p>
    <p className="mt-1 text-sm text-textSecondary">{value}</p>
  </div>
);
