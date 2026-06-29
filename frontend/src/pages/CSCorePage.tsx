import React, { useMemo, useState } from 'react';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useCareerStore } from '../app/store/useCareerStore';
import { CS_SUBJECTS, CSSubject } from '../data/csSubjects';
import { BookOpenText, CalendarDays, CheckCircle2, ShieldCheck, FileText } from 'lucide-react';

type TopicState = {
  completed: boolean;
  confidence: number;
  notes: string;
  interviewReady: boolean;
  lastRevisedAt: string | null;
  sampleQuestion: string;
};

export const CSCorePage: React.FC = () => {
  const careerState = useCareerStore((s) => s);
  const csCoreProgress = careerState.csCoreProgress || {};
  const updateCSCoreTopic = useCareerStore((s) => s.updateCSCoreTopic);
  const [activeSubject, setActiveSubject] = useState<CSSubject['id']>('dbms');

  const activeSubjectData = CS_SUBJECTS.find((subject) => subject.id === activeSubject) || CS_SUBJECTS[0];
  const activeProgress = csCoreProgress[activeSubject] || {};

  const subjectSummary = useMemo(() => {
    return CS_SUBJECTS.map((subject) => {
      const progress = csCoreProgress[subject.id] || {};
      const completed = subject.topics.filter((topic) => progress[topic.name]?.completed).length;
      return {
        ...subject,
        completed,
        total: subject.topics.length,
        pct: Math.round((completed / subject.topics.length) * 100)
      };
    });
  }, [csCoreProgress]);

  const updateTopic = (subjectId: string, topicName: string, patch: Partial<TopicState>) => {
    updateCSCoreTopic(subjectId, topicName, patch);
  };

  const markRevisedToday = (subjectId: string, topicName: string) => {
    updateTopic(subjectId, topicName, { lastRevisedAt: new Date().toISOString() });
  };

  return (
    <div className="fade-in flex flex-col gap-6 pb-10">
      <SectionHeader
        title="CS Core Interview Prep"
        subtitle="DBMS, OS, CN, and OOP with confidence, revision, and interview-ready tracking"
      />

      <Card className="grid gap-4 border-border-accent/20 bg-gradient-to-r from-accentBlue/10 via-bgCard to-bgCard p-4 md:grid-cols-4">
        {subjectSummary.map((subject) => (
          <div key={subject.id}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">{subject.name}</p>
            <p className="mt-1 text-2xl font-semibold text-textPrimary">{subject.completed}/{subject.total}</p>
            <ProgressBar value={subject.pct} color="var(--accent-blue)" className="mt-3" />
          </div>
        ))}
      </Card>

      <div className="flex flex-wrap gap-2">
        {CS_SUBJECTS.map((subject) => (
          <button
            key={subject.id}
            type="button"
            onClick={() => setActiveSubject(subject.id)}
            className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
              activeSubject === subject.id
                ? 'border-accentBlue/30 bg-accentBlue/15 text-textPrimary shadow-glow-blue'
                : 'border-border-subtle bg-white/[0.04] text-textSecondary hover:text-textPrimary'
            }`}
          >
            {subject.name}
          </button>
        ))}
      </div>

      <Card className="border-border-accent/15 bg-gradient-to-r from-accentBlue/5 to-bgCard">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Active Subject</p>
            <h3 className="mt-1 text-lg font-semibold text-textPrimary">{activeSubjectData.name}</h3>
          </div>
          <Badge variant="primary">
            <BookOpenText className="mr-1 h-3.5 w-3.5" />
            {activeSubjectData.topics.length} topics
          </Badge>
        </div>
      </Card>

      <div className="grid gap-4">
        {activeSubjectData.topics.map((topic) => {
          const current: TopicState = activeProgress[topic.name] || {
            completed: false,
            confidence: 3,
            notes: '',
            interviewReady: false,
            lastRevisedAt: null,
            sampleQuestion: topic.sampleQuestion
          };

          return (
            <Card key={topic.name} className="flex flex-col gap-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className={`text-base font-semibold ${current.completed ? 'text-textSecondary line-through' : 'text-textPrimary'}`}>
                    {topic.name}
                  </h4>
                  <p className="mt-1 text-sm text-textSecondary">{topic.sampleQuestion}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={current.interviewReady ? 'success' : 'neutral'}>
                    {current.interviewReady ? 'Interview Ready' : 'In Progress'}
                  </Badge>
                  <Badge variant={current.completed ? 'primary' : 'neutral'}>
                    {current.completed ? 'Completed' : 'Pending'}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="grid gap-4">
                  <label className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-white/[0.04] px-4 py-3">
                    <input
                      type="checkbox"
                      checked={current.completed}
                      onChange={() => updateTopic(activeSubjectData.id, topic.name, { completed: !current.completed })}
                      className="h-4 w-4 rounded border-border-subtle bg-bgSurface text-accentBlue focus:ring-accentBlue/30"
                    />
                    <span className="text-sm text-textPrimary">Completed</span>
                  </label>

                  <div className="rounded-2xl border border-border-subtle bg-white/[0.04] p-4">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Confidence</span>
                      <span className="text-sm font-semibold text-textPrimary">{current.confidence}/5</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={current.confidence}
                      onChange={(e) => updateTopic(activeSubjectData.id, topic.name, { confidence: Number(e.target.value) })}
                      className="w-full accent-accentBlue"
                    />
                    <div className="mt-3 flex justify-between text-[10px] text-textMuted">
                      <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-2xl border border-border-subtle bg-white/[0.04] p-4">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Last Revised</span>
                      <span className="text-sm text-textSecondary">
                        {current.lastRevisedAt ? new Date(current.lastRevisedAt).toLocaleDateString() : 'Not revised yet'}
                      </span>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => markRevisedToday(activeSubjectData.id, topic.name)}>
                      <CalendarDays className="mr-2 h-4 w-4" />
                      Mark Revised Today
                    </Button>
                  </div>

                  <label className="rounded-2xl border border-border-subtle bg-white/[0.04] p-4">
                    <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Notes</span>
                    <textarea
                      value={current.notes}
                      onChange={(e) => updateTopic(activeSubjectData.id, topic.name, { notes: e.target.value })}
                      placeholder="Add interview notes, pitfalls, examples, and quick reminders..."
                      className="min-h-24 w-full rounded-2xl border border-border-subtle bg-bgBase/50 px-3 py-3 text-sm text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-accentBlue/30"
                    />
                  </label>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle/50 pt-4">
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="topbar-chip">
                    <ShieldCheck className="h-3.5 w-3.5 text-accentEmerald" />
                    Interview ready: {current.interviewReady ? 'Yes' : 'No'}
                  </span>
                  <span className="topbar-chip">
                    <CheckCircle2 className="h-3.5 w-3.5 text-accentBlue" />
                    Confidence: {current.confidence}/5
                  </span>
                  <span className="topbar-chip">
                    <FileText className="h-3.5 w-3.5 text-accentPurple" />
                    Sample question ready
                  </span>
                </div>

                <Button
                  type="button"
                  variant={current.interviewReady ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => updateTopic(activeSubjectData.id, topic.name, { interviewReady: !current.interviewReady })}
                >
                  {current.interviewReady ? 'Unset Interview Ready' : 'Mark Interview Ready'}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
