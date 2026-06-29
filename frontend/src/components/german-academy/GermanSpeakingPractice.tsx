import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { GermanPronunciationFeedback } from './GermanPronunciationFeedback';
import { GermanSpeakingHistory, SpeakingHistoryItem } from './GermanSpeakingHistory';
import { useCareerStore } from '../../app/store/useCareerStore';

const prompts = [
  'Stell dich bitte vor.',
  'Sag deinen heutigen Satz.',
  'Beschreibe dein College.',
  'Beschreibe dein Ziel.',
  'German interview mini-practice',
];

export const GermanSpeakingPractice: React.FC = () => {
  const logGermanSpeakingSession = useCareerStore((s) => s.logGermanSpeakingSession);
  const speakingStreak = useCareerStore((s) => s.germanSpeakingStreak || s.germanStreak || 0);
  const [prompt, setPrompt] = useState(prompts[0]);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(3);
  const [history, setHistory] = useState<SpeakingHistoryItem[]>([]);
  const [listening, setListening] = useState(false);
  const [supportWarning, setSupportWarning] = useState('');
  const [repetitionCount, setRepetitionCount] = useState(0);
  const recognitionRef = useRef<any>(null);
  const startRef = useRef<number | null>(null);
  const transcriptRef = useRef('');
  const support = typeof window !== 'undefined' && Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  useEffect(() => {
    if (!support) {
      setSupportWarning('Speech recognition unavailable in this browser.');
    }
  }, [support]);

  const wordsMatched = useMemo(() => {
    const lower = transcript.toLowerCase();
    return ['ich', 'bin', 'heute', 'mein', 'und', 'deutsch', 'lernen'].filter((word) => lower.includes(word)).length;
  }, [transcript]);

  const sentenceComplete = useMemo(() => {
    const words = transcript.trim().split(/\s+/).filter(Boolean).length;
    return Math.min(5, Math.max(1, Math.round(words / 6)));
  }, [transcript]);

  const start = () => {
    if (!support || listening) return;
    const Ctor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new Ctor();
    recognition.lang = 'de-DE';
    recognition.interimResults = true;
    recognition.continuous = true;
    recognitionRef.current = recognition;
    startRef.current = Date.now();
    transcriptRef.current = '';
    setListening(true);
    setSupportWarning('');
    recognition.onresult = (event: any) => {
      const nextTranscript = Array.from(event.results).map((result: any) => result[0]?.transcript || '').join(' ');
      transcriptRef.current = nextTranscript;
      setTranscript(nextTranscript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => {
      setListening(false);
      setSupportWarning('Voice capture stopped with an error.');
    };
    recognition.start();
  };

  const stop = () => {
    recognitionRef.current?.stop?.();
    setListening(false);
    if (startRef.current) {
      const minutes = Math.max(1, Math.round((Date.now() - startRef.current) / 60000));
      logGermanSpeakingSession(minutes);
      setHistory((current) => [
        {
          phrase: transcriptRef.current || transcript,
          minutes,
          confidence,
          mode: prompt,
          createdAt: new Date().toISOString(),
        },
        ...current
      ].slice(0, 12));
      setRepetitionCount((count) => count + 1);
    }
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
      <Card className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Speaking practice</p>
            <h3 className="mt-1 text-lg font-semibold text-textPrimary">Browser speech practice</h3>
          </div>
          <Badge variant={support ? 'success' : 'warning'}>{support ? 'SpeechRecognition ready' : 'Text fallback'}</Badge>
        </div>
        <p className="text-xs text-textSecondary">Browser-based approximate speaking feedback, not certified pronunciation scoring.</p>
        {supportWarning && <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-3 text-sm text-amber-200">{supportWarning}</div>}
        <div className="flex flex-wrap gap-2">
          {prompts.map((item) => (
            <Button key={item} variant={prompt === item ? 'primary' : 'outline'} size="sm" onClick={() => setPrompt(item)}>
              {item}
            </Button>
          ))}
        </div>
        <Input value={prompt} onChange={(e) => setPrompt(e.target.value)} label="Practice prompt" />
        <textarea
          value={transcript}
          onChange={(event) => setTranscript(event.target.value)}
          rows={6}
          placeholder="Speak or type your answer here."
          className="resize-none rounded-2xl border border-border-subtle bg-white/[0.03] px-4 py-3 text-sm text-textPrimary placeholder:text-textMuted/70 focus:border-accentBlue focus:outline-none"
        />
        <div className="flex flex-wrap gap-2">
          <Button variant={listening ? 'danger' : 'primary'} onClick={listening ? stop : start}>
            {listening ? 'Stop speaking' : 'Start speaking'}
          </Button>
          <Button variant="outline" onClick={() => { setTranscript(''); setRepetitionCount(0); }}>
            Clear
          </Button>
          <Badge variant="neutral">Speaking streak {speakingStreak} days</Badge>
        </div>
      </Card>
      <div className="grid gap-4">
        <GermanPronunciationFeedback
          confidenceRating={confidence}
          wordsMatched={wordsMatched}
          sentenceComplete={sentenceComplete}
          repetitionCount={repetitionCount}
        />
        <Card className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Self-rating</p>
            <Badge variant="primary">{confidence}/5</Badge>
          </div>
          <input type="range" min={1} max={5} value={confidence} onChange={(e) => setConfidence(Number(e.target.value))} className="w-full accent-[#8B5CF6]" />
        </Card>
        <GermanSpeakingHistory items={history} />
      </div>
    </div>
  );
};

