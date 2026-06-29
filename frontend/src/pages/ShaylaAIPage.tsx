import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useAIStore } from '../app/store/useAIStore';
import { useCareerStore } from '../app/store/useCareerStore';
import { useAISettingsStore, AIProviderName } from '../app/store/useAISettingsStore';
import { ChatMessage } from '../components/ai/ChatMessage';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { SectionHeader } from '../components/ui/SectionHeader';
import { buildAIContext } from '../utils/aiContextUtils';
import { aiService } from '../services/aiService';
import { ApiError } from '../services/apiClient';
import { AIMessage } from '../types';
import { parseCommandOffline } from '../utils/commandParser';
import { executeCommand } from '../utils/commandExecutor';
import { Sparkles } from 'lucide-react';

const createId = (prefix = 'msg') => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
};

export const ShaylaAIPage: React.FC = () => {
  const [leftWidthPercent, setLeftWidthPercent] = useState(65); // default 65% left panel width
  const splitPaneRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (splitPaneRef.current) {
        const rect = splitPaneRef.current.getBoundingClientRect();
        const newWidthPercent = ((moveEvent.clientX - rect.left) / rect.width) * 100;
        setLeftWidthPercent(Math.max(25, Math.min(80, newWidthPercent)));
      }
    };
    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const messages = useAIStore((s) => s.messages);
  const isThinking = useAIStore((s) => s.isThinking);
  const addMessage = useAIStore((s) => s.addMessage);
  const updateMessage = useAIStore((s) => s.updateMessage);
  const setThinking = useAIStore((s) => s.setThinking);
  const consumePendingPrompt = useAIStore((s) => s.consumePendingPrompt);
  const clearChat = useAIStore((s) => s.clearChat);

  const careerState = useCareerStore((s) => s);

  const activeProvider = useAISettingsStore((s) => s.activeProvider);
  const activeModel = useAISettingsStore((s) => s.activeModel);
  const activeMode = useAISettingsStore((s) => s.activeMode);
  const setProvider = useAISettingsStore((s) => s.setProvider);
  const setModel = useAISettingsStore((s) => s.setModel);
  const setMode = useAISettingsStore((s) => s.setMode);

  const providerModels: Record<AIProviderName, string[]> = {
    groq: [
      'openai/gpt-oss-20b',
      'openai/gpt-oss-120b',
      'llama-3.1-8b-instant',
      'llama-3.3-70b-versatile'
    ],
    ollama: [
      'qwen2.5-coder',
      'deepseek-r1',
      'llama3',
      'mistral',
      'gemma'
    ],
    openrouter: [
      'qwen/qwen-2.5-coder-32b-instruct',
      'deepseek/deepseek-r1',
      'anthropic/claude-3.5-sonnet',
      'google/gemini-pro',
      'meta-llama/llama-3.1-70b-instruct'
    ],
    openai: [
      'gpt-4.1',
      'gpt-4.1-mini',
      'gpt-4o-mini'
    ],
    anthropic: [
      'claude-3.5-sonnet',
      'claude-3-haiku'
    ],
    gemini: [
      'gemini-1.5-pro',
      'gemini-1.5-flash'
    ],
    lmstudio: [
      'local-model'
    ]
  };

  const [input, setInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<{ backendOnline: boolean; groqConfigured: boolean; model: string; streamingSupported: boolean } | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const sendLockRef = useRef(false);
  const quickActionLockRef = useRef(0);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  useEffect(() => {
    let mounted = true;

    aiService.getStatus()
      .then((status) => {
        if (mounted) setAiStatus(status);
      })
      .catch(() => {
        if (mounted) {
          setAiStatus({
            backendOnline: false,
            groqConfigured: false,
            model: 'unknown',
            streamingSupported: false
          });
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleSend = async (text: string) => {
    const prompt = text.trim();
    if (!prompt || isThinking || sendLockRef.current) return;

    setErrorMsg(null);
    sendLockRef.current = true;

    const userMsg: AIMessage = {
      id: createId('user'),
      role: 'user',
      content: prompt,
      status: 'sent',
      createdAt: new Date().toISOString()
    };
    const assistantMsgId = createId('assistant');
    const outboundMessages = [...useAIStore.getState().messages.filter((message) => message.status !== 'failed' && message.status !== 'streaming'), userMsg];

    addMessage(userMsg);
    addMessage({
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      status: 'streaming',
      prompt,
      createdAt: new Date().toISOString()
    });

    setThinking(true);

    const ctx = buildAIContext(careerState);

    try {
      let replyAccumulated = '';

      await aiService.sendMessageStream(outboundMessages, ctx, (token) => {
        replyAccumulated += token;
        updateMessage(assistantMsgId, { content: replyAccumulated, status: 'streaming' });
      });

      updateMessage(assistantMsgId, { content: replyAccumulated, status: 'complete' });
    } catch (streamErr) {
      console.warn('Completions streaming failed. Falling back to non-streaming API proxy...', streamErr);

      if (streamErr instanceof ApiError && (streamErr.code === 'groq_rate_limited' || streamErr.code === 'ai_rate_limited' || streamErr.code === 'provider_rate_limited' || streamErr.status === 429)) {
        const message = 'Groq is rate-limited right now. Wait 1-2 minutes or switch to a lighter model.';
        updateMessage(assistantMsgId, { content: message, status: 'failed', error: message });
        setErrorMsg(message);
        return;
      }

      try {
        const res = await aiService.sendMessage(outboundMessages, ctx);
        updateMessage(assistantMsgId, { content: res.reply, status: 'complete' });
      } catch (err: any) {
        console.error('AI service fallback completions error:', err);
        const message = err instanceof ApiError
          ? (err.code === 'missing_groq_api_key'
            ? 'Groq API key missing in backend/.env.'
            : err.code === 'invalid_groq_api_key'
              ? 'Groq API key invalid or rejected.'
              : err.code === 'groq_rate_limited' || err.code === 'ai_rate_limited' || err.code === 'provider_rate_limited'
                ? 'Groq is rate-limited right now. Wait 1-2 minutes or switch to a lighter model.'
                : err.code === 'ai_payload_too_large'
                  ? 'This chat thread is too long. Start a new chat or clear history.'
                : err.message || 'Failed to contact Shayla AI backend service.')
          : typeof err?.message === 'string' && /failed to fetch/i.test(err.message)
            ? 'Backend offline. Start npm run dev in backend.'
            : err?.message || 'Failed to contact Shayla AI backend service.';

        updateMessage(assistantMsgId, { content: message, status: 'failed', error: message });
        setErrorMsg(message);
      }
    } finally {
      setThinking(false);
      sendLockRef.current = false;
    }
  };

  const quickChips = [
    "Explain today's DSA pattern",
    'Give me a hint only',
    'Review my progress honestly',
    'German phrase for today',
    'Roast my excuses professionally',
    'Review my resume readiness'
  ];

  const ctx = buildAIContext(careerState);

  const handleQuickChip = (chip: string) => {
    if (isThinking || sendLockRef.current) return;
    const now = Date.now();
    if (now - quickActionLockRef.current < 300) return;
    quickActionLockRef.current = now;
    setErrorMsg(null);
    setInput(chip);
    inputRef.current?.focus();
  };

  const handleRetry = (message: AIMessage) => {
    if (message.prompt) {
      handleSend(message.prompt);
      return;
    }

    if (message.content) {
      setInput(message.content);
      inputRef.current?.focus();
    }
  };

  const handleEdit = (message: AIMessage) => {
    const draft = message.prompt || message.content || '';
    setInput(draft);
    inputRef.current?.focus();
  };

  useEffect(() => {
    const pending = consumePendingPrompt();
    if (pending) {
      setInput('');
      handleSend(pending);
    }
  }, [consumePendingPrompt]);

  return (
    <div className="fade-in flex h-[80vh] flex-col gap-6 pb-6">
      <SectionHeader
        title="Shayla AI Mentor"
        subtitle="German learning companion - Java DSA guide - resume reviewer - project coach - daily accountability partner"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {/* Mode selection dropdown */}
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-textMuted uppercase mb-0.5">Mode</span>
              <select
                value={activeMode}
                onChange={(e) => setMode(e.target.value as any)}
                className="rounded-lg border border-border-subtle bg-bgSurface px-2.5 py-1 text-xs text-textPrimary focus:outline-none"
              >
                <option value="Daily Coach">Daily Coach</option>
                <option value="Deep Thinking">Deep Thinking</option>
                <option value="German Tutor">German Tutor</option>
                <option value="Java DSA Mentor">Java DSA Mentor</option>
                <option value="Resume Reviewer">Resume Reviewer</option>
                <option value="Project Coach">Project Coach</option>
                <option value="Fast Mode">Fast Mode</option>
                <option value="Offline Local Mode">Offline Local Mode</option>
              </select>
            </div>

            {/* Provider selection dropdown */}
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-textMuted uppercase mb-0.5">Provider</span>
              <select
                value={activeProvider}
                onChange={(e) => setProvider(e.target.value as any)}
                className="rounded-lg border border-border-subtle bg-bgSurface px-2.5 py-1 text-xs text-textPrimary focus:outline-none"
              >
                <option value="groq">Groq</option>
                <option value="openrouter">OpenRouter</option>
                <option value="ollama">Ollama</option>
                <option value="lmstudio">LM Studio</option>
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="gemini">Gemini</option>
              </select>
            </div>

            {/* Model selection dropdown */}
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-textMuted uppercase mb-0.5">Model</span>
              <select
                value={activeModel}
                onChange={(e) => setModel(e.target.value)}
                className="rounded-lg border border-border-subtle bg-bgSurface px-2.5 py-1 text-xs text-textPrimary focus:outline-none min-w-[120px]"
              >
                {(providerModels[activeProvider] || []).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Buttons */}
            <div className="flex items-end gap-1.5 self-end">
              <Button
                onClick={() => {
                  clearChat();
                  setInput('');
                  setErrorMsg(null);
                  inputRef.current?.focus();
                }}
                variant="primary"
                className="rounded-xl py-1 text-xs h-[28px]"
              >
                New Chat
              </Button>
              <Button onClick={clearChat} variant="outline" className="rounded-xl py-1 text-xs h-[28px]">
                Clear
              </Button>
            </div>
          </div>
        }
      />

      <div ref={splitPaneRef} className="flex flex-1 flex-col gap-4 overflow-hidden lg:flex-row relative">
        <Card 
          style={{ width: typeof window !== 'undefined' && window.innerWidth >= 1024 ? `${leftWidthPercent}%` : '100%', flex: 'none' }}
          className="flex h-full flex-col overflow-hidden p-4"
        >
          <div className="mb-3 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.2em]">
            <span className={`topbar-chip ${aiStatus?.backendOnline ? 'text-accentEmerald' : 'text-accentOrange'}`}>
              Backend {aiStatus?.backendOnline ? 'online' : 'offline'}
            </span>
            <span className={`topbar-chip ${aiStatus?.groqConfigured ? 'text-accentEmerald' : 'text-accentOrange'}`}>
              Groq {aiStatus?.groqConfigured ? 'configured' : 'missing'}
            </span>
            <span className={`topbar-chip ${aiStatus?.streamingSupported ? 'text-accentBlue' : 'text-accentOrange'}`}>
              Streaming {aiStatus?.streamingSupported ? 'ready' : 'fallback mode'}
            </span>
          </div>

          {activeProvider === 'ollama' && aiStatus?.backendOnline && !aiStatus?.model.includes('qwen') && (
            <div className="mb-3 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-3 text-xs text-yellow-400">
              Ollama offline. Start Ollama or switch provider.
            </div>
          )}
          {activeProvider === 'groq' && aiStatus?.backendOnline && !aiStatus?.groqConfigured && (
            <div className="mb-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
              Provider not configured. Add backend environment key first.
            </div>
          )}

          <div className="flex flex-1 flex-col gap-2 overflow-y-auto pr-1">
            {messages.map((m, idx) => {
              const parsedCmd = m.role === 'user' ? parseCommandOffline(m.content) : null;
              
              return (
                <div key={m.id || idx} className="flex flex-col gap-2">
                  <ChatMessage message={m} onRetry={handleRetry} onEdit={handleEdit} />
                  {parsedCmd && !(m.content || '').includes('(Command') && (
                    <div className="ml-12 p-4 rounded-xl border border-accentBlue/25 bg-accentBlue/5 flex flex-col gap-3 max-w-md animate-fadeIn">
                      <div className="flex items-center gap-2 text-accentBlue">
                        <Sparkles className="h-4 w-4 fill-current" />
                        <span className="text-xs font-bold">Approve Action Request</span>
                      </div>
                      <p className="text-xs text-textSecondary">{parsedCmd.summary}</p>
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-[10px] rounded-lg"
                          onClick={() => {
                            updateMessage(m.id, { content: `${m.content || ''} (Command cancelled)` });
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          variant="primary"
                          className="h-8 text-[10px] rounded-lg bg-accentBlue text-white hover:bg-accentBlue/90"
                          onClick={() => {
                            const success = executeCommand(parsedCmd);
                            if (success) {
                              updateMessage(m.id, { content: `${m.content || ''} (Command applied successfully! ✓)` });
                            }
                          }}
                        >
                          Approve
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {isThinking && (
              <div className="mt-3 flex w-full animate-pulse justify-start">
                <div className="rounded-2xl rounded-bl-none border border-border-subtle bg-bgCard/60 p-3.5 text-xs text-textSecondary">
                  <span className="mb-1 block text-[8px] font-bold opacity-60">Shayla is typing...</span>
                  <div className="flex items-center gap-1 pt-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accentPurple" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accentPurple [animation-delay:0.2s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accentPurple [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="mt-4 flex w-full items-center justify-between rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-400">
                <span>Warning: {errorMsg}</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto border-t border-border-subtle/50 py-2.5 select-none">
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickChip(chip)}
                disabled={isThinking}
                className="shrink-0 whitespace-nowrap rounded-xl border border-border-subtle bg-bgSurface px-3 py-1.5 text-[10px] font-bold text-textSecondary transition hover:bg-bg-glass-hover hover:text-textPrimary active:scale-95 disabled:opacity-50"
              >
                {chip}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="mt-3 flex items-end gap-2 border-t border-border-subtle/50 pt-3"
          >
            <textarea
              ref={inputRef}
              rows={3}
              placeholder="Ask Shayla anything - Java DSA, German, resume, projects, daily plan, or motivation..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isThinking}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(input);
                }
              }}
              className="flex-1 resize-none rounded-xl border border-border-subtle bg-bgSurface px-4 py-3 text-xs text-textPrimary focus:border-accentBlue focus:outline-none disabled:opacity-50"
            />
            <Button type="submit" disabled={isThinking || !input.trim()} className="shrink-0 rounded-xl px-4 py-3 text-xs">
              Send
            </Button>
          </form>
          <p className="mt-2 text-[10px] text-textMuted">Press Enter to send. Shift+Enter makes a new line.</p>
        </Card>

        {/* Draggable Divider */}
        <div
          onMouseDown={handleMouseDown}
          className="hidden lg:flex w-1.5 hover:w-2.5 bg-border-subtle/50 hover:bg-accentBlue/60 cursor-col-resize transition-all rounded-full select-none justify-center items-center h-full group"
          title="Drag to resize panels"
        >
          <div className="w-[1.5px] h-10 bg-textMuted group-hover:bg-white rounded" />
        </div>

        <Card 
          style={{ width: typeof window !== 'undefined' && window.innerWidth >= 1024 ? `${98 - leftWidthPercent}%` : '100%', flex: 'none' }}
          className="flex h-full flex-col justify-between p-4"
        >
          <div className="flex flex-col gap-4">
            <span className="block pl-0.5 text-[10px] font-semibold uppercase tracking-wider text-textSecondary">Active AI Prompt Context</span>

            <div className="flex flex-col gap-2.5 rounded-xl border border-border-subtle bg-bgSurface/40 p-3.5 text-xs text-textSecondary">
              <div>
                <span className="block text-[9px] font-bold uppercase text-textMuted">Current day</span>
                <span className="font-bold text-textPrimary">Day {ctx.currentDay}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold uppercase text-textMuted">Topic</span>
                <span className="font-bold text-textPrimary">{ctx.currentTopic}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold uppercase text-textMuted">LC solved</span>
                <span className="font-mono font-bold text-textPrimary">{ctx.leetcodeSolved}/360</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold uppercase text-textMuted">Streak</span>
                <span className="font-mono font-bold text-accentOrange">{ctx.currentStreak} days</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold uppercase text-textMuted">Resume score</span>
                <span className="font-mono font-bold text-accentPurple">{ctx.resumeScore}%</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold uppercase text-textMuted">German level</span>
                <span className="font-mono font-bold text-accentEmerald">{ctx.germanLevel}</span>
              </div>
            </div>

            <div className="rounded-xl border border-dashed border-border-subtle p-2 text-[10px] leading-relaxed text-textMuted">
              <span className="font-semibold text-textSecondary">German goal context</span>: Shayla knows your goal to target German SWE placement opportunities. Ask her about daily vocabulary.
            </div>
          </div>

          <div className="flex items-center gap-2 border-t border-border-subtle/50 pt-3 text-[9px] text-textMuted">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accentEmerald" />
            <span>Secure backend proxy connection verified</span>
          </div>
        </Card>
      </div>
    </div>
  );
};
