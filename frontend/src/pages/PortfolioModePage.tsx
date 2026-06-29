import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SectionHeader } from '../components/ui/SectionHeader';
import { CircularProgress } from '../components/ui/CircularProgress';
import { Bot, Flame, ArrowRight, Laptop, Code } from 'lucide-react';

export const PortfolioModePage: React.FC = () => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    { role: 'assistant', content: 'Hallo Sanju! I am Shayla, your Career OS tutor. Ask me to explain a Java DSA topic or practice basic German A1 dialogue with you!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = () => {
    if (!input.trim() || loading) return;
    const userMsg = input;
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      let reply = "Das ist fantastisch! Let's practice that. Try translating: 'I study computer science at university.'";
      if (userMsg.toLowerCase().includes('java') || userMsg.toLowerCase().includes('dsa') || userMsg.toLowerCase().includes('sort')) {
        reply = "Pattern: Two Pointers\nWhy it fits: Sorting arrays in linear time require references from both ends.\nJava Approach: Keep left = 0, right = n-1, swap and narrow bounds.\nComplexity: O(n) time, O(1) space.";
      }
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
      setLoading(false);
    }, 1000);
  };

  const handleEnterWorkspace = () => {
    window.location.pathname = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-bgBackground text-textPrimary flex flex-col gap-8 px-6 py-8 md:px-12 select-none">
      {/* Top Header */}
      <div className="flex justify-between items-center border-b border-border-subtle pb-4">
        <div className="flex flex-col">
          <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-textMuted">Recruiter Portfolio View</span>
          <span className="text-xl font-bold text-textPrimary flex items-center gap-2">
            Sanju Career OS <Badge variant="primary" className="bg-accentBlue/10 border-accentBlue/20 text-accentBlue">Demo Mode</Badge>
          </span>
        </div>
        <Button size="sm" variant="primary" onClick={handleEnterWorkspace} className="text-xs">
          Enter Workspace <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      </div>

      <SectionHeader
        title="Command Your Career Journey"
        subtitle="A showcase of the engineering and strategic systems powering Sanju's placement prep."
      />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Mock System Stats */}
        <div className="flex flex-col gap-6">
          <Card className="flex flex-col gap-4 border-accentBlue/20">
            <span className="text-[10px] text-textMuted font-bold uppercase tracking-wider block border-b border-white/5 pb-2">
              Performance Index
            </span>
            <div className="grid grid-cols-3 gap-4 py-2">
              <div className="flex flex-col items-center">
                <CircularProgress value={89} size={70} strokeWidth={6} color="#3B82F6" />
                <span className="text-[10px] font-bold text-textSecondary mt-2">Placement</span>
              </div>
              <div className="flex flex-col items-center">
                <CircularProgress value={94} size={70} strokeWidth={6} color="#10B981" />
                <span className="text-[10px] font-bold text-textSecondary mt-2">Consistency</span>
              </div>
              <div className="flex flex-col items-center">
                <CircularProgress value={92} size={70} strokeWidth={6} color="#8B5CF6" />
                <span className="text-[10px] font-bold text-textSecondary mt-2">Resume ATS</span>
              </div>
            </div>
          </Card>

          {/* Core Modules List */}
          <Card className="flex flex-col gap-3">
            <span className="text-[10px] text-textMuted font-bold uppercase tracking-wider block border-b border-white/5 pb-2">
              Key Architecture Features
            </span>
            <div className="flex flex-col gap-2.5 text-xs text-textSecondary">
              <div className="p-3 bg-white/[0.02] border border-border-subtle rounded-xl flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accentBlue/10 text-accentBlue"><Code className="h-4 w-4" /></div>
                <div>
                  <span className="font-semibold text-textPrimary block">180-Day DSA Roadmap</span>
                  <span className="text-[10px] text-textMuted">23 primary patterns, Java-focused, confidence logs</span>
                </div>
              </div>
              <div className="p-3 bg-white/[0.02] border border-border-subtle rounded-xl flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accentRed/10 text-accentRed"><Laptop className="h-4 w-4" /></div>
                <div>
                  <span className="font-semibold text-textPrimary block">CS Core Rotation</span>
                  <span className="text-[10px] text-textMuted">DBMS, OS, CN, OOP Java rotated revision targets</span>
                </div>
              </div>
              <div className="p-3 bg-white/[0.02] border border-border-subtle rounded-xl flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accentYellow/10 text-accentYellow"><Flame className="h-4 w-4" /></div>
                <div>
                  <span className="font-semibold text-textPrimary block">German 2.0 System</span>
                  <span className="text-[10px] text-textMuted">Spaced repetition queue, article practice, speech hints</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Middle Column: Safe Shayla Chat Simulation */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="flex-1 flex flex-col justify-between border-accentPurple/20 min-h-[400px]">
            <div className="border-b border-white/5 pb-2 mb-4 flex justify-between items-center">
              <span className="text-[10px] text-textMuted font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Bot className="h-4 w-4 text-accentPurple" /> Interact with Shayla AI (Safe Sandbox)
              </span>
              <Badge variant="primary" className="bg-accentPurple/10 border-accentPurple/20 text-accentPurple">
                Fast Inference
              </Badge>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-2 max-h-[300px] mb-4">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl max-w-[85%] text-xs leading-relaxed ${
                    m.role === 'assistant'
                      ? 'bg-white/[0.03] border border-border-subtle text-textSecondary self-start'
                      : 'bg-accentPurple/15 text-textPrimary self-end'
                  }`}
                >
                  <span className="font-bold text-[9px] uppercase tracking-wider block mb-1">
                    {m.role === 'assistant' ? 'Shayla AI' : 'Sanjay'}
                  </span>
                  <div className="whitespace-pre-wrap">{m.content}</div>
                </div>
              ))}
              {loading && (
                <div className="bg-white/[0.02] border border-border-subtle text-textMuted p-3 rounded-xl text-xs self-start animate-pulse">
                  Shayla is typing...
                </div>
              )}
            </div>

            <div className="flex gap-2 border-t border-white/5 pt-3">
              <input
                type="text"
                placeholder="Type 'explain quicksort' or 'hallo'..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 rounded-xl border border-border-subtle bg-bgSurface/40 px-4 py-2.5 text-xs text-textPrimary focus:outline-none focus:border-accentPurple"
              />
              <Button size="sm" variant="primary" onClick={handleSend} className="bg-accentPurple hover:bg-accentPurple/90 text-xs">
                Send
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Tech Stack and System architecture */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
        <Card className="flex flex-col gap-3">
          <span className="text-[10px] text-textMuted font-bold uppercase tracking-wider block border-b border-white/5 pb-2">
            System Tech Stack
          </span>
          <div className="grid grid-cols-2 gap-4 text-xs text-textSecondary">
            <div className="p-3 bg-white/[0.02] border border-border-subtle rounded-xl">
              <strong className="text-textPrimary block mb-1">Frontend</strong>
              React 18, TypeScript, TailwindCSS, Zustand State, Lucide Icons, Vite Bundler.
            </div>
            <div className="p-3 bg-white/[0.02] border border-border-subtle rounded-xl">
              <strong className="text-textPrimary block mb-1">Backend</strong>
              Node.js, Express, TypeScript, Prisma ORM, PostgreSQL database validations.
            </div>
            <div className="p-3 bg-white/[0.02] border border-border-subtle rounded-xl">
              <strong className="text-textPrimary block mb-1">AI Engine</strong>
              Groq Cloud API, OpenRouter failovers, Ollama local llama3 instance support.
            </div>
            <div className="p-3 bg-white/[0.02] border border-border-subtle rounded-xl">
              <strong className="text-textPrimary block mb-1">UX Aesthetics</strong>
              Dark Mode theme, glassmorphic card containers, micro-interactions, custom CSS.
            </div>
          </div>
        </Card>

        <Card className="flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-textMuted font-bold uppercase tracking-wider block border-b border-white/5 pb-2 mb-3">
              Recruiter Walkthrough Summary
            </span>
            <p className="text-xs text-textSecondary leading-relaxed">
              Sanju Career OS is built as a complete career cockpit. ECE college recruiters can view this sandbox to review DSA milestones, check syllabus rotation compliance, test local/remote LLM routers, and verify structured system metrics.
            </p>
          </div>
          <Button variant="outline" onClick={handleEnterWorkspace} className="w-full text-xs mt-4">
            Enter Workspace Dashboard
          </Button>
        </Card>
      </div>
    </div>
  );
};
