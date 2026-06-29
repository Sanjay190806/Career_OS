import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface FocusTimerProps {
  onSessionComplete: (minutes: number) => void;
}

export const FocusTimer: React.FC<FocusTimerProps> = ({ onSessionComplete }) => {
  const [seconds, setSeconds] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setSeconds(25 * 60);
  };

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsActive(false);
            onSessionComplete(25);
            return 25 * 60;
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
  }, [isActive, onSessionComplete]);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <Card className="flex flex-col items-center justify-center p-6 text-center border-border-accent/20 bg-gradient-to-b from-bgCard/70 to-bgCard/30">
      <span className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider mb-2">Focus Pomodoro</span>
      
      <div className="text-4xl font-extrabold text-textPrimary font-mono my-2 tracking-widest">
        {formatTime(seconds)}
      </div>

      <div className="flex gap-2 mt-4 w-full">
        <Button
          onClick={toggleTimer}
          variant={isActive ? "outline" : "primary"}
          className="flex-1 text-xs py-2 rounded-xl"
        >
          {isActive ? "Pause" : "Start 25m"}
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
