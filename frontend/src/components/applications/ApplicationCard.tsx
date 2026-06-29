import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { CareerApplication } from '../../types';

interface ApplicationCardProps {
  application: CareerApplication;
  onClick: () => void;
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({ application, onClick }) => {
  const getStatusVariant = (status: string) => {
    if (status === 'Offer') return 'success';
    if (status === 'Rejected') return 'danger';
    if (status === 'Interview' || status === 'OA') return 'warning';
    return 'neutral';
  };

  return (
    <Card hoverable onClick={onClick} className="p-3.5 flex flex-col gap-2 relative bg-bgSurface border border-border-subtle cursor-pointer select-none">
      <div className="flex justify-between items-start gap-2">
        <h4 className="text-xs font-bold text-textPrimary truncate">{application.company}</h4>
        <Badge variant={getStatusVariant(application.status)} className="text-[8px] py-0">{application.status}</Badge>
      </div>
      <p className="text-[10px] text-textSecondary truncate">{application.role}</p>
      
      <div className="flex justify-between items-center mt-2 text-[9px] text-textMuted border-t border-border-subtle/50 pt-2 font-mono">
        <span>{application.date}</span>
        {application.salary && <span className="text-textSecondary">{application.salary}</span>}
      </div>
    </Card>
  );
};
