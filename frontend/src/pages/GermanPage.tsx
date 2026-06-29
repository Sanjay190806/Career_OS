import React, { useEffect, useMemo, useState } from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { GermanAcademyTabs, GermanAcademyTab } from '../components/german-academy/GermanAcademyTabs';
import { GermanAcademyHero } from '../components/german-academy/GermanAcademyHero';
import { CEFRProgressCard } from '../components/german-academy/CEFRProgressCard';
import { GermanDailyGoalCard } from '../components/german-academy/GermanDailyGoalCard';
import { GermanProgressSnapshotCard } from '../components/german-academy/GermanProgressSnapshotCard';
import { GermanStoryCard } from '../components/german-academy/GermanStoryCard';
import { GermanStoryReader } from '../components/german-academy/GermanStoryReader';
import { GermanSpeakingPractice } from '../components/german-academy/GermanSpeakingPractice';
import { GermanListeningPractice } from '../components/german-academy/GermanListeningPractice';
import { GermanConversationPanel } from '../components/german-academy/GermanConversationPanel';
import { GermanSRSReview } from '../components/german-academy/GermanSRSReview';
import { GermanWeakWordsPanel } from '../components/german-academy/GermanWeakWordsPanel';
import { GermanLessonDrawer } from '../components/german/GermanLessonDrawer';
import { GermanUnitPath } from '../components/german/GermanUnitPath';
import { GermanSRSQueue } from '../components/german/GermanSRSQueue';
import { GermanDailyChallenge } from '../components/german/GermanDailyChallenge';
import { MobileGermanQuickPractice } from '../components/mobile/MobileGermanQuickPractice';
import { useCareerStore } from '../app/store/useCareerStore';
import { GERMAN_LESSONS } from '../data/germanLessons';
import { GERMAN_STORIES, GermanStory } from '../data/germanStories';
import { deriveGermanCEFRTrack, getGermanProgressSnapshot } from '../utils/germanProgressUtils';
import { BookOpen, Flame, Languages, Mic, PlayCircle } from 'lucide-react';

