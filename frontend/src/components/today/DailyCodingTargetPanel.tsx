import React, { useMemo } from 'react';
import { CheckCircle2, Minus, Plus } from 'lucide-react';
import { useCareerStore } from '../../app/store/useCareerStore';
import { useDailyLogStore } from '../../app/store/useDailyLogStore';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { getDateForDay } from '../../utils/dateUtils';
import {
  DAILY_CODING_ACTIVE_TASK_IDS,
  getDailyCodingCompletion,
  normalizeDailyCodingState,
  toLocalDateKey
} from '../../utils/dailyCodingUtils';
import { DailyCodingTaskId } from '../../types';

interface DailyCodingTargetPanelProps {
  compact?: boolean;
}

export const DailyCodingTargetPanel: React.FC<DailyCodingTargetPanelProps> = ({ compact = false }) => {
  const selectedDay = useDailyLogStore((s) => s.selectedDay);
  const dailyLogs = useCareerStore((s) => s.dailyLogs);
  const userProfile = useCareerStore((s) => s.userProfile);
  const updateDailyCodingTask = useCareerStore((s) => s.updateDailyCodingTask);

  const dateKey = useMemo(() => toLocalDateKey(getDateForDay(selectedDay, userProfile.startDate)), [selectedDay, userProfile.startDate]);
  const dailyCoding = useMemo(
    () => normalizeDailyCodingState(dailyLogs[selectedDay], dateKey),
    [dailyLogs, selectedDay, dateKey]
  );

  const isComplete = getDailyCodingCompletion(dailyCoding);
  const activeTasks = DAILY_CODING_ACTIVE_TASK_IDS.map((taskId) => dailyCoding.tasks[taskId]);
  const leetcode = dailyCoding.tasks.leetcode_daily;

  const setTaskCount = (taskId: DailyCodingTaskId, count: number) => {
    updateDailyCodingTask(selectedDay, taskId, { count });
  };

  const completeTask = (taskId: DailyCodingTaskId, completed: boolean) => {
    updateDailyCodingTask(selectedDay, taskId, { completed });
  };

  return (
    <Card className={`border-accentBlue/15 bg-accentBlue/5 ${compact ? 'p-4' : 'p-5'} flex flex-col gap-4`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-textMuted">Daily Coding</p>
          <h3 className="mt-1 text-sm font-black text-textPrimary">CodeChef Java + SkillRack</h3>
          <p className="mt-1 text-[10px] text-textSecondary">Official DSA streak starts Aug 1, 2026</p>
        </div>
        <Badge variant={isComplete ? 'success' : 'neutral'}>
          {isComplete ? 'Target Complete' : 'In Progress'}
        </Badge>
      </div>

      <div className="flex flex-col gap-3">
        {activeTasks.map((task) => (
          <div key={task.id} className="rounded-2xl border border-white/5 bg-black/35 p-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black text-textPrimary">{task.label} Daily</p>
                <p className="text-[10px] text-textMuted">Target: {task.target} {task.id === 'codechef_java_daily' ? 'Java problems' : 'problems'}</p>
              </div>
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-textSecondary">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={(event) => completeTask(task.id, event.target.checked)}
                  className="rounded border-white/10 bg-black/50 text-accentBlue focus:ring-0"
                />
                Complete
              </label>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 rounded-lg p-0"
                  onClick={() => setTaskCount(task.id, task.count - 1)}
                  disabled={task.count <= 0}
                  title={`Decrease ${task.label}`}
                >
                  <Minus className="h-3.5 w-3.5" />
                </Button>
                <span className="min-w-[56px] rounded-lg border border-white/5 bg-black/45 px-3 py-1.5 text-center font-mono text-sm font-black text-textPrimary">
                  {task.count}/{task.target}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 rounded-lg p-0"
                  onClick={() => setTaskCount(task.id, task.count + 1)}
                  disabled={task.count >= task.target}
                  title={`Increase ${task.label}`}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-textSecondary">
                <CheckCircle2 className={`h-3.5 w-3.5 ${task.xpAwarded ? 'text-accentEmerald' : 'text-textMuted'}`} />
                <span>{task.xpAwarded ? `+${task.xp} XP locked` : `+${task.xp} XP once`}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/5 bg-black/30 p-3 text-[10px] text-textSecondary">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-bold text-textPrimary">LeetCode</span>
          <Badge variant={leetcode.active ? 'primary' : 'neutral'}>
            {leetcode.active ? 'Active' : 'Starts Aug 1, 2026'}
          </Badge>
        </div>
        <p className="mt-1">Before Aug 1 it stays out of today&apos;s coding completion and official DSA streak.</p>
      </div>
    </Card>
  );
};

export default DailyCodingTargetPanel;
