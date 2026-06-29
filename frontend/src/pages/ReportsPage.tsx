import React, { useState } from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ShaylaPromptButton } from '../components/ai/ShaylaPromptButton';
import { useCareerStore } from '../app/store/useCareerStore';
import { getTotalLCSolved, calcConsistencyScore } from '../utils/xpUtils';

export const ReportsPage: React.FC = () => {
  const careerState = useCareerStore((s) => s);
  const { dailyLogs } = careerState;

  const [copied, setCopied] = useState(false);

  const logsList = Object.values(dailyLogs || {});
  const totalDays = logsList.length;
  const completedCount = logsList.filter((l: any) => l.status === 'completed').length;
  
  // Weekly averages
  const avgMood = totalDays > 0 
    ? (logsList.reduce((sum: number, l: any) => sum + (l.mood || 3), 0) / totalDays).toFixed(1)
    : "3.0";
  
  const avgEnergy = totalDays > 0 
    ? (logsList.reduce((sum: number, l: any) => sum + (l.energy || 3), 0) / totalDays).toFixed(1)
    : "3.0";

  const totalFocus = logsList.reduce((sum: number, l: any) => sum + (l.focusMinutes || 0), 0);

  const reportMarkdown = `# Sanju Career OS — Weekly Review Report
*Generated: ${new Date().toLocaleDateString()}*

## 1. Study Metrics SUMMARY
- **Total Program Days Mapped**: ${totalDays}
- **Completed Study Checkpoints**: ${completedCount}
- **Consistency Score**: ${calcConsistencyScore(careerState)}%
- **LeetCode Problems Solved**: ${getTotalLCSolved(careerState)}

## 2. Productivity parameters
- **Average Mood rating**: ${avgMood}/5
- **Average Energy index**: ${avgEnergy}/5
- **Accumulated Focus Session**: ${totalFocus} minutes

## 3. Study Recommendations
- Maintain study streaks and log mood variables daily.
- Review incomplete DSA pattern syllabus folders.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(reportMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([reportMarkdown], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `weekly_report_${Date.now()}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="flex flex-col gap-6 fade-in pb-10 select-none">
      <SectionHeader
        title="Weekly Review Report Builder"
        subtitle="Compile markdown review files to track placement trends"
        actions={
          <div className="flex gap-2">
            <Button onClick={handleCopy} variant="outline" className="text-xs py-1.5 rounded-xl">
              {copied ? "Copied ✓" : "Copy Markdown"}
            </Button>
            <Button onClick={handleDownload} className="text-xs py-1.5 rounded-xl">
              Download .md File
            </Button>
          </div>
        }
      />

      <Card className="flex flex-wrap items-center justify-between gap-3 border-accentPurple/20 bg-accentPurple/10 p-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accentPurple">Shayla AI Mentor</p>
          <h3 className="mt-1 text-base font-semibold text-textPrimary">Weekly report reviewer</h3>
        </div>
        <ShaylaPromptButton prompt={`Review this weekly report and create a practical next-week plan:\n\n${reportMarkdown}`}>
          Review weekly report
        </ShaylaPromptButton>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Preview Panel */}
        <Card className="lg:col-span-2 flex flex-col gap-4">
          <span className="text-xs font-bold text-textSecondary uppercase tracking-wider block border-b border-border-subtle/50 pb-2 pl-0.5">Report Output Preview</span>
          <textarea
            readOnly
            value={reportMarkdown}
            className="w-full bg-bgSurface border border-border-subtle text-textPrimary text-xs rounded-xl p-4 font-mono h-[300px] resize-none focus:outline-none"
          />
        </Card>

        {/* Analytics Highlights summary card */}
        <Card className="flex flex-col gap-4">
          <span className="text-xs font-bold text-textSecondary uppercase tracking-wider block border-b border-border-subtle/50 pb-2 pl-0.5">Report highlights summary</span>
          
          <div className="flex flex-col gap-3 text-xs text-textSecondary font-mono">
            <div className="flex justify-between items-center p-2.5 bg-bgSurface/40 border border-border-subtle/50 rounded-xl">
              <span>Avg Mood</span>
              <span className="font-bold text-textPrimary">{avgMood} / 5</span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-bgSurface/40 border border-border-subtle/50 rounded-xl">
              <span>Avg Energy</span>
              <span className="font-bold text-accentOrange">{avgEnergy} / 5</span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-bgSurface/40 border border-border-subtle/50 rounded-xl">
              <span>Total study</span>
              <span className="font-bold text-accentBlue">{totalFocus} mins</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
