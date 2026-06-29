import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useCareerStore } from '../../app/store/useCareerStore';
import { GERMAN_LESSONS } from '../../data/germanLessons';
import { CheckCircle2, AlertTriangle, Volume2 } from 'lucide-react';

interface GermanSRSQueueProps {
  weakWords: string[];
}

export const GermanSRSQueue: React.FC<GermanSRSQueueProps> = ({ weakWords }) => {
  const vocabProgress = useCareerStore((s) => s.vocabulary || {});
  const submitWordReview = useCareerStore((s) => s.submitWordReview);

  // Retrieve vocabulary objects from lessons using IDs
  const allVocabItems = GERMAN_LESSONS.flatMap((lesson) => lesson.vocabulary || []);
  const dueItems = allVocabItems.filter((v) => {
    const progress = vocabProgress[v.id];
    return progress?.status === 'review' || weakWords.includes(v.id);
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [, setCorrect] = useState(false);

  const activeItem = dueItems[currentIndex];

  // Pick 3 distractor meanings from allVocabItems
  const getOptions = (correctMeaning: string) => {
    const distractors = allVocabItems
      .filter((v) => v.meaning !== correctMeaning)
      .map((v) => v.meaning);
    const uniqueDistractors = Array.from(new Set(distractors)).slice(0, 3);
    const combined = [correctMeaning, ...uniqueDistractors];
    // Simple sort to shuffle options
    return combined.sort();
  };

  const handleAnswer = (option: string) => {
    if (answered) return;
    const isCorrect = option === activeItem.meaning;
    setCorrect(isCorrect);
    setAnswered(true);
    setSelectedOption(option);

    // Update spacing stage in store
    submitWordReview(activeItem.id, isCorrect);
  };

  const handleNext = () => {
    setAnswered(false);
    setSelectedOption(null);
    if (currentIndex < dueItems.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const speakWord = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'de-DE';
      window.speechSynthesis.speak(utterance);
    }
  };

  if (dueItems.length === 0) {
    return (
      <Card className="py-12 text-center text-textSecondary flex flex-col items-center justify-center">
        <span className="text-3xl mb-2">🎉</span>
        <span className="text-sm font-bold text-textPrimary">Your SRS Queue is Empty!</span>
        <p className="text-xs text-textMuted max-w-[280px] mt-1 leading-snug">
          Amazing study! You have no weak or review vocabulary items scheduled for today.
        </p>
      </Card>
    );
  }

  const options = getOptions(activeItem.meaning);

  return (
    <Card className="flex flex-col gap-4 border-accentBlue/20 bg-accentBlue/5">
      <div className="flex justify-between items-center border-b border-white/5 pb-2">
        <span className="text-[10px] text-textMuted font-bold uppercase tracking-wider">
          Spaced Repetition Review ({currentIndex + 1} / {dueItems.length})
        </span>
        <Badge variant="primary">Stage {vocabProgress[activeItem.id]?.reviewStage || 0}</Badge>
      </div>

      <div className="text-center py-4 flex flex-col gap-2">
        <span className="text-[10px] text-textMuted font-bold uppercase tracking-widest">
          What is the meaning of:
        </span>
        <h2 className="text-2xl font-black text-textPrimary flex items-center justify-center gap-2">
          {activeItem.word}
          <button
            onClick={() => speakWord(activeItem.word)}
            className="p-1 rounded-full hover:bg-white/5 text-textMuted hover:text-textPrimary transition"
            title="Listen Voice"
          >
            <Volume2 className="h-4 w-4" />
          </button>
        </h2>
        <span className="text-xs text-textMuted italic font-mono">{activeItem.pronunciationHint}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {options.map((opt) => {
          const isSelected = selectedOption === opt;
          const isCorrectAnswer = opt === activeItem.meaning;
          
          let btnClass = 'border-border-subtle bg-bgSurface/20 text-textSecondary hover:bg-bg-glass-hover';
          if (answered) {
            if (isCorrectAnswer) {
              btnClass = 'border-accentEmerald bg-accentEmerald/10 text-accentEmerald font-semibold';
            } else if (isSelected) {
              btnClass = 'border-accentRed bg-accentRed/10 text-accentRed font-semibold';
            } else {
              btnClass = 'border-border-subtle bg-bgSurface/10 text-textMuted opacity-50';
            }
          }

          return (
            <button
              key={opt}
              disabled={answered}
              onClick={() => handleAnswer(opt)}
              className={`p-3 rounded-xl border text-xs text-left transition flex items-center justify-between ${btnClass}`}
            >
              <span>{opt}</span>
              {answered && isCorrectAnswer && <CheckCircle2 className="h-4 w-4 text-accentEmerald" />}
              {answered && isSelected && !isCorrectAnswer && <AlertTriangle className="h-4 w-4 text-accentRed" />}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="flex flex-col gap-3 mt-2 pt-3 border-t border-white/5 animate-fadeIn">
          <div className="text-xs text-textSecondary leading-relaxed">
            <strong>Example Context:</strong> {activeItem.exampleSentence}
          </div>
          <Button size="sm" variant="primary" onClick={handleNext} className="w-full text-xs">
            Next Word
          </Button>
        </div>
      )}
    </Card>
  );
};
