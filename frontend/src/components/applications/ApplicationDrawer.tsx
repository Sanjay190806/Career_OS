import React, { useState, useEffect } from 'react';
import { Drawer } from '../ui/Drawer';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { CareerApplication } from '../../types';
import { useCareerStore } from '../../app/store/useCareerStore';

interface ApplicationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  application: CareerApplication;
}

export const ApplicationDrawer: React.FC<ApplicationDrawerProps> = ({
  isOpen,
  onClose,
  application
}) => {
  const updateApplication = useCareerStore((s) => s.updateApplication);
  const deleteApplication = useCareerStore((s) => s.deleteApplication);

  const [company, setCompany] = useState(application.company);
  const [role, setRole] = useState(application.role);
  const [status, setStatus] = useState<CareerApplication['status']>(application.status);
  const [salary, setSalary] = useState(application.salary);
  const [date, setDate] = useState(application.date);

  useEffect(() => {
    if (isOpen) {
      setCompany(application.company);
      setRole(application.role);
      setStatus(application.status);
      setSalary(application.salary);
      setDate(application.date);
    }
  }, [isOpen, application]);

  const handleSave = () => {
    updateApplication(application.id, {
      company,
      role,
      status,
      salary,
      date
    });
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete application for ${company}?`)) {
      deleteApplication(application.id);
      onClose();
    }
  };

  const statusOptions = [
    { value: 'Wishlist', label: 'Wishlist Pipeline' },
    { value: 'Applied', label: 'Applied Sent' },
    { value: 'OA', label: 'Online Assessment' },
    { value: 'Interview', label: 'Interview Scheduled' },
    { value: 'HR', label: 'HR Final round' },
    { value: 'Offer', label: 'Offer Received ✓' },
    { value: 'Rejected', label: 'Rejected Outcome' },
    { value: 'Ghosted', label: 'Ghosted/No Reply' }
  ];

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={`Application details: ${application.company}`}>
      <div className="flex flex-col gap-5 select-none pb-6">
        <Input label="Company Name" value={company} onChange={(e) => setCompany(e.target.value)} />
        <Input label="Job Role / Position" value={role} onChange={(e) => setRole(e.target.value)} />
        
        <Select
          label="Application Status"
          options={statusOptions}
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input label="Salary details" value={salary} onChange={(e) => setSalary(e.target.value)} />
          <Input label="Application Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        <div className="flex flex-col gap-2 pt-6 border-t border-border-subtle/50">
          <Button onClick={handleSave} className="w-full rounded-xl">Save Changes</Button>
          <Button onClick={handleDelete} variant="danger" className="w-full rounded-xl mt-1">Delete Application</Button>
        </div>
      </div>
    </Drawer>
  );
};
