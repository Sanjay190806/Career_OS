import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Input } from '../components/ui/Input';
import { useCareerStore } from '../app/store/useCareerStore';

export const AptitudePage: React.FC = () => {
  const careerState = useCareerStore((s) => s);
  const aptitudeProgress = careerState.aptitudeProgress || {};
  const updateAptitudeCategory = useCareerStore((s) => s.updateAptitudeCategory);

  const [questions, setQuestions] = useState<number>(0);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const aptCategories = [
    "Number System", "Percentages", "Profit and Loss", "Simple Interest", "Compound Interest",
    "Ratio and Proportion", "Time and Work", "Time, Speed and Distance", "Averages", "Mixtures",
    "Permutations and Combinations", "Probability", "Data Interpretation", "Logical Reasoning",
    "Blood Relations", "Direction Sense", "Coding-Decoding", "Syllogism", "Puzzles", "Verbal Ability"
  ];

  const handleSolvedChange = (cat: string, val: number) => {
    const current = aptitudeProgress[cat] || { questionsSolved: 0, accuracy: 100, confidence: 3, completed: false, notes: '' };
    updateAptitudeCategory(cat, { questionsSolved: Math.max(0, current.questionsSolved + val) });
  };

  const handleToggleCompleted = (cat: string) => {
    const current = aptitudeProgress[cat] || { questionsSolved: 0, accuracy: 100, confidence: 3, completed: false, notes: '' };
    updateAptitudeCategory(cat, { completed: !current.completed });
  };

  const handleSaveAccuracy = (cat: string) => {
    updateAptitudeCategory(cat, { accuracy: questions });
    setActiveCategory(null);
    setQuestions(0);
  };

  const totalCompleted = aptCategories.filter(c => aptitudeProgress[c]?.completed).length;
  const progressPercent = Math.round((totalCompleted / aptCategories.length) * 100);

  return (
    <div className="flex flex-col gap-6 fade-in pb-10 select-none">
      <SectionHeader
        title="Aptitude Practice Board"
        subtitle="Track questions solved, correct/wrong percentages, and category completeness"
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
        {/* Categories panel */}
        <Card className="lg:col-span-2 flex flex-col gap-4">
          <span className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider block pl-0.5 border-b border-border-subtle/50 pb-2">Aptitude Categories</span>
          
          <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
            {aptCategories.map((cat) => {
              const current = aptitudeProgress[cat] || { questionsSolved: 0, accuracy: 100, confidence: 3, completed: false, notes: '' };
              return (
                <div key={cat} className="flex flex-col gap-2 p-3 bg-bgSurface/40 border border-border-subtle rounded-xl">
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={current.completed}
                        onChange={() => handleToggleCompleted(cat)}
                        className="w-4 h-4 rounded border-border-subtle bg-bgSurface text-accentBlue focus:ring-accentBlue/30 focus:ring-1 cursor-pointer"
                      />
                      <span className={`font-bold ${current.completed ? 'text-textSecondary line-through' : 'text-textPrimary'}`}>
                        {cat}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button onClick={() => handleSolvedChange(cat, -5)} className="px-1.5 py-0.5 bg-bgSurface border border-border-subtle rounded font-bold text-[10px]">-5</button>
                      <span className="font-mono font-bold text-textPrimary text-xs">{current.questionsSolved} solved</span>
                      <button onClick={() => handleSolvedChange(cat, 5)} className="px-1.5 py-0.5 bg-bgSurface border border-border-subtle rounded font-bold text-[10px]">+5</button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[9px] text-textMuted font-mono mt-1 border-t border-border-subtle/30 pt-2 pl-0.5">
                    <button
                      onClick={() => {
                        setActiveCategory(cat);
                        setQuestions(current.accuracy || 100);
                      }}
                      className="hover:text-textPrimary text-[9px]"
                    >
                      🎯 Accuracy: {current.accuracy}% (Edit)
                    </button>
                    {current.notes && <span className="truncate max-w-[200px]">{current.notes}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Accuracy Edit panel */}
        {activeCategory && (
          <Card className="flex flex-col justify-between p-4 h-[180px]">
            <div>
              <span className="text-[10px] font-bold text-textSecondary uppercase tracking-wider block mb-3 pl-0.5">Edit Accuracy %: {activeCategory}</span>
              <Input
                type="number"
                value={questions}
                onChange={(e) => setQuestions(parseInt(e.target.value))}
                placeholder="Accuracy % e.g. 85"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => handleSaveAccuracy(activeCategory)} className="flex-1 text-[10px] py-1.5 rounded-xl">Save Accuracy</Button>
              <Button onClick={() => setActiveCategory(null)} variant="ghost" className="px-3 text-[10px] border border-border-subtle rounded-xl">Cancel</Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
