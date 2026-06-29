import React, { useState } from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useCareerStore } from '../app/store/useCareerStore';
import { GERMAN_LESSONS } from '../data/germanLessons';
import { GermanUnitPath } from '../components/german/GermanUnitPath';
import { GermanFlashcard } from '../components/german/GermanFlashcard';
import { GermanSRSQueue } from '../components/german/GermanSRSQueue';
import { GermanArticleTrainer } from '../components/german/GermanArticleTrainer';
import { GermanDailyChallenge } from '../components/german/GermanDailyChallenge';
import { useAIStore } from '../app/store/useAIStore';
import { useUIStore } from '../app/store/useUIStore';
import { Map, Star, GraduationCap, Sparkles, BookOpen } from 'lucide-react';

export const GermanPage: React.FC = () => {
  const careerState = useCareerStore((s) => s);
  const {
    completedLessons,
    currentLessonId,
    weakWords
  } = careerState;

  const markWordKnown = useCareerStore((s) => s.markWordKnown);
  const markWordWeak = useCareerStore((s) => s.markWordWeak);
  const queuePrompt = useAIStore((s) => s.queuePrompt);
  const setActiveSection = useUIStore((s) => s.setActiveSection);

  const [activeTab, setActiveTab] = useState<'path' | 'srs' | 'article' | 'flashcards'>('path');
  const [selectedLessonId, setSelectedLessonId] = useState<string>(currentLessonId || 'german-1');
  const [selectedWordIdx, setSelectedWordIdx] = useState(0);

  const lessons = GERMAN_LESSONS;
  const activeLesson = lessons.find((l) => l.id === selectedLessonId) || lessons[0];
  const lessonVocabulary = activeLesson.vocabulary || [];
  const currentWord = lessonVocabulary[selectedWordIdx] || lessonVocabulary[0];

  const askShayla = (prompt: string) => {
    queuePrompt(prompt);
    setActiveSection('ai');
  };

  const handleLessonCompleteToggle = () => {
    const isCompleted = completedLessons[activeLesson.id]?.completed;
    if (isCompleted) {
      // mark incomplete
      useCareerStore.setState((state) => {
        const nextCompleted = { ...state.completedLessons };
        delete nextCompleted[activeLesson.id];
        return { completedLessons: nextCompleted };
      });
    } else {
      // complete lesson
      useCareerStore.getState().completeGermanLesson(activeLesson.id, lessonVocabulary.length, 30);
    }
  };

  return (
    <div className="flex flex-col gap-6 fade-in pb-10">
      <SectionHeader
        title="German Hub 2.0"
        subtitle="Spaced repetition learning, noun articles, lesson paths, and interactive speech training."
      />

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Main learning hub */}
        <div className="xl:col-span-3 flex flex-col gap-6">
          {/* Tab Selector */}
          <div className="flex gap-2 border-b border-border-subtle pb-3">
            <button
              onClick={() => setActiveTab('path')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 ${
                activeTab === 'path'
                  ? 'bg-accentBlue/10 text-accentBlue border border-accentBlue/20'
                  : 'text-textSecondary hover:text-textPrimary'
              }`}
            >
              <Map className="h-4 w-4" /> Units Map
            </button>
            <button
              onClick={() => setActiveTab('srs')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 ${
                activeTab === 'srs'
                  ? 'bg-accentBlue/10 text-accentBlue border border-accentBlue/20'
                  : 'text-textSecondary hover:text-textPrimary'
              }`}
            >
              <Star className="h-4 w-4" /> SRS Queue ({weakWords.length} due)
            </button>
            <button
              onClick={() => setActiveTab('article')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 ${
                activeTab === 'article'
                  ? 'bg-accentBlue/10 text-accentBlue border border-accentBlue/20'
                  : 'text-textSecondary hover:text-textPrimary'
              }`}
            >
              <GraduationCap className="h-4 w-4" /> Noun Articles
            </button>
            {lessonVocabulary.length > 0 && (
              <button
                onClick={() => setActiveTab('flashcards')}
                className={`px-4 py-2 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 ${
                  activeTab === 'flashcards'
                    ? 'bg-accentBlue/10 text-accentBlue border border-accentBlue/20'
                    : 'text-textSecondary hover:text-textPrimary'
                }`}
              >
                <BookOpen className="h-4 w-4" /> Flashcards
              </button>
            )}
          </div>

          {/* Tab Contents */}
          <div className="flex flex-col gap-6">
            {activeTab === 'path' && (
              <GermanUnitPath
                completedLessons={completedLessons}
                currentLessonId={currentLessonId}
                onSelectLesson={(id) => {
                  setSelectedLessonId(id);
                  setSelectedWordIdx(0);
                }}
              />
            )}

            {activeTab === 'srs' && (
              <GermanSRSQueue weakWords={weakWords} />
            )}

            {activeTab === 'article' && (
              <GermanArticleTrainer />
            )}

            {activeTab === 'flashcards' && currentWord && (
              <div className="flex flex-col gap-4">
                <GermanFlashcard
                  word={currentWord}
                  isWeak={weakWords.includes(currentWord.id)}
                  onMarkWeak={() => markWordWeak(currentWord.id)}
                  onMarkKnown={() => markWordKnown(currentWord.id)}
                />
                <div className="flex justify-between items-center gap-4 mt-2 max-w-sm mx-auto w-full">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={selectedWordIdx === 0}
                    onClick={() => setSelectedWordIdx(selectedWordIdx - 1)}
                    className="text-xs"
                  >
                    ← Previous
                  </Button>
                  <span className="text-[11px] text-textMuted font-mono">
                    {selectedWordIdx + 1} / {lessonVocabulary.length}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={selectedWordIdx === lessonVocabulary.length - 1}
                    onClick={() => setSelectedWordIdx(selectedWordIdx + 1)}
                    className="text-xs"
                  >
                    Next →
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="xl:col-span-1 flex flex-col gap-6">
          <GermanDailyChallenge />

          {/* Lesson Details Details */}
          <Card className="flex flex-col gap-4">
            <div className="flex justify-between items-start gap-3 border-b border-white/5 pb-2">
              <div>
                <span className="text-[10px] text-textMuted font-bold uppercase tracking-wider block">
                  Active Lesson
                </span>
                <h4 className="text-sm font-bold text-textPrimary">{activeLesson.title}</h4>
              </div>
              <Badge variant={completedLessons[activeLesson.id]?.completed ? 'success' : 'neutral'}>
                {completedLessons[activeLesson.id]?.completed ? 'Completed' : 'Study Now'}
              </Badge>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[9px] text-textMuted font-bold uppercase">Lesson Objective:</span>
              <p className="text-xs text-textSecondary leading-relaxed">{activeLesson.objective}</p>
            </div>

            {/* Grammar Points list */}
            {activeLesson.grammar && activeLesson.grammar.length > 0 && (
              <div className="flex flex-col gap-2 border-t border-white/5 pt-3">
                <span className="text-[9px] text-textMuted font-bold uppercase">Grammar Focus:</span>
                <div className="flex flex-col gap-2">
                  {activeLesson.grammar.map((gram, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-white/[0.02] border border-border-subtle text-xs">
                      <span className="font-bold text-textPrimary block mb-1">{gram.title}</span>
                      <p className="text-textSecondary leading-snug">{gram.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Culture Tip */}
            {activeLesson.cultureTip && (
              <div className="p-3.5 rounded-xl border border-accentBlue/20 bg-accentBlue/5 text-xs">
                <span className="text-[9px] text-accentBlue font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                  <Sparkles className="h-3.5 w-3.5" /> Cultural Insight
                </span>
                <p className="text-textSecondary leading-relaxed">{activeLesson.cultureTip}</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col gap-2 pt-3 border-t border-white/5">
              <Button
                size="sm"
                variant={completedLessons[activeLesson.id]?.completed ? 'outline' : 'primary'}
                onClick={handleLessonCompleteToggle}
                className="w-full text-xs"
              >
                {completedLessons[activeLesson.id]?.completed ? '✓ Completed' : 'Complete Lesson & Earn +30 XP'}
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => askShayla(`Help me practice German for Lesson "${activeLesson.title}". Objective: ${activeLesson.objective}. Prompt me with 3 A1 basic dialogue sentences for me to translate.`)}
                className="w-full text-xs text-accentBlue"
              >
                💬 Open Shayla German Tutor
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
