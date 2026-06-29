import React from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useCareerStore } from '../app/store/useCareerStore';
import {
  calcPlacementScore,
  calcConsistencyScore,
  calcResumeScore,
  calcGermanyReadinessScore,
  getTotalLCSolved
} from '../utils/xpUtils';
import { Languages, Flame, BookOpen, Sparkles } from 'lucide-react';
import { Badge } from '../components/ui/Badge';

export const AnalyticsPage: React.FC = () => {
  const careerState = useCareerStore((s) => s);
  const { dailyLogs } = careerState;

  const placementScore = calcPlacementScore(careerState);
  const consistencyScore = calcConsistencyScore(careerState);
  const resumeScore = calcResumeScore(careerState);
  const germanyScore = calcGermanyReadinessScore(careerState);
  const lcSolved = getTotalLCSolved(careerState);
  
  const germanXP = careerState.germanXP || 0;
  const germanStreak = careerState.germanStreak || 0;
  const germanLevel = careerState.germanLevel || 'A1 Beginner';
  const germanWordsKnown = Object.values(careerState.vocabulary || {}).filter((item: any) => item.status === 'known').length;
  const germanWeakWords = (careerState.weakWords || []).length;

  // Compute burnout risk factors
  const logsList = Object.values(dailyLogs || {});
  const lowEnergyDays = logsList.filter((l: any) => l.energy <= 2).length;
  const highDistractionDays = logsList.filter((l: any) => l.distractions >= 4).length;
  
  let burnoutRisk = "Low";
  let burnoutColor = "text-accentEmerald";
  if (lowEnergyDays >= 5 || highDistractionDays >= 5) {
    burnoutRisk = "Medium";
    burnoutColor = "text-accentYellow";
  }
  if (lowEnergyDays >= 10 || logsList.filter((l: any) => l.status === 'missed').length >= 8) {
    burnoutRisk = "High";
    burnoutColor = "text-accentOrange";
  }

  // Study velocity
  const solvedLastWeek = logsList
    .slice(-7)
    .reduce((sum: number, l: any) => sum + (l.lcStatus?.length || 0), 0);
  
  const estimatedDaysLeft = solvedLastWeek > 0 
    ? Math.round(((360 - lcSolved) / solvedLastWeek) * 7) 
    : 180;
  
  const completionDate = new Date();
  completionDate.setDate(completionDate.getDate() + estimatedDaysLeft);

  // SQL completed count
  const sqlCompleted = Object.values(careerState.sqlProgress || {}).filter(x => x.completed).length;
  
  // CS Core subject percentages
  const subjects = ["dbms", "os", "cn", "oop"];
  const csSubjectMetrics = subjects.map(subj => {
    const subProgress = careerState.csCoreProgress?.[subj] || {};
    const completedSubj = Object.values(subProgress).filter((x: any) => x.completed).length;
    const totalSubj = Object.keys(subProgress).length || 10;
    return { name: subj.toUpperCase(), percent: Math.round((completedSubj / totalSubj) * 100) };
  });

  // SkillRack total solved
  const skillRackSolved = careerState.skillRackStats?.totalSolved || 0;

  // DSA Patterns Mastered
  const dsaPatternsMastered = Object.values(careerState.dsaPatternMastery || {}).filter(x => x.mastery === 'Interview Ready').length;

  const dsaPercent = Math.min(Math.round((lcSolved / 360) * 100), 100);
  const skillrackPercent = Math.min(Math.round((skillRackSolved / 150) * 100), 100);
  const aptitudeSolved = Object.values(careerState.aptitudeProgress || {}).reduce((sum: number, c: any) => sum + (c.questionsSolved || 0), 0);
  const aptitudePercent = Math.min(Math.round((aptitudeSolved / 900) * 100), 100);
  const sqlPercent = Math.min(Math.round((sqlCompleted / 20) * 100), 100);
  const totalCsCompleted = Object.values(careerState.csCoreProgress || {}).reduce((sum: number, sub: any) => sum + Object.values(sub).filter((x: any) => x.completed).length, 0);
  const csCorePercent = Math.min(Math.round((totalCsCompleted / 50) * 100), 100);
  
  const projProgresses = Object.values(careerState.projects || {}).map(p => {
    const valSum = Object.values(p.progress || {}).reduce((a,b)=>a+b, 0);
    return valSum / 6;
  });
  const avgProjProgress = projProgresses.length > 0 ? (projProgresses.reduce((a,b)=>a+b,0)/projProgresses.length) : 0;
  const projectPercent = Math.round(avgProjProgress);

  return (
    <div className="flex flex-col gap-6 fade-in pb-10 select-none">
      <SectionHeader
        title="Placement Readiness Analytics"
        subtitle="Placement index calculations, German readiness tracking, and burnout forecasts"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Placement Readiness Breakdown */}
        <Card className="lg:col-span-2 flex flex-col gap-4">
          <span className="text-xs font-bold text-textSecondary uppercase tracking-wider block border-b border-border-subtle/50 pb-2 pl-0.5">Placement readiness parameters breakdown</span>
          
          <div className="flex flex-col gap-4 text-xs text-textSecondary">
            <div>
              <div className="flex justify-between items-center text-[10px] text-textMuted font-bold mb-1 pl-0.5">
                <span>DSA Roadmap (30%)</span>
                <span>{dsaPercent}%</span>
              </div>
              <ProgressBar value={dsaPercent} color="var(--accent-blue)" />
            </div>

            <div>
              <div className="flex justify-between items-center text-[10px] text-textMuted font-bold mb-1 pl-0.5">
                <span>SkillRack target (15%)</span>
                <span>{skillrackPercent}%</span>
              </div>
              <ProgressBar value={skillrackPercent} color="var(--accent-emerald)" />
            </div>

            <div>
              <div className="flex justify-between items-center text-[10px] text-textMuted font-bold mb-1 pl-0.5">
                <span>Aptitude Solved (15%)</span>
                <span>{aptitudePercent}%</span>
              </div>
              <ProgressBar value={aptitudePercent} color="var(--accent-purple)" />
            </div>

            <div>
              <div className="flex justify-between items-center text-[10px] text-textMuted font-bold mb-1 pl-0.5">
                <span>SQL Practice (10%)</span>
                <span>{sqlPercent}%</span>
              </div>
              <ProgressBar value={sqlPercent} color="var(--accent-cyan)" />
            </div>

            <div>
              <div className="flex justify-between items-center text-[10px] text-textMuted font-bold mb-1 pl-0.5">
                <span>CS Core Subjects (15%)</span>
                <span>{csCorePercent}%</span>
              </div>
              <ProgressBar value={csCorePercent} color="var(--accent-red)" />
            </div>

            <div>
              <div className="flex justify-between items-center text-[10px] text-textMuted font-bold mb-1 pl-0.5">
                <span>Project Progress (10%)</span>
                <span>{projectPercent}%</span>
              </div>
              <ProgressBar value={projectPercent} color="var(--accent-yellow)" />
            </div>

            <div>
              <div className="flex justify-between items-center text-[10px] text-textMuted font-bold mb-1 pl-0.5">
                <span>ATS Resume score (3%)</span>
                <span>{resumeScore}%</span>
              </div>
              <ProgressBar value={resumeScore} color="#EC4899" />
            </div>

            <div>
              <div className="flex justify-between items-center text-[10px] text-textMuted font-bold mb-1 pl-0.5">
                <span>Consistency Index (2%)</span>
                <span>{consistencyScore}%</span>
              </div>
              <ProgressBar value={consistencyScore} color="var(--accent-orange)" />
            </div>

            <div className="bg-bgSurface/30 border border-border-subtle p-3 rounded-xl flex justify-between items-center font-bold text-xs mt-2 pl-4">
              <span>Overall Placement Readiness Index</span>
              <span className="text-accentBlue font-mono text-sm">{placementScore}%</span>
            </div>
          </div>
        </Card>

        {/* Burnout Risk & Velocity */}
        <div className="flex flex-col gap-6">
          <Card className="flex flex-col gap-3">
            <span className="text-[10px] font-bold text-textSecondary uppercase tracking-wider block pl-0.5">Burnout Risk Indicators</span>
            <div className="flex justify-between items-center p-3 bg-bgSurface/30 border border-border-subtle rounded-xl text-xs">
              <span>Stress Index Risk</span>
              <span className={`font-black uppercase text-sm ${burnoutColor}`}>{burnoutRisk}</span>
            </div>
            <p className="text-[9px] text-textMuted pl-0.5 leading-snug">
              Calculates weekly distraction parameters alongside daily energy registers to predict studying fatigue flags.
            </p>
          </Card>

          <Card className="flex flex-col gap-3">
            <span className="text-[10px] font-bold text-textSecondary uppercase tracking-wider block pl-0.5">Roadmap Completion Velocity</span>
            <div className="grid grid-cols-2 gap-4 p-3 bg-bgSurface/30 border border-border-subtle rounded-xl text-xs font-mono">
              <div>
                <span className="text-[8px] text-textMuted block uppercase font-bold">Solved last 7d</span>
                <span className="font-bold text-textPrimary">{solvedLastWeek} problems</span>
              </div>
              <div>
                <span className="text-[8px] text-textMuted block uppercase font-bold">Forecast Finish</span>
                <span className="font-bold text-accentEmerald">{completionDate.toLocaleDateString()}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* SQL & CS Core Progress Cards */}
        <Card className="lg:col-span-2 flex flex-col gap-4">
          <span className="text-xs font-bold text-textSecondary uppercase tracking-wider block border-b border-border-subtle/50 pb-2 pl-0.5">SQL & Computer Science Core Syllabus</span>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-textSecondary">
            <div className="p-3.5 bg-bgSurface/30 border border-border-subtle rounded-xl flex flex-col gap-2">
              <span className="font-bold">SQL Completed Topics</span>
              <span className="text-xl font-bold font-mono text-accentBlue">{sqlCompleted} / 20</span>
              <ProgressBar value={Math.round((sqlCompleted / 20) * 100)} color="var(--accent-blue)" />
            </div>

            <div className="p-3.5 bg-bgSurface/30 border border-border-subtle rounded-xl flex flex-col gap-3">
              <span className="font-bold">CS Subject breakdowns</span>
              <div className="flex flex-col gap-2 font-mono text-[10px]">
                {csSubjectMetrics.map(subj => (
                  <div key={subj.name} className="flex justify-between items-center">
                    <span>{subj.name}</span>
                    <span className="font-bold text-textPrimary">{subj.percent}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* SkillRack & DSA Mastery Card */}
        <Card className="flex flex-col gap-4">
          <span className="text-xs font-bold text-textSecondary uppercase tracking-wider block border-b border-border-subtle/50 pb-2 pl-0.5">SkillRack & Pattern Mastery</span>
          
          <div className="flex flex-col gap-4 text-xs text-textSecondary">
            <div className="p-3 bg-bgSurface/30 border border-border-subtle rounded-xl flex justify-between items-center font-mono">
              <span>SkillRack Solved</span>
              <span className="font-bold text-textPrimary">{skillRackSolved}</span>
            </div>

            <div className="p-3 bg-bgSurface/30 border border-border-subtle rounded-xl flex justify-between items-center font-mono">
              <span>Patterns Mastered (Interview Ready)</span>
              <span className="font-bold text-accentEmerald">{dsaPatternsMastered} / 23</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Germany Readiness card */}
      <Card className="flex flex-col gap-4">
        <div className="border-b border-border-subtle/50 pb-2 pl-0.5 flex justify-between items-center">
          <span className="text-xs font-bold text-textSecondary uppercase tracking-wider block">German study & Germany plans readiness</span>
          <Badge variant="primary" className="bg-accentRed/10 border-accentRed/20 text-accentRed flex items-center gap-1 font-bold">
            <Sparkles className="h-3.5 w-3.5" />
            Germany Index: {germanyScore}%
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs text-textSecondary">
          <div className="p-3.5 bg-bgSurface/30 border border-border-subtle rounded-xl flex flex-col gap-2">
            <span className="font-bold flex items-center gap-2"><Languages className="h-3.5 w-3.5 text-accentRed" /> Level</span>
            <span className="text-xl font-bold font-mono text-accentRed">{germanLevel}</span>
          </div>
          <div className="p-3.5 bg-bgSurface/30 border border-border-subtle rounded-xl flex flex-col gap-2">
            <span className="font-bold flex items-center gap-2"><Flame className="h-3.5 w-3.5 text-accentYellow" /> Streak</span>
            <span className="text-xl font-bold font-mono text-accentYellow">{germanStreak} days</span>
          </div>
          <div className="p-3.5 bg-bgSurface/30 border border-border-subtle rounded-xl flex flex-col gap-2">
            <span className="font-bold flex items-center gap-2"><BookOpen className="h-3.5 w-3.5 text-accentBlue" /> Vocabulary</span>
            <span className="text-xl font-bold font-mono text-accentBlue">{germanWordsKnown} known</span>
          </div>
          <div className="p-3.5 bg-bgSurface/30 border border-border-subtle rounded-xl flex flex-col gap-2">
            <span className="font-bold">Weak words</span>
            <span className="text-xl font-bold font-mono text-accentOrange">{germanWeakWords}</span>
          </div>
        </div>
        <div className="bg-bgSurface/30 border border-border-subtle p-3 rounded-xl flex justify-between items-center font-bold text-xs">
          <span>German XP total</span>
          <span className="text-accentRed font-mono text-sm">{germanXP}</span>
        </div>
      </Card>
    </div>
  );
};
