import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface FocusTimerProps {
  onSessionComplete: (minutes: number) => void;
}

const TIMER_STORAGE_KEY = 'sanzz_os_focus_timer_minutes_v1';
const DEFAULT_DURATION_MINUTES = 25;
const MIN_DURATION_MINUTES = 1;
const MAX_DURATION_MINUTES = 180;
const PRESET_MINUTES = [15, 25, 45, 60];

function clampDuration(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_DURATION_MINUTES;
  return Math.min(Math.max(Math.round(value), MIN_DURATION_MINUTES), MAX_DURATION_MINUTES);
}

function loadSavedDuration(): number {
  try {
    return clampDuration(Number(localStorage.getItem(TIMER_STORAGE_KEY)) || DEFAULT_DURATION_MINUTES);
  } catch {
    return DEFAULT_DURATION_MINUTES;
  }
}

export const FocusTimer: React.FC<FocusTimerProps> = ({ onSessionComplete }) => {
  const [durationMinutes, setDurationMinutes] = useState(loadSavedDuration);
  const [seconds, setSeconds] = useState(() => durationMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const updateDuration = (minutes: number) => {
    const nextDuration = clampDuration(minutes);
    setDurationMinutes(nextDuration);
    if (!isActive) {
      setSeconds(nextDuration * 60);
    }
    try {
      localStorage.setItem(TIMER_STORAGE_KEY, String(nextDuration));
    } catch {
      // Timer remains usable even if localStorage is unavailable.
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setSeconds(durationMinutes * 60);
  };

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsActive(false);
            onSessionComplete(durationMinutes);
            return durationMinutes * 60;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [durationMinutes, isActive, onSessionComplete]);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <Card className="flex flex-col items-center justify-center p-6 text-center border-border-accent/20 bg-gradient-to-b from-bgCard/70 to-bgCard/30">
      <span className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider mb-2">Focus Timer</span>
      
      <div className="text-4xl font-extrabold text-textPrimary font-mono my-2 tracking-widest">
        {formatTime(seconds)}
      </div>

      <div className="mt-3 w-full space-y-3">
        <label className="block text-left text-[10px] font-semibold uppercase tracking-wider text-textMuted">
          Minutes
          <input
            type="number"
            min={MIN_DURATION_MINUTES}
            max={MAX_DURATION_MINUTES}
            value={durationMinutes}
            disabled={isActive}
            onChange={(event) => updateDuration(Number(event.target.value))}
            className="mt-1 w-full rounded-xl border border-border-subtle bg-bgSurface/60 px-3 py-2 text-center text-sm font-semibold text-textPrimary outline-none focus:border-accentBlue disabled:opacity-60"
          />
        </label>

        <div className="grid grid-cols-4 gap-2">
          {PRESET_MINUTES.map((minutes) => (
            <button
              key={minutes}
              type="button"
              disabled={isActive}
              onClick={() => updateDuration(minutes)}
              className={`h-8 rounded-lg border text-xs font-semibold transition disabled:opacity-50 ${
                durationMinutes === minutes
                  ? 'border-accentBlue bg-accentBlue/20 text-textPrimary'
                  : 'border-border-subtle text-textSecondary hover:border-accentBlue/50'
              }`}
            >
              {minutes}m
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 mt-4 w-full">
        <Button
          onClick={toggleTimer}
          variant={isActive ? "outline" : "primary"}
          className="flex-1 text-xs py-2 rounded-xl"
        >
          {isActive ? "Pause" : `Start ${durationMinutes}m`}
        </Button>
        <Button
          onClick={resetTimer}
          variant="ghost"
          className="px-3 border border-border-subtle rounded-xl text-xs"
        >
          Reset
        </Button>
      </div>
    </Card>
  );
};