export const GermanPage: React.FC = () => {
  const careerState = useCareerStore((s) => s);
  const updateGermanLessonNotes = useCareerStore((s) => s.updateGermanLessonNotes);
  const completeGermanLesson = useCareerStore((s) => s.completeGermanLesson);
  const completeGermanQuiz = useCareerStore((s) => s.completeGermanQuiz);
  const markWordKnown = useCareerStore((s) => s.markWordKnown);
  const markWordWeak = useCareerStore((s) => s.markWordWeak);
  const currentLessonId = useCareerStore((s) => s.currentLessonId);

  const [activeTab, setActiveTab] = useState<GermanAcademyTab>('academy');
  const [selectedLessonId, setSelectedLessonId] = useState<string>(currentLessonId || 'german-1');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<GermanStory | null>(GERMAN_STORIES[0]);
  const [selectedWordIdx, setSelectedWordIdx] = useState(0);

  const activeLesson = useMemo(
    () => GERMAN_LESSONS.find((lesson) => lesson.id === selectedLessonId) || GERMAN_LESSONS[0],
    [selectedLessonId]
  );
  const lessonProgress = careerState.completedLessons[activeLesson.id];
  const lessonNotes = lessonProgress?.notes || '';
  const selectedWord = activeLesson.vocabulary[selectedWordIdx] || activeLesson.vocabulary[0];
  const snapshot = getGermanProgressSnapshot(careerState);
  const track = deriveGermanCEFRTrack(careerState);
  const grammarTopics = typeof snapshot.grammarTopics === 'number' ? snapshot.grammarTopics : 0;

  useEffect(() => {
    if (currentLessonId) {
      setSelectedLessonId(currentLessonId);
    }
  }, [currentLessonId]);

  useEffect(() => {
    if (activeTab === 'speaking') {
      // keep the latest speaking view centered in case the user jumps in from another area
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeTab]);

  const openLesson = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    setDrawerOpen(true);
  };

  const handleLessonComplete = () => {
    completeGermanLesson(activeLesson.id, activeLesson.vocabulary.length, activeLesson.xpReward);
    setDrawerOpen(false);
  };

  const handleQuizSubmit = (lessonId: string, score: number, total: number, quizType = 'academy-quiz') => {
    completeGermanQuiz(lessonId, score, total, quizType);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'academy':
        return (
          <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <GermanAcademyHero
              level={careerState.germanLevel}
              streak={careerState.germanStreak}
              speakingStreak={careerState.germanSpeakingStreak}
              readiness={snapshot.readiness}
              onJumpSpeaking={() => setActiveTab('speaking')}
              onJumpListening={() => setActiveTab('listening')}
            />
            <div className="grid gap-4">
              <CEFRProgressCard
                track={track}
                lessonsCompleted={snapshot.lessonsCompleted}
                vocabularyKnown={snapshot.vocabularyKnown}
                speakingSessions={snapshot.speakingSessions}
                listeningSessions={snapshot.listeningSessions}
                grammarTopics={grammarTopics}
                readiness={snapshot.readiness}
              />
              <GermanDailyGoalCard
                speakingMinutes={careerState.germanSpeakingMinutes}
                listeningMinutes={careerState.germanListeningMinutes}
                reviewedToday={careerState.germanVocabularyReviewedToday}
              />
              <GermanProgressSnapshotCard
                title="Progress snapshot"
                label="German focus blend"
                value={snapshot.readiness}
                details={[
                  `Speaking streak: ${snapshot.speakingStreak} days`,
                  `Speaking minutes: ${snapshot.speakingMinutes}`,
                  `Listening minutes: ${snapshot.listeningMinutes}`,
                  `Grammar notes: ${snapshot.grammarTopics}`,
                ]}
              />
            </div>
          </div>
        );
      case 'lessons':
        return (
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="flex flex-col gap-4">
              <GermanUnitPath
                completedLessons={careerState.completedLessons}
                currentLessonId={careerState.currentLessonId}
                onSelectLesson={(lessonId) => {
                  setSelectedLessonId(lessonId);
                  setDrawerOpen(true);
                }}
              />
            </div>
            <div className="flex flex-col gap-4">
              <Card className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Current lesson</p>
                    <h3 className="mt-1 text-lg font-semibold text-textPrimary">{activeLesson.title}</h3>
                  </div>
                  <Badge variant={lessonProgress?.completed ? 'success' : 'primary'}>
                    {lessonProgress?.completed ? 'Completed' : 'Open'}
                  </Badge>
                </div>
                <p className="text-sm leading-6 text-textSecondary">{activeLesson.objective}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="neutral">{activeLesson.level}</Badge>
                  <Badge variant="neutral">{activeLesson.estimatedMinutes} min</Badge>
                  <Badge variant="primary">+{activeLesson.xpReward} XP</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="primary" onClick={() => setDrawerOpen(true)} className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    Open lesson
                  </Button>
                  <Button variant="outline" onClick={() => (lessonProgress?.completed ? setDrawerOpen(true) : handleLessonComplete())}>
                    {lessonProgress?.completed ? 'Reopen for review' : 'Complete lesson'}
                  </Button>
                </div>
              </Card>
              <GermanDailyChallenge />
            </div>
          </div>
        );
      case 'vocabulary':
        return (
          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="flex flex-col gap-4">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {activeLesson.vocabulary.map((word, index) => {
                  const isWeak = careerState.weakWords.includes(word.id);
                  const isKnown = careerState.vocabulary[word.id]?.status === 'known';
                  return (
                    <button
                      key={word.id}
                      type="button"
                      onClick={() => setSelectedWordIdx(index)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        selectedWordIdx === index
                          ? 'border-accentBlue bg-accentBlue/10'
                          : 'border-border-subtle bg-white/[0.03] hover:border-border-accent'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-textPrimary">{word.word}</p>
                        <Badge variant={isKnown ? 'success' : isWeak ? 'warning' : 'neutral'}>
                          {isKnown ? 'Known' : isWeak ? 'Review' : 'Learn'}
                        </Badge>
                      </div>
                      <p className="mt-2 text-xs text-textSecondary">{word.meaning}</p>
                    </button>
                  );
                })}
              </div>

              {selectedWord && (
                <Card className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Flashcard</p>
                      <h3 className="mt-1 text-xl font-semibold text-textPrimary">{selectedWord.word}</h3>
                    </div>
                    <Badge variant="primary">{selectedWord.category}</Badge>
                  </div>
                  <p className="text-sm text-textSecondary">{selectedWord.meaning}</p>
                  <p className="text-sm leading-6 text-textPrimary">{selectedWord.exampleSentence}</p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="primary" onClick={() => markWordKnown(selectedWord.id)}>
                      Mark known
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => markWordWeak(selectedWord.id)}>
                      Mark weak
                    </Button>
                  </div>
                </Card>
              )}
            </div>
            <div className="flex flex-col gap-4">
              <GermanSRSQueue weakWords={careerState.weakWords} />
            </div>
          </div>
        );
      case 'speaking':
        return <GermanSpeakingPractice />;
      case 'listening':
        return <GermanListeningPractice />;
      case 'stories':
        return (
          <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="grid gap-3">
              {GERMAN_STORIES.map((story) => (
                <GermanStoryCard
                  key={story.id}
                  story={story}
                  onExplain={(item) => {
                    setSelectedStory(item);
                    setActiveTab('conversation');
                  }}
                />
              ))}
            </div>
            <GermanStoryReader story={selectedStory} />
          </div>
        );
      case 'conversation':
        return <GermanConversationPanel />;
      case 'review':
        return (
          <div className="grid gap-4">
            <GermanSRSReview />
            <GermanWeakWordsPanel />
            <Card className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Lesson review</p>
                  <h3 className="mt-1 text-lg font-semibold text-textPrimary">Reopen any completed lesson</h3>
                </div>
                <Badge variant="neutral">{Object.values(careerState.completedLessons).filter((lesson) => lesson.completed).length} done</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {GERMAN_LESSONS.filter((lesson) => careerState.completedLessons[lesson.id]?.completed).slice(0, 8).map((lesson) => (
                  <Button key={lesson.id} size="sm" variant="outline" onClick={() => openLesson(lesson.id)}>
                    {lesson.title}
                  </Button>
                ))}
              </div>
            </Card>
          </div>
        );
      case 'progress':
        return (
          <div className="grid gap-4 xl:grid-cols-2">
            <CEFRProgressCard
              track={track}
              lessonsCompleted={snapshot.lessonsCompleted}
              vocabularyKnown={snapshot.vocabularyKnown}
              speakingSessions={snapshot.speakingSessions}
              listeningSessions={snapshot.listeningSessions}
              grammarTopics={grammarTopics}
              readiness={snapshot.readiness}
            />
            <GermanProgressSnapshotCard
              title="Milestones"
              label="What moved recently"
              value={snapshot.readiness}
              details={[
                `Lessons completed: ${snapshot.lessonsCompleted}`,
                `Vocabulary known: ${snapshot.vocabularyKnown}`,
                `Speaking sessions: ${snapshot.speakingSessions}`,
                `Listening sessions: ${snapshot.listeningSessions}`,
              ]}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-10 fade-in">
      <SectionHeader
        title="German Academy 3.0"
        subtitle="Lessons, speaking, listening, stories, conversation, and review in one place."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="primary" className="gap-1">
              <Languages className="h-3.5 w-3.5" />
              {careerState.germanLevel}
            </Badge>
            <Badge variant="warning" className="gap-1">
              <Flame className="h-3.5 w-3.5" />
              {careerState.germanStreak} days
            </Badge>
            <Badge variant="neutral" className="gap-1">
              <PlayCircle className="h-3.5 w-3.5" />
              {careerState.germanSpeakingSessions} speaking sessions
            </Badge>
            <Badge variant="neutral" className="gap-1">
              <Mic className="h-3.5 w-3.5" />
              {careerState.germanListeningSessions} listening sessions
            </Badge>
          </div>
        }
      />

      <GermanAcademyTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <MobileGermanQuickPractice />

      {renderContent()}

      <GermanLessonDrawer
        lesson={activeLesson}
        isOpen={drawerOpen}
        notes={lessonNotes}
        onClose={() => setDrawerOpen(false)}
        onNotesChange={(notes) => updateGermanLessonNotes(activeLesson.id, notes)}
        onCompleteLesson={handleLessonComplete}
        onSubmitQuiz={handleQuizSubmit}
      />
    </div>
  );
};
