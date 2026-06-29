import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { SectionHeader } from '../components/ui/SectionHeader';
import { useCareerStore } from '../app/store/useCareerStore';

export const SQLPage: React.FC = () => {
  const careerState = useCareerStore((s) => s);
  const sqlProgress = careerState.sqlProgress || {};
  const updateSQLTopic = useCareerStore((s) => s.updateSQLTopic);

  const [notes, setNotes] = useState("");
  const [activeTopic, setActiveTopic] = useState<string | null>(null);

  const sqlTopics = [
    "SELECT basics", "WHERE filtering", "ORDER BY", "GROUP BY", "HAVING",
    "Aggregate functions", "INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN",
    "Subqueries", "CTEs", "Window functions", "Ranking functions", "CASE WHEN",
    "Date functions", "String functions", "NULL handling", "Index basics", "Query optimization"
  ];

  const handleToggle = (topic: string) => {
    const current = sqlProgress[topic] || { completed: false, confidence: 3, notes: '', solvedCount: 0 };
    updateSQLTopic(topic, { completed: !current.completed });
  };

  const handleConfidence = (topic: string, val: number) => {
    updateSQLTopic(topic, { confidence: val });
  };

  const handleSaveNotes = (topic: string) => {
    updateSQLTopic(topic, { notes });
    setActiveTopic(null);
    setNotes("");
  };

  const totalCompleted = sqlTopics.filter(t => sqlProgress[t]?.completed).length;
  const progressPercent = Math.round((totalCompleted / sqlTopics.length) * 100);

  return (
    <div className="flex flex-col gap-6 fade-in pb-10 select-none">
      <SectionHeader
        title="SQL Mastery Workspace"
        subtitle="Track SQL queries, schemas operations, and query optimizations checkpoints"
      />

      {/* Progress banner */}
      <Card className="flex flex-col gap-3">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-textSecondary uppercase tracking-wider pl-0.5">Syllabus Completion</span>
          <span className="font-mono text-accentBlue font-bold">{progressPercent}%</span>
        </div>
        <ProgressBar value={progressPercent} color="var(--accent-blue)" />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Topics checklist */}
        <Card className="lg:col-span-2 flex flex-col gap-4">
          <span className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider block pl-0.5 border-b border-border-subtle/50 pb-2">SQL Practice Checklist</span>
          
          <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
            {sqlTopics.map((topic) => {
              const current = sqlProgress[topic] || { completed: false, confidence: 3, notes: '', solvedCount: 0 };
              return (
                <div key={topic} className="flex flex-col gap-2 p-3 bg-bgSurface/40 border border-border-subtle rounded-xl">
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={current.completed}
                        onChange={() => handleToggle(topic)}
                        className="w-4 h-4 rounded border-border-subtle bg-bgSurface text-accentBlue focus:ring-accentBlue/30 focus:ring-1 cursor-pointer"
                      />
                      <span className={`font-bold ${current.completed ? 'text-textSecondary line-through' : 'text-textPrimary'}`}>
                        {topic}
                      </span>
                    </div>
                    
                    {/* Confidence dots */}
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          onClick={() => handleConfidence(topic, val)}
                          className={`w-3.5 h-3.5 rounded-full text-[8px] font-bold ${
                            current.confidence >= val ? 'bg-accentBlue text-white' : 'bg-bgSurface text-textMuted border border-border-subtle'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes triggering */}
                  <div className="flex justify-between items-center text-[9px] text-textMuted font-mono mt-1 border-t border-border-subtle/30 pt-2 pl-0.5">
                    <button
                      onClick={() => {
                        setActiveTopic(topic);
                        setNotes(current.notes || "");
                      }}
                      className="hover:text-textPrimary text-[9px]"
                    >
                      ✏️ {current.notes ? "Edit Note" : "Add Practice notes"}
                    </button>
                    {current.notes && <span className="truncate max-w-[200px]">{current.notes}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Notes Dialog panel */}
        {activeTopic && (
          <Card className="flex flex-col justify-between p-4 h-[250px]">
            <div>
              <span className="text-[10px] font-bold text-textSecondary uppercase tracking-wider block mb-2 pl-0.5">Edit Notes: {activeTopic}</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-bgSurface border border-border-subtle text-textPrimary text-xs rounded-xl p-3 h-28 resize-none focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => handleSaveNotes(activeTopic)} className="flex-1 text-[10px] py-1.5 rounded-xl">Save Note</Button>
              <Button onClick={() => setActiveTopic(null)} variant="ghost" className="px-3 text-[10px] border border-border-subtle rounded-xl">Cancel</Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
