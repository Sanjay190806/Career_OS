import React from 'react';
import { 
  Flame, BadgeCheck, Bot, Languages, Code2, TrendingUp, 
  FileText, CalendarClock, ShieldCheck, 
  Cpu, Sparkles, AlertCircle, CheckCircle, ArrowRight
} from 'lucide-react';
import { navigateToPath } from '../utils/navigation';
import { Card } from '../components/ui/Card';

export const LandingPage: React.FC = () => {
  const coreModules = [
    { title: 'Daily Mission', desc: 'A focused checklist to drive daily placement routines and habits.', icon: Flame, color: 'text-accentOrange' },
    { title: '180-Day DSA Roadmap', desc: 'Curated Java DSA progression tracking topics and interview problems.', icon: BadgeCheck, color: 'text-accentEmerald' },
    { title: 'SkillRack + Aptitude', desc: 'Daily speed-coding counters and quantitative/reasoning practice logs.', icon: Cpu, color: 'text-accentBlue' },
    { title: 'SQL + CS Core', desc: 'Revise DBMS, operating systems, networking, and query fundamentals.', icon: Code2, color: 'text-accentPurple' },
    { title: 'Resume Studio', desc: 'Strict ATS checker with instant feedback scoring to land interviews.', icon: FileText, color: 'text-accentBlue' },
    { title: 'Interview Coach', desc: 'Practice simulated HR, technical, and coding interview rounds.', icon: Bot, color: 'text-accentGold' },
    { title: 'German Academy', desc: 'Optional study track mapping German vocabulary and A1-B1 fluency goals.', icon: Languages, color: 'text-accentEmerald' },
    { title: 'Company Prep Center', desc: 'Target-specific company prep notes, questions, and interview tracking.', icon: CalendarClock, color: 'text-accentOrange' },
    { title: 'Career Intelligence', desc: 'High-level placement signals, metrics, and consistency analysis.', icon: TrendingUp, color: 'text-accentPurple' },
    { title: 'Shayla AI Mentor', desc: 'Your supportive companion, accountability coach, and tutor.', icon: Sparkles, color: 'text-accentGold' },
  ];

  const techStack = [
    { category: 'Frontend', items: 'React · TypeScript · Vite · Tailwind' },
    { category: 'State Management', items: 'Zustand (Persisted Local Schema)' },
    { category: 'Backend Server', items: 'Express · Prisma Client · Node.js' },
    { category: 'Database', items: 'PostgreSQL (Cloud & Local)' },
    { category: 'AI Routing Router', items: 'Groq · Ollama · OpenRouter · Gemini' },
  ];

  return (
    <div className="min-h-screen bg-[#06060f] text-textPrimary selection:bg-accentBlue/30 select-none overflow-x-hidden font-sans relative">
      {/* Aurora Ambient Lighting */}
      <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[60%] rounded-full bg-cyan-500/[0.04] blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] h-[50%] w-[50%] rounded-full bg-purple-500/[0.04] blur-[130px] pointer-events-none" />

      {/* Hero Section */}
      <header className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center flex flex-col items-center">
        {/* Placement Preparedness Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-white/[0.03] text-xs font-bold text-accentBlue mb-6 tracking-wide shadow-glow-blue/5">
          <ShieldCheck className="h-4 w-4" />
          <span>Built for placement preparation · Powered by Shayla AI · Local-first productivity system</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight bg-gradient-to-b from-white via-white/90 to-white/60 bg-clip-text text-transparent">
          Sanju Career OS
        </h1>

        <p className="mt-6 max-w-3xl text-sm md:text-base leading-relaxed text-textSecondary text-center">
          An AI-powered career operating system for college placements, Java DSA, CS fundamentals, 
          resume readiness, projects, German learning, interviews, and daily execution.
        </p>

        {/* Call to Actions */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-lg">
          <button 
            onClick={() => navigateToPath('/dashboard')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-accentBlue text-white font-bold text-sm px-6 py-3.5 hover:bg-accentBlue/90 hover:shadow-glow-blue/20 transition active:scale-98"
          >
            Launch Career OS <ArrowRight className="h-4 w-4" />
          </button>
          
          <button 
            onClick={() => navigateToPath('/portfolio')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] text-textPrimary font-bold text-sm px-6 py-3.5 hover:border-white/20 hover:bg-white/[0.07] transition active:scale-98"
          >
            View Portfolio Mode
          </button>

          <button 
            onClick={() => navigateToPath('/shayla')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-accentPurple/20 bg-accentPurple/5 text-accentPurple font-bold text-sm px-6 py-3.5 hover:border-accentPurple/40 hover:bg-accentPurple/10 transition active:scale-98"
          >
            <Bot className="h-4 w-4" /> Meet Shayla
          </button>
        </div>
      </header>

      {/* Problem & Solution Grid Section */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Problem */}
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2 text-accentOrange mb-4">
              <AlertCircle className="h-5 w-5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">The Problem</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-textPrimary">
              Students prepare across too many disconnected tools.
            </h2>
            <p className="mt-4 text-xs md:text-sm leading-relaxed text-textSecondary">
              Right now, preparation is fragmented. You track Java DSA problems in one place, log SkillRack solutions in another, draft resumes in separate offline builders, organize company targets on sheets, and learn languages like German in siloed apps. The result? No daily accountability, zero progress signals, and no cohesive vision.
            </p>
          </div>

          {/* Solution */}
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2 text-accentEmerald mb-4">
              <CheckCircle className="h-5 w-5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">The Solution</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-textPrimary">
              One AI-powered operating system for placement execution.
            </h2>
            <p className="mt-4 text-xs md:text-sm leading-relaxed text-textSecondary">
              Sanju Career OS brings everything together. A single console combining daily missions, structured 180-day roadmaps, local AI provider routing, resume builders, mock technical interviews, German vocab tools, and high-fidelity progress tracking. Built local-first for ultimate speed and privacy.
            </p>
          </div>
        </div>
      </section>

      {/* Core Modules Grid */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-white/5">
        <div className="text-center mb-12">
          <span className="text-[10px] font-bold text-accentBlue uppercase tracking-widest">Built to Perform</span>
          <h2 className="text-3xl font-bold tracking-tight text-textPrimary mt-2">Core Platform Modules</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {coreModules.map((mod) => (
            <Card key={mod.title} className="p-4 flex flex-col items-start gap-3 bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition duration-200">
              <div className={`p-2 rounded-xl bg-white/[0.04] ${mod.color}`}>
                <mod.icon className="h-5 w-5" />
              </div>
              <h3 className="text-xs font-bold text-textPrimary">{mod.title}</h3>
              <p className="text-[10px] text-textSecondary leading-normal">{mod.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Shayla AI Spotlight Section */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-white/5">
        <div className="rounded-3xl border border-white/5 bg-gradient-to-r from-bgCard to-[#0c0c1b] p-8 md:p-12 grid grid-cols-1 md:grid-cols-[1.3fr_0.9fr] gap-8">
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2 text-accentPurple mb-4">
              <Sparkles className="h-4 w-4 fill-current" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Meet Your Mentor</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-textPrimary">
              Meet Shayla AI Mentor
            </h2>
            <p className="mt-4 text-xs md:text-sm leading-relaxed text-textSecondary">
              Shayla is the intelligent core of Career OS. Built directly into the tracker shell, 
              she operates as your German learning companion, Java DSA advisor, resume editor, project critic, 
              interview tutor, and daily consistency partner. Configured to interface with local or API models, 
              Shayla helps you review work and block distractions without leaking private logs.
            </p>
            <button 
              onClick={() => navigateToPath('/shayla')}
              className="mt-6 self-start inline-flex items-center gap-2 rounded-xl bg-accentPurple text-white font-bold text-xs px-5 py-3 hover:bg-accentPurple/90 transition shadow-glow-purple/10"
            >
              Meet Shayla Chat <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="rounded-2xl border border-white/5 bg-black/40 p-5 flex flex-col gap-4 font-mono text-[11px] text-textSecondary">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-accentBlue font-bold">SYSTEM_PROMPT</span>
              <span className="text-[9px] text-textMuted uppercase">ROUTING: ACTIVE</span>
            </div>
            <p className="italic text-textMuted">
              "You are Shayla, Sanju's German learning companion, daily accountability partner, Java DSA guide, and bestie-style AI mentor."
            </p>
            <div className="flex flex-col gap-1 text-[10px]">
              <span className="text-textPrimary font-semibold">• Focus: Placement readiness for top SWE roles</span>
              <span className="text-textPrimary font-semibold">• Method: Java DSA, SQL, CS Core, Consistency</span>
              <span className="text-textPrimary font-semibold">• Vibe: Practical, supportive, and direct</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack / Architecture */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Architecture */}
          <div className="flex flex-col justify-center">
            <span className="text-[10px] font-bold text-accentBlue uppercase tracking-wider mb-2">Designed for Portability</span>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-textPrimary">
              System Architecture
            </h2>
            <p className="mt-4 text-xs md:text-sm leading-relaxed text-textSecondary">
              Career OS relies on a local-first schema designed to serialize your work safely inside localStorage with schema migration safeguards. The app interfaces with a local Node/Express service for offline file handling, database replication, and custom local model routing via Ollama.
            </p>
          </div>

          {/* Tech Stack Cards */}
          <div className="grid gap-3">
            {techStack.map((tech) => (
              <div key={tech.category} className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 flex justify-between items-center gap-4">
                <span className="text-xs font-bold text-textPrimary">{tech.category}</span>
                <span className="text-xs text-textSecondary text-right">{tech.items}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA Section */}
      <footer className="max-w-6xl mx-auto px-6 pt-12 pb-24 border-t border-white/5 text-center">
        <h2 className="text-3xl font-black text-textPrimary">
          Ready to achieve placement readiness?
        </h2>
        <p className="mt-3 text-xs text-textSecondary max-w-lg mx-auto leading-relaxed">
          Start logging LeetCode solutions, practice aptitude, analyze resumes, and prepare for interviews within one integrated system.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-sm mx-auto">
          <button 
            onClick={() => navigateToPath('/dashboard')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-accentBlue text-white font-bold text-xs px-6 py-3 hover:bg-accentBlue/90 transition"
          >
            Launch Career OS <ArrowRight className="h-4 w-4" />
          </button>
          
          <button 
            onClick={() => navigateToPath('/portfolio')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] text-textPrimary font-bold text-xs px-6 py-3 hover:bg-white/[0.07] transition"
          >
            View Portfolio Mode
          </button>
        </div>

        <p className="mt-16 text-[9px] text-textMuted uppercase tracking-widest">
          Sanju Career OS v1.6.1 - Premium Developer Workspace
        </p>
      </footer>
    </div>
  );
};
