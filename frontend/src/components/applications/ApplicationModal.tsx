import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { useCareerStore } from '../../app/store/useCareerStore';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApplicationModal: React.FC<ApplicationModalProps> = ({ isOpen, onClose }) => {
  const addApplication = useCareerStore((s) => s.addApplication);

  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState<any>("Applied");
  const [salary, setSalary] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const handleCreate = () => {
    if (!company.trim() || !role.trim()) {
      alert("Please fill in company name and role");
      return;
    }

    addApplication({
      id: `app_${Date.now()}`,
      company,
      role,
      status,
      salary,
      date
    });
    
    // Clear and close
    setCompany("");
    setRole("");
    setStatus("Applied");
    setSalary("");
    onClose();
  };

  const statusOptions = [
    { value: 'Wishlist', label: 'Wishlist Pipeline' },
    { value: 'Applied', label: 'Applied Sent' },
    { value: 'OA', label: 'Online Assessment' },
    { value: 'Interview', label: 'Interview Scheduled' },
    { value: 'Offer', label: 'Offer Received' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs select-none">
      <Card className="w-full max-w-md p-6 border border-border-subtle bg-bgSurface/95">
        <h3 className="font-bold text-sm text-textPrimary uppercase tracking-wider mb-4">Add Job Application</h3>
        
        <div className="flex flex-col gap-4">
          <Input label="Company Name" placeholder="e.g. Google" value={company} onChange={(e) => setCompany(e.target.value)} />
          <Input label="Role / Title" placeholder="e.g. SWE Intern" value={role} onChange={(e) => setRole(e.target.value)} />
          
          <Select
            label="Application Stage"
            options={statusOptions}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Salary / CTC" placeholder="e.g. 15 LPA" value={salary} onChange={(e) => setSalary(e.target.value)} />
            <Input label="Date applied" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className="flex gap-2 pt-4 border-t border-border-subtle/50 mt-2">
            <Button onClick={handleCreate} className="flex-1 rounded-xl">Add Application</Button>
            <Button onClick={onClose} variant="ghost" className="px-4 border border-border-subtle rounded-xl">Cancel</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
