import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useCareerStore } from '../../app/store/useCareerStore';
import { getTodayDay } from '../../utils/dateUtils';

const TIMER_STORAGE_KEY = 'sanzz_os_focus_timer_minutes_v1';
const DEFAULT_DURATION_MINUTES = 25;
const MIN_DURATION_MINUTES = 1;
const MAX_DURATION_MINUTES = 180;
const PRESET_MINUTES = [15, 25, 45, 60, 90];

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

export const FocusHistory: React.FC = () => {
  const userProfile = useCareerStore((s) => s.userProfile);
  const dailyLogs = useCareerStore((s) => s.dailyLogs);
  const updateDailyLog = useCareerStore((s) => s.updateDailyLog);

  const currentDay = getTodayDay(userProfile.startDate);
  const currentLog = dailyLogs[currentDay] || { focusMinutes: 0 };

  // Timer specific settings
  const [duration, setDuration] = useState(loadSavedDuration);
  const [seconds, setSeconds] = useState(() => duration * 60);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const handleSelectDuration = (mins: number) => {
    const nextDuration = clampDuration(mins);
    setDuration(nextDuration);
    if (!isActive) {
      setSeconds(nextDuration * 60);
    }
    try {
      localStorage.setItem(TIMER_STORAGE_KEY, String(nextDuration));
    } catch {
      // Timer remains usable even if localStorage is unavailable.
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setSeconds(duration * 60);
  };

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsActive(false);
            
            // Add focus minutes to Today's logs
            const currentFocus = currentLog.focusMinutes || 0;
            updateDailyLog(currentDay, {
              focusMinutes: currentFocus + duration
            });

            alert(`Congrats! You completed a ${duration} minutes focus session.`);
            return duration * 60;
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
  }, [isActive, duration, currentDay, currentLog.focusMinutes, updateDailyLog]);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Compute focus stats
  const totalFocusMinutes = Object.values(dailyLogs).reduce((sum, l) => sum + (l.focusMinutes || 0), 0);
  const totalFocusHours = (totalFocusMinutes / 60).toFixed(1);

  return (
    <div className="flex flex-col gap-6">
      {/* Pomodoro Timer Controls */}
      <Card className="flex flex-col items-center justify-center p-6 text-center border-border-accent/15">
        <span className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider mb-2">Focus Mode Study Workspace</span>
        
        <label className="mb-3 block w-full text-left text-[10px] font-semibold uppercase tracking-wider text-textMuted">
          Minutes
          <input
            type="number"
            min={MIN_DURATION_MINUTES}
            max={MAX_DURATION_MINUTES}
            value={duration}
            disabled={isActive}
            onChange={(event) => handleSelectDuration(Number(event.target.value))}
            className="mt-1 w-full rounded-xl border border-border-subtle bg-bgSurface/60 px-3 py-2 text-center text-sm font-semibold text-textPrimary outline-none focus:border-accentBlue disabled:opacity-60"
          />
        </label>

        {/* Toggle choices */}
        <div className="grid grid-cols-5 gap-2 w-full mb-4">
          {PRESET_MINUTES.map((mins) => (
            <button
              key={mins}
              type="button"
              disabled={isActive}
              onClick={() => handleSelectDuration(mins)}
              className={`py-1 rounded-lg border text-[10px] font-bold transition disabled:opacity-50 ${
                duration === mins
                  ? 'bg-accentBlue/20 border-accentBlue text-textPrimary'
                  : 'bg-bgSurface border-border-subtle hover:bg-bg-glass-hover text-textSecondary'
              }`}
            >
              {mins}m
            </button>
          ))}
        </div>

        <div className="text-4xl font-extrabold text-textPrimary font-mono my-2 tracking-widest">
          {formatTime(seconds)}
        </div>

        <div className="flex gap-2 mt-4 w-full">
          <Button
            onClick={toggleTimer}
            variant={isActive ? "outline" : "primary"}
            className="flex-1 text-xs py-2 rounded-xl"
          >
            {isActive ? "Pause Session" : `Start ${duration}m`}
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

      {/* Focus statistics list */}
      <Card className="flex flex-col gap-3">
        <span className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider block pl-0.5">Focus Statistics</span>
        
        <div className="grid grid-cols-2 gap-4 text-xs bg-bgSurface/30 border border-border-subtle p-3 rounded-xl">
          <div>
            <span className="text-textMuted block font-bold uppercase text-[9px]">Total Focus Time</span>
            <span className="font-bold text-textPrimary font-mono text-sm">{totalFocusHours} hrs</span>
          </div>
          <div>
            <span className="text-textMuted block font-bold uppercase text-[9px]">Today Study Time</span>
            <span className="font-bold text-accentOrange font-mono text-sm">{currentLog.focusMinutes || 0} mins</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
