import React, { useState } from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { useCareerStore } from '../app/store/useCareerStore';

export const HistoryPage: React.FC = () => {
  const dailyLogs = useCareerStore((s) => s.dailyLogs);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [moodFilter, setMoodFilter] = useState("all");

  const logsList = Object.keys(dailyLogs).map(day => ({
    day: parseInt(day),
    ...dailyLogs[day]
  })).sort((a, b) => b.day - a.day);

  // Apply filters
  const filteredLogs = logsList.filter(log => {
    const matchesSearch = log.note?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    const matchesMood = moodFilter === 'all' || String(log.mood) === moodFilter;
    return matchesSearch && matchesStatus && matchesMood;
  });

  const getStatusVariant = (status: string) => {
    if (status === 'completed') return 'success';
    if (status === 'partial') return 'warning';
    if (status === 'missed') return 'danger';
    return 'neutral';
  };

  const statusOptions = [
    { value: 'all', label: 'All status types' },
    { value: 'completed', label: 'Completed logs' },
    { value: 'partial', label: 'Partial logs' },
    { value: 'missed', label: 'Missed logs' }
  ];

  const moodOptions = [
    { value: 'all', label: 'All moods' },
    { value: '5', label: '🔥 High Energy' },
    { value: '3', label: '🙂 Normal Mood' },
    { value: '1', label: '😴 Very Fatigued' }
  ];

  return (
    <div className="flex flex-col gap-6 fade-in pb-10 select-none">
      <SectionHeader
        title="Historical Study Logs"
        subtitle="Search and filter your historical progress notes and mood parameters logs"
      />

      {/* Filter panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          placeholder="Search notes content..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        />

        <Select
          options={moodOptions}
          value={moodFilter}
          onChange={(e) => setMoodFilter(e.target.value)}
        />
      </div>

      {/* Logs List */}
      <div className="flex flex-col gap-4">
        {filteredLogs.length === 0 ? (
          <div className="glass-card p-12 text-center text-xs text-textSecondary">
            No matching study logs found.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <Card key={log.day} className="p-4 flex flex-col gap-3 bg-bgCard/40 border border-border-subtle">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className="text-xs font-bold text-textPrimary">Day {log.day} Study Log</span>
                  <span className="text-[10px] text-textMuted font-mono block mt-0.5">Saved: {new Date(log.savedAt || '').toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs">
                    {['😴', '😐', '🙂', '😊', '🔥'][(log.mood || 3) - 1]}
                  </span>
                  <Badge variant={getStatusVariant(log.status)}>{log.status}</Badge>
                </div>
              </div>

              {log.note && (
                <p className="p-3 bg-bgSurface/40 border border-border-subtle rounded-xl text-[11px] leading-relaxed text-textSecondary whitespace-pre-wrap">
                  {log.note}
                </p>
              )}

              <div className="flex justify-between items-center text-[10px] text-textMuted font-mono border-t border-border-subtle/50 pt-2.5">
                <span>Problems Solved: {log.lcStatus?.length || 0} LeetCode</span>
                <span className="text-accentOrange">+{log.xpEarned || 0} XP gained</span>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
