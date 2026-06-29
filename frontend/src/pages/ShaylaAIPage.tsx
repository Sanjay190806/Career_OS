import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useAIStore } from '../app/store/useAIStore';
import { useCareerStore } from '../app/store/useCareerStore';
import { useAISettingsStore, AIProviderName } from '../app/store/useAISettingsStore';
import { useShaylaAgentStore } from '../app/store/useShaylaAgentStore';
import { useUIStore } from '../app/store/useUIStore';
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
import { buildAgentContext } from '../utils/agentContextUtils';
import { generateDailyBriefing, generateEveningReview } from '../services/agentService';
import { SmartNotificationCenter } from '../components/shayla-agent/SmartNotificationCenter';
import { buildSmartNotifications } from '../utils/smartNotificationUtils';
import { ShaylaBriefingResult, ShaylaSmartNotification } from '../types/shaylaAgent';
import { MobileShaylaDock } from '../components/mobile/MobileShaylaDock';
import { 
  Sparkles, PanelRightClose, PanelRight, ChevronDown, ChevronRight, 
  Send, ArrowDown, RefreshCw, Layers 
} from 'lucide-react';

const createId = (prefix = 'msg') => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
};

export const ShaylaAIPage: React.FC = () => {
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
  const streamingEnabled = useAISettingsStore((s) => s.streamingEnabled);
  const setStreamingEnabled = useAISettingsStore((s) => s.setStreamingEnabled);
  const temperature = useAISettingsStore((s) => s.temperature);
  
  const agentStore = useShaylaAgentStore((s) => s);

  // Layout UI Store settings
  const {
    shaylaChatHeight,
    shaylaRightPanelWidth,
    shaylaRightPanelCollapsed,
    shaylaAgentNotificationsCollapsed,
    shaylaQuickActionsCollapsed,
    setShaylaChatHeight,
    setShaylaRightPanelWidth,
    toggleShaylaRightPanel,
    toggleShaylaAgentNotifications,
    toggleShaylaQuickActions,
    resetShaylaLayout
  } = useUIStore();

  const [input, setInput] = useState('');
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [aiStatus, setAiStatus] = useState<{ backendOnline: boolean; groqConfigured: boolean; model: string; streamingSupported: boolean } | null>(null);
  
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const sendLockRef = useRef(false);
  const quickActionLockRef = useRef(0);
  const looksLikeLocalOllamaModel = /^(qwen|gemma|llama|deepseek|mistral|phi)/i.test(activeModel);

  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);
  const [showDevTools, setShowDevTools] = useState(import.meta.env.DEV);
  const [morningBriefing, setMorningBriefing] = useState<ShaylaBriefingResult | null>(null);
  const [eveningReview, setEveningReview] = useState<ShaylaBriefingResult | null>(null);
  const [notifications, setNotifications] = useState<ShaylaSmartNotification[]>([]);
  const [agentLoading, setAgentLoading] = useState(false);

  // Accordion collapsible states
  const [widgetsExpanded, setWidgetsExpanded] = useState<Record<string, boolean>>({
    trackerContext: true,
    aiModel: true,
    agentMode: true,
    germanGoal: false,
    memory: false
  });

  const toggleWidget = (wKey: string) => {
    setWidgetsExpanded(prev => ({ ...prev, [wKey]: !prev[wKey] }));
  };

  const providerModels: Record<AIProviderName, string[]> = {
    groq: [
      'openai/gpt-oss-20b',
      'openai/gpt-oss-120b',
      'llama-3.1-8b-instant',
      'llama-3.3-70b-versatile'
    ],
    ollama: [
      'qwen2.5-coder:latest',
      'qwen2.5-coder:7b',
      'gemma4:e4b',
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

  const quickChips = [
    'Explain today\'s DSA pattern',
    'Give me a hint only',
    'Review my progress honestly',
    'German phrase for today',
    'Roast my excuses professionally',
    'Review my resume readiness'
  ];

  const ctx = useMemo(() => buildAIContext(careerState), [careerState]);

  const contextLength = useMemo(() => {
    return messages.reduce((acc, m) => acc + (m.content?.length || 0), 0);
  }, [messages]);

  const contextTokens = useMemo(() => {
    return Math.ceil(contextLength / 4);
  }, [contextLength]);

  const scrollToBottom = (force = false) => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const nearBottom = scrollHeight - scrollTop - clientHeight < 150;
      if (force || nearBottom) {
        chatContainerRef.current.scrollTo({
          top: scrollHeight,
          behavior: force ? 'smooth' : 'auto'
        });
      }
    }
  };

  // Scroll detection
  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const nearBottom = scrollHeight - scrollTop - clientHeight < 150;
      setShowScrollBottomBtn(!nearBottom && scrollHeight > clientHeight);
    }
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

  useEffect(() => {
    const rawNotifications = buildSmartNotifications(buildAgentContext(careerState));
    const activeNotifications = rawNotifications.filter(
      (n) => !agentStore.dismissedNotifications.includes(n.id)
    );
    setNotifications(activeNotifications);
  }, [careerState, agentStore.dismissedNotifications]);

  const handleSend = async (text: string) => {
    const prompt = text.trim();
    if (!prompt || isThinking || sendLockRef.current) return;

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
    setInput('');
    if (inputRef.current) {
      inputRef.current.style.height = '48px'; // Reset composer height
    }
    
    // Force scroll to bottom for the new message
    setTimeout(() => scrollToBottom(true), 50);

    const startTime = Date.now();
    try {
      if (streamingEnabled) {
        let streamingReply = '';
        try {
          await aiService.sendMessageStream(
            outboundMessages,
            ctx,
            (token) => {
              streamingReply += token;
              updateMessage(assistantMsgId, {
                content: streamingReply,
                status: 'streaming'
              });
            }
          );
          setLatencyMs(Date.now() - startTime);
          updateMessage(assistantMsgId, {
            content: streamingReply,
            status: 'complete'
          });
        } catch (streamError) {
          if (streamError instanceof ApiError && (streamError.code === 'groq_rate_limited' || streamError.code === 'ai_rate_limited' || streamError.code === 'provider_rate_limited' || streamError.status === 429)) {
            const errorContent = 'Groq is rate-limited right now. Wait 1-2 minutes or switch to a lighter model.';
            updateMessage(assistantMsgId, {
              content: errorContent,
              status: 'failed',
              error: errorContent
            });
            setThinking(false);
            sendLockRef.current = false;
            return;
          }

          // Fallback to standard chat on other streaming failures
          const response = await aiService.sendMessage(outboundMessages, ctx);
          setLatencyMs(Date.now() - startTime);
          updateMessage(assistantMsgId, {
            content: response.reply,
            status: 'complete'
          });
        }
      } else {
        const response = await aiService.sendMessage(outboundMessages, ctx);
        setLatencyMs(Date.now() - startTime);
        updateMessage(assistantMsgId, {
          content: response.reply,
          status: 'complete'
        });
      }
    } catch (fallbackError: any) {
      const errorContent = fallbackError instanceof ApiError && (fallbackError.code === 'groq_rate_limited' || fallbackError.code === 'ai_rate_limited' || fallbackError.code === 'provider_rate_limited')
        ? 'Groq is rate-limited right now. Wait 1-2 minutes or switch to a lighter model.'
        : fallbackError instanceof ApiError && fallbackError.code === 'ai_payload_too_large'
          ? 'This chat thread is too long. Start a new chat or clear history.'
          : fallbackError instanceof ApiError
            ? fallbackError.message
            : fallbackError?.message || 'Shayla backend is not reachable.';
      
      updateMessage(assistantMsgId, {
        content: errorContent,
        status: 'failed',
        error: errorContent
      });
    } finally {
      setThinking(false);
      sendLockRef.current = false;
    }
  };

  const handleQuickChip = (chip: string) => {
    if (isThinking || sendLockRef.current) return;
    const now = Date.now();
    if (now - quickActionLockRef.current < 300) return;
    quickActionLockRef.current = now;
    setInput(chip);
    inputRef.current?.focus();
    if (inputRef.current) {
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 180)}px`;
    }
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

  const generateAgentBriefing = async (kind: 'morning' | 'recovery' | 'evening') => {
    setAgentLoading(true);
    try {
      const snapshot = buildAgentContext(careerState);
      const aiBody = {
        provider: activeProvider,
        model: activeModel,
        mode: activeMode,
        streaming: aiStatus?.streamingSupported ?? true,
      };

      if (kind === 'evening') {
        const result = await generateEveningReview(snapshot, aiBody);
        setEveningReview(result);
        agentStore.recordEveningReview({
          id: `review-${Date.now()}`,
          kind: 'evening',
          title: result.title,
          summary: result.summary,
          generatedAt: result.generatedAt,
          fallbackUsed: result.fallbackUsed,
        });
        return;
      }

      const result = await generateDailyBriefing(kind, snapshot, aiBody);
      setMorningBriefing(result);
      agentStore.recordBriefing({
        id: `briefing-${Date.now()}`,
        kind,
        title: result.title,
        summary: result.summary,
        generatedAt: result.generatedAt,
        fallbackUsed: result.fallbackUsed,
      });
    } finally {
      setAgentLoading(false);
    }
  };

  // Resize dragging mechanics
  const [draggingWidth, setDraggingWidth] = useState(false);
  const [draggingHeight, setDraggingHeight] = useState(false);
  
  const resizeStartRef = useRef<{ x: number; y: number; startW: number; startH: number } | null>(null);

  const startWidthResize = (e: React.MouseEvent) => {
    e.preventDefault();
    resizeStartRef.current = { x: e.clientX, y: e.clientY, startW: shaylaRightPanelWidth, startH: shaylaChatHeight };
    setDraggingWidth(true);
  };

  const startHeightResize = (e: React.MouseEvent) => {
    e.preventDefault();
    resizeStartRef.current = { x: e.clientX, y: e.clientY, startW: shaylaRightPanelWidth, startH: shaylaChatHeight };
    setDraggingHeight(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggingWidth && resizeStartRef.current) {
        // Dragging left increases width
        const deltaX = resizeStartRef.current.x - e.clientX;
        setShaylaRightPanelWidth(resizeStartRef.current.startW + deltaX);
      }
      if (draggingHeight && resizeStartRef.current) {
        // Dragging down increases height
        const deltaY = e.clientY - resizeStartRef.current.y;
        setShaylaChatHeight(resizeStartRef.current.startH + deltaY);
      }
    };

    const handleMouseUp = () => {
      setDraggingWidth(false);
      setDraggingHeight(false);
    };

    if (draggingWidth || draggingHeight) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingWidth, draggingHeight, setShaylaRightPanelWidth, setShaylaChatHeight]);

  return (
    <div className="fade-in flex flex-col gap-6 pb-6 h-full min-h-0 relative z-10">
      <MobileShaylaDock />
      <SectionHeader
        title="Shayla AI Mentor"
        subtitle="German learning companion - Java DSA guide - resume reviewer - project coach - daily accountability partner"
        actions={
          <div className="flex items-center gap-1.5">
            <Button onClick={toggleShaylaRightPanel} variant="ghost" className="rounded-xl p-2 text-textMuted" title="Toggle Right Dashboard">
              {shaylaRightPanelCollapsed ? <PanelRight className="h-4 w-4" /> : <PanelRightClose className="h-4 w-4" />}
            </Button>
            <Button onClick={resetShaylaLayout} variant="ghost" className="rounded-xl py-1 text-xs h-[28px] text-textMuted" title="Reset Layout Sizes">
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        }
      />

      {/* Main Workspace Frame */}
      <div className="flex flex-1 gap-5 items-start w-full" style={{ height: 'calc(100vh - 220px)', minHeight: 620, maxHeight: 'calc(100vh - 160px)' }}>
        
        {/* LEFT PANEL: Chat Workspace Container */}
        <Card 
          className="shayla-chat-card flex flex-col lg:min-h-[620px] h-[calc(100vh-220px)] max-h-[calc(100vh-160px)] overflow-hidden border-white/5 relative z-10 w-full"
          style={{ flex: 1 }}
        >
          {/* ChatTopBar (Mode, Provider, Model, Actions, Status) */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle/50 p-4 shrink-0 bg-bgSurface/20">
            <div className="flex flex-wrap items-center gap-3">
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
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                onClick={() => {
                  const activeMessages = useAIStore.getState().messages;
                  if (activeMessages.length > 1) {
                    const firstUserMsg = activeMessages.find(m => m.role === 'user');
                    const title = firstUserMsg ? (firstUserMsg.content.slice(0, 40) + (firstUserMsg.content.length > 40 ? '...' : '')) : 'Chat Session';
                    const saveChat = useCareerStore.getState().saveChatSession;
                    if (saveChat) {
                      saveChat({
                        id: `chat-${Date.now()}`,
                        title,
                        messages: activeMessages,
                        savedAt: new Date().toISOString()
                      });
                    }
                  }
                  clearChat();
                  setInput('');
                  inputRef.current?.focus();
                }}
                variant="primary"
                className="rounded-xl py-1 text-xs h-[28px]"
              >
                New Chat
              </Button>
              <Button
                onClick={() => {
                  const activeMessages = useAIStore.getState().messages;
                  if (activeMessages.length > 1) {
                    const firstUserMsg = activeMessages.find(m => m.role === 'user');
                    const title = firstUserMsg ? (firstUserMsg.content.slice(0, 40) + (firstUserMsg.content.length > 40 ? '...' : '')) : 'Chat Session';
                    const saveChat = useCareerStore.getState().saveChatSession;
                    if (saveChat) {
                      saveChat({
                        id: `chat-${Date.now()}`,
                        title,
                        messages: activeMessages,
                        savedAt: new Date().toISOString()
                      });
                    }
                  }
                  clearChat();
                }}
                variant="outline"
                className="rounded-xl py-1 text-xs h-[28px]"
              >
                Clear
              </Button>
            </div>
          </div>

          {/* AI Model metadata / token usage indicators */}
          <div className="flex flex-wrap items-center gap-4 px-4 py-2 border-b border-border-subtle/30 bg-bgSurface/10 text-[10px] text-textSecondary select-none shrink-0 font-mono">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-accentBlue" />
              <span>Context: <strong>{contextTokens.toLocaleString()} tokens</strong> / 32k max</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-accentEmerald" />
              <span>Latency: <strong>{latencyMs !== null ? `${latencyMs}ms` : 'N/A'}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-accentPurple" />
              <span>Cost: <strong>{activeProvider === 'ollama' || activeProvider === 'lmstudio' ? 'Local-first ($0.00)' : 'API-based (< $0.01)'}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-accentGold" />
              <span>System Temperature: <strong>{temperature}</strong></span>
            </div>
          </div>

          {/* AI Status Indicators & Toggle Chips */}
          <div className="flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] px-4 pt-3.5 pb-0 shrink-0">
            <span className={`topbar-chip ${aiStatus?.backendOnline ? 'text-accentEmerald' : 'text-accentOrange'}`}>
              Backend {aiStatus?.backendOnline ? 'online' : 'offline'}
            </span>
            <span className={`topbar-chip ${aiStatus?.groqConfigured ? 'text-accentEmerald' : 'text-accentOrange'}`}>
              Groq {aiStatus?.groqConfigured ? 'configured' : 'missing'}
            </span>
            <span className={`topbar-chip ${aiStatus?.streamingSupported ? 'text-accentBlue' : 'text-accentOrange'}`}>
              Streaming {aiStatus?.streamingSupported ? 'ready' : 'fallback'}
            </span>
            <Button size="sm" variant="ghost" onClick={toggleShaylaQuickActions} className="h-5 px-2 py-0 text-[8px] tracking-wider rounded bg-white/5 ml-auto shrink-0">
              {shaylaQuickActionsCollapsed ? 'Show Chips' : 'Hide Chips'}
            </Button>
          </div>

          {activeProvider === 'ollama' && aiStatus?.backendOnline && !looksLikeLocalOllamaModel && (
            <div className="mx-4 mt-2 mb-0 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-3 text-xs text-yellow-400 shrink-0">
              Pick one of your local Ollama models.
            </div>
          )}

          {/* Quick Chips Actions */}
          {!shaylaQuickActionsCollapsed && (
            <div className="mx-4 mb-2 flex gap-2 overflow-x-auto border-b border-border-subtle/50 pb-2.5 select-none shrink-0 scrollbar-none">
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
          )}

          {import.meta.env.DEV && (
            <div className="mx-4 mb-2 rounded-xl border border-border-subtle/50 bg-bgSurface/20 p-2 text-[10px] shrink-0 font-mono">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-accentPurple uppercase tracking-wider">DEV TOOLS</span>
                <button
                  type="button"
                  onClick={() => setShowDevTools((visible) => !visible)}
                  className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-textSecondary transition hover:bg-white/10 hover:text-textPrimary focus:outline-none focus:ring-1 focus:ring-accentBlue"
                  aria-expanded={showDevTools}
                >
                  {showDevTools ? 'Hide Dev Tools' : 'Show Dev Tools'}
                </button>
              </div>
              {showDevTools && (
                <div className="mt-2 flex flex-wrap gap-2 items-center">
              <span className="font-bold text-accentPurple mr-2 uppercase tracking-wider">DEV TOOLS:</span>
              <button
                onClick={() => addMessage({
                  id: `user-${Date.now()}`,
                  role: 'user',
                  content: 'Test User Message',
                  createdAt: new Date().toISOString()
                })}
                className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg hover:bg-white/10 text-textPrimary transition"
              >
                Insert Test User Message
              </button>
              <button
                onClick={() => addMessage({
                  id: `msg-${Date.now()}`,
                  role: 'assistant',
                  content: 'Shayla test message visible.',
                  createdAt: new Date().toISOString()
                })}
                className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg hover:bg-white/10 text-textPrimary transition"
              >
                Insert Test Assistant Message
              </button>
              <button
                onClick={() => clearChat()}
                className="bg-red-500/10 border border-red-500/25 px-2.5 py-1 rounded-lg hover:bg-red-500/20 text-red-400 transition"
              >
                Clear Chat State
              </button>
              <button
                onClick={() => console.log('Current Messages State:', messages)}
                className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg hover:bg-white/10 text-textPrimary transition"
              >
                Print Chat State to Console
              </button>
              <button
                onClick={() => setStreamingEnabled(false)}
                className={`px-2.5 py-1 rounded-lg border transition ${
                  !streamingEnabled ? 'bg-accentBlue/20 border-accentBlue/40 text-accentBlue font-bold' : 'bg-white/5 border-white/10 text-textSecondary hover:bg-white/10'
                }`}
              >
                Toggle Streaming Off
              </button>
              <button
                onClick={() => setStreamingEnabled(true)}
                className={`px-2.5 py-1 rounded-lg border transition ${
                  streamingEnabled ? 'bg-accentBlue/20 border-accentBlue/40 text-accentBlue font-bold' : 'bg-white/5 border-white/10 text-textSecondary hover:bg-white/10'
                }`}
              >
                Toggle Streaming On
              </button>
                </div>
              )}
            </div>
          )}

          {/* Messages Listing Box (Scrollable) */}
          <div 
            ref={chatContainerRef} 
            onScroll={handleScroll}
            className="flex-1 min-h-[360px] overflow-y-auto scroll-smooth p-4 flex flex-col gap-[12px] select-text"
          >
            
            {messages.length <= 1 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 max-w-md mx-auto my-auto select-none opacity-80">
                <div className="h-12 w-12 rounded-2xl bg-accentPurple/10 flex items-center justify-center text-accentPurple mb-4">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h4 className="font-bold text-textPrimary text-sm">Ask Shayla anything</h4>
                <p className="text-xs text-textSecondary mt-1 leading-relaxed">
                  Ask Shayla anything — Java DSA, German, resume, projects, daily plan, or motivation.
                </p>
                {/* Temporary Test Button for Debugging */}
                {import.meta.env.DEV && (
                  <Button
                    onClick={() => {
                      addMessage({
                        id: `msg-${Date.now()}`,
                        role: 'assistant',
                        content: 'Shayla test message visible.',
                        createdAt: new Date().toISOString()
                      });
                    }}
                    variant="outline"
                    className="mt-6 text-[10px] uppercase font-bold tracking-widest border-dashed"
                  >
                    Insert Test Assistant Message
                  </Button>
                )}
              </div>
            ) : (
              messages.map((m, idx) => {
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
                              if (!m.id) return;
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
                              if (success && m.id) {
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
              })
            )}

            {isThinking && !messages.some(m => m.status === 'streaming' || m.status === 'sending') && (
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


          </div>

          {/* Scroll to bottom floating indicator */}
          {showScrollBottomBtn && (
            <button
              onClick={() => scrollToBottom(true)}
              className="absolute bottom-[112px] right-6 bg-bgSurface/90 border border-border-subtle px-3 py-1.5 rounded-full text-[10px] font-bold text-textPrimary flex items-center gap-1 hover:bg-bgSurface transition shadow-glow-blue z-20 focus:outline-none focus:ring-1 focus:ring-accentBlue"
            >
              <ArrowDown className="h-3 w-3" />
              <span>Scroll to Latest</span>
            </button>
          )}

          {/* Text Composer Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="mt-1 shrink-0 border-t border-border-subtle/50 p-4 z-20 flex items-end gap-2 bg-bgCard relative"
          >
            <textarea
              ref={inputRef}
              rows={1}
              placeholder="Ask Shayla anything - Java DSA, German, resume, projects, daily plan, or motivation..."
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                // Auto-resize composer height
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(Math.max(e.target.scrollHeight, 48), 180)}px`;
              }}
              disabled={isThinking}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(input);
                }
              }}
              className="flex-1 resize-none rounded-xl border border-border-subtle bg-bgSurface px-4 py-3 text-xs text-textPrimary focus:border-accentBlue focus:outline-none disabled:opacity-50 min-h-[48px] max-h-[180px] overflow-y-auto"
            />
            <Button type="submit" disabled={isThinking || !input.trim()} className="shrink-0 rounded-xl px-4 py-3 text-xs h-[48px] flex items-center justify-center">
              <Send className="h-4 w-4" />
            </Button>
          </form>

          {/* Bottom Resize Handle */}
          <div
            onMouseDown={startHeightResize}
            className="absolute bottom-0 left-0 right-0 h-1.5 cursor-ns-resize hover:bg-accentBlue/40 transition z-40 select-none"
            aria-label="Drag to resize height"
          />
        </Card>

        {/* RIGHT PANEL: Collapsible Widgets Dashboard */}
        {!shaylaRightPanelCollapsed ? (
          <div 
            style={{ width: shaylaRightPanelWidth }}
            className="hidden lg:flex h-full flex-col gap-4 overflow-y-auto shrink-0 relative pr-1 select-none"
          >
            {/* Widget 1: Tracker Context */}
            <Card className="border-white/5 p-4 flex flex-col gap-3">
              <div 
                onClick={() => toggleWidget('trackerContext')}
                className="flex items-center justify-between cursor-pointer group"
              >
                <span className="block text-[10px] font-bold uppercase tracking-wider text-textSecondary">
                  1. Active Tracker Context
                </span>
                {widgetsExpanded.trackerContext ? <ChevronDown className="h-4 w-4 text-textMuted" /> : <ChevronRight className="h-4 w-4 text-textMuted" />}
              </div>

              {widgetsExpanded.trackerContext && (
                <div className="flex flex-col gap-2.5 rounded-xl border border-border-subtle bg-bgSurface/40 p-3.5 text-xs text-textSecondary animate-fadeIn">
                  <div className="flex justify-between items-center border-b border-white/5 pb-1">
                    <span className="text-[9px] font-bold uppercase text-textMuted">Current day</span>
                    <span className="font-bold text-textPrimary">Day {ctx.currentDay}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-1">
                    <span className="text-[9px] font-bold uppercase text-textMuted">Topic</span>
                    <span className="font-bold text-textPrimary line-clamp-1">{ctx.currentTopic}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-1">
                    <span className="text-[9px] font-bold uppercase text-textMuted">LC solved</span>
                    <span className="font-mono font-bold text-textPrimary">{ctx.leetcodeSolved}/360</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-1">
                    <span className="text-[9px] font-bold uppercase text-textMuted">Streak</span>
                    <span className="font-mono font-bold text-accentOrange">{ctx.currentStreak} days</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-1">
                    <span className="text-[9px] font-bold uppercase text-textMuted">Resume score</span>
                    <span className="font-mono font-bold text-accentPurple">{ctx.resumeScore}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold uppercase text-textMuted">German level</span>
                    <span className="font-mono font-bold text-accentEmerald">{ctx.germanLevel}</span>
                  </div>
                </div>
              )}
            </Card>

            {/* Widget 2: AI Model Status */}
            <Card className="border-white/5 p-4 flex flex-col gap-3">
              <div 
                onClick={() => toggleWidget('aiModel')}
                className="flex items-center justify-between cursor-pointer group"
              >
                <span className="block text-[10px] font-bold uppercase tracking-wider text-textSecondary">
                  2. AI Model Status
                </span>
                {widgetsExpanded.aiModel ? <ChevronDown className="h-4 w-4 text-textMuted" /> : <ChevronRight className="h-4 w-4 text-textMuted" />}
              </div>

              {widgetsExpanded.aiModel && (
                <div className="rounded-xl border border-border-subtle bg-bgSurface/40 p-3.5 text-xs text-textSecondary flex flex-col gap-2 animate-fadeIn">
                  <div className="flex justify-between">
                    <span className="text-[9px] font-bold uppercase text-textMuted">Provider</span>
                    <span className="font-bold text-textPrimary uppercase">{activeProvider}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[9px] font-bold uppercase text-textMuted">Active Model</span>
                    <span className="font-bold text-textPrimary text-[10px] truncate max-w-[150px]">{activeModel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[9px] font-bold uppercase text-textMuted">Latency Tracker</span>
                    <span className="font-mono text-accentBlue font-bold">{useAISettingsStore.getState().usage?.averageLatency || 0}ms</span>
                  </div>
                </div>
              )}
            </Card>

            {/* Widget 3: Agent Mode */}
            <Card className="border-white/5 p-4 flex flex-col gap-3">
              <div 
                onClick={() => toggleWidget('agentMode')}
                className="flex items-center justify-between cursor-pointer group"
              >
                <span className="block text-[10px] font-bold uppercase tracking-wider text-textSecondary">
                  3. Agent Mode
                </span>
                {widgetsExpanded.agentMode ? <ChevronDown className="h-4 w-4 text-textMuted" /> : <ChevronRight className="h-4 w-4 text-textMuted" />}
              </div>

              {widgetsExpanded.agentMode && (
                <div className="rounded-xl border border-border-subtle bg-bgSurface/40 p-3.5 text-xs text-textSecondary flex flex-col gap-2.5 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase text-textMuted">Agent status</span>
                    <span className={`topbar-chip py-0 px-2 text-[10px] ${agentStore.agentModeEnabled ? 'text-accentEmerald bg-accentEmerald/10' : 'text-textMuted'}`}>
                      {agentStore.agentModeEnabled ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <div className="grid gap-1.5 mt-1">
                    <Button size="sm" variant="ghost" onClick={() => generateAgentBriefing('morning')} disabled={agentLoading} className="text-[10px] h-7">
                      Morning Briefing
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => generateAgentBriefing('recovery')} disabled={agentLoading} className="text-[10px] h-7">
                      Recovery Plan
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => generateAgentBriefing('evening')} disabled={agentLoading} className="text-[10px] h-7">
                      Evening Review
                    </Button>
                  </div>
                  {(morningBriefing || eveningReview) && (
                    <div className="mt-3 rounded-lg border border-border-subtle bg-white/[0.03] p-3 text-[10px] animate-fadeIn">
                      <p className="font-semibold text-textPrimary">{morningBriefing?.title || eveningReview?.title}</p>
                      <p className="mt-1 line-clamp-3 text-textMuted">{morningBriefing?.summary || eveningReview?.summary}</p>
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Widget 4: German Goal */}
            <Card className="border-white/5 p-4 flex flex-col gap-3">
              <div 
                onClick={() => toggleWidget('germanGoal')}
                className="flex items-center justify-between cursor-pointer group"
              >
                <span className="block text-[10px] font-bold uppercase tracking-wider text-textSecondary">
                  4. German Goal Context
                </span>
                {widgetsExpanded.germanGoal ? <ChevronDown className="h-4 w-4 text-textMuted" /> : <ChevronRight className="h-4 w-4 text-textMuted" />}
              </div>

              {widgetsExpanded.germanGoal && (
                <div className="rounded-xl border border-dashed border-border-subtle p-3 text-[11px] leading-relaxed text-textMuted animate-fadeIn">
                  <span className="font-semibold text-textSecondary">Target placement</span>: German SWE placement opportunities. Shayla helps with vocab, phrases, and German touchpoints.
                </div>
              )}
            </Card>

            {/* Widget 5: Recent Memory */}
            <Card className="border-white/5 p-4 flex flex-col gap-3">
              <div 
                onClick={() => toggleWidget('memory')}
                className="flex items-center justify-between cursor-pointer group"
              >
                <span className="block text-[10px] font-bold uppercase tracking-wider text-textSecondary">
                  5. AI Core Memory
                </span>
                {widgetsExpanded.memory ? <ChevronDown className="h-4 w-4 text-textMuted" /> : <ChevronRight className="h-4 w-4 text-textMuted" />}
              </div>

              {widgetsExpanded.memory && (
                <div className="rounded-xl border border-border-subtle bg-bgSurface/40 p-3 text-[11px] leading-normal text-textSecondary flex flex-col gap-2 max-h-[140px] overflow-y-auto animate-fadeIn">
                  {agentStore.briefingHistory?.length === 0 ? (
                    <span className="text-textMuted">No memories recorded yet.</span>
                  ) : (
                    agentStore.briefingHistory?.map((log, i) => (
                      <span key={i} className="pb-1 border-b last:border-b-0 border-white/5 text-textSecondary">• {log.title || 'Briefing'}: {log.summary}</span>
                    ))
                  )}
                </div>
              )}
            </Card>

            {/* Collapse Side Panel Button */}
            <Button size="sm" variant="ghost" onClick={toggleShaylaRightPanel} className="text-xs text-textMuted gap-1.5 mt-2">
              <PanelRightClose className="h-4 w-4" />
              Collapse context panel
            </Button>
          </div>
        ) : (
          /* Mini Vertical Icon Rail when Collapsed */
          <div className="hidden lg:flex flex-col items-center gap-4 bg-bgSurface/60 border border-border-subtle py-4 px-2.5 rounded-2xl h-full shrink-0 select-none">
            <button onClick={toggleShaylaRightPanel} title="Expand Context Panel" className="p-1.5 rounded-xl hover:bg-white/5 text-accentBlue">
              <PanelRight className="h-5 w-5" />
            </button>
            <span className="w-px h-8 bg-white/10" />
            <div className="flex flex-col gap-4 text-textMuted text-[10px] font-black uppercase writing-mode-vertical">
              <span>CONTEXT</span>
            </div>
          </div>
        )}

        {/* Vertical Resize Handle */}
        {!shaylaRightPanelCollapsed && (
          <div
            onMouseDown={startWidthResize}
            className="hidden lg:block w-1 cursor-col-resize hover:w-2 bg-border-subtle/50 hover:bg-accentBlue/60 h-full transition-all select-none"
            aria-label="Drag to resize panel width"
          />
        )}
      </div>

      {/* Collapsible Agent Notifications */}
      <div className="flex flex-col gap-2.5 mt-2">
        <div className="flex justify-between items-center">
          <Button size="sm" variant="ghost" onClick={toggleShaylaAgentNotifications} className="text-xs text-textMuted gap-1.5">
            <Layers className="h-4 w-4" />
            {shaylaAgentNotificationsCollapsed ? 'Show Agent Notifications' : 'Hide Agent Notifications'}
          </Button>
        </div>

        {!shaylaAgentNotificationsCollapsed && (
          <SmartNotificationCenter
            notifications={notifications}
            onAction={(notification) => {
              if (notification.actionPrompt) {
                handleSend(notification.actionPrompt);
              }
            }}
            onDismiss={(notification) => agentStore.dismissNotification(notification.id)}
            title="Agent notifications"
          />
        )}
      </div>
    </div>
  );
};
