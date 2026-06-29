import { request, ApiError } from './apiClient';
import { AIMessage } from '../types';
import { useAISettingsStore } from '../app/store/useAISettingsStore';

const MAX_AI_MESSAGES = 8;
const MAX_AI_MESSAGE_CHARS = 2000;
const MAX_CONTEXT_STRING_CHARS = 600;
const MAX_CONTEXT_ARRAY_ITEMS = 8;
const MAX_CONTEXT_DEPTH = 3;

const trimForAI = (value: string, maxChars: number): string => {
  if (value.length <= maxChars) return value;
  return `${value.slice(0, Math.max(0, maxChars - 12)).trimEnd()}...[trimmed]`;
};

export function prepareAIMessagesForRequest(messages: AIMessage[]): AIMessage[] {
  return messages
    .filter((message) => message.role !== 'system' && message.status !== 'failed' && message.status !== 'streaming' && message.content.trim())
    .slice(-MAX_AI_MESSAGES)
    .map((message) => ({
      role: message.role,
      content: trimForAI(message.content.trim(), MAX_AI_MESSAGE_CHARS)
    }));
}

function compactAIContext(value: unknown, depth = 0): unknown {
  if (value == null) return value;
  if (typeof value === 'string') return trimForAI(value, MAX_CONTEXT_STRING_CHARS);
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (depth >= MAX_CONTEXT_DEPTH) return '[summary omitted]';

  if (Array.isArray(value)) {
    return value.slice(0, MAX_CONTEXT_ARRAY_ITEMS).map((item) => compactAIContext(item, depth + 1));
  }

  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .slice(0, 30)
        .map(([key, item]) => [key, compactAIContext(item, depth + 1)])
    );
  }

  return undefined;
}

export interface AIService {
  getStatus: () => Promise<{ backendOnline: boolean; groqConfigured: boolean; model: string; streamingSupported: boolean }>;
  testGroq: () => Promise<{ ok: boolean; message: string; model?: string }>;
  send: (messages: AIMessage[], context: any) => Promise<{ reply: string }>;
  sendMessage: (messages: AIMessage[], context: any) => Promise<{ reply: string }>;
  sendMessageStream: (
    messages: AIMessage[],
    context: any,
    onToken: (token: string) => void
  ) => Promise<void>;
  compare: (prompt: string, models: { provider: string; model: string }[]) => Promise<{ results: any[] }>;
  benchmark: (provider: string, model: string, categories: string[]) => Promise<{ results: any[] }>;
}

const getSettingsBody = (messages: AIMessage[], context: any) => {
  const settings = useAISettingsStore.getState();
  return {
    messages: prepareAIMessagesForRequest(messages),
    context: compactAIContext(context),
    provider: settings.activeProvider,
    model: settings.activeModel,
    mode: settings.activeMode,
    stream: settings.streamingEnabled,
    temperature: settings.temperature,
    maxTokens: settings.maxTokens,
    systemPrompt: settings.systemPrompt
  };
};

const sendAIRequest = async (messages: AIMessage[], context: any) => {
  const body = getSettingsBody(messages, context);
  const started = Date.now();
  const response = await request<any>('/ai/chat', {
    method: 'POST',
    body
  });

  const latency = Date.now() - started;
  if (response.metadata) {
    const finalLatency = response.metadata.latencyMs || latency;
    const usage = response.metadata.usage || { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
    const cost = usage.estimatedCostUsd || 0;
    useAISettingsStore.getState().recordUsage(usage.totalTokens, finalLatency, cost);
  }

  return response;
};

export const aiService: AIService = {
  getStatus: () => request<{ backendOnline: boolean; groqConfigured: boolean; model: string; streamingSupported: boolean }>('/ai/status'),
  testGroq: () => request<{ ok: boolean; message: string; model?: string }>('/ai/test', {
    method: 'POST',
    body: {}
  }),
  send: sendAIRequest,
  sendMessage: sendAIRequest,
  sendMessageStream: async (messages, context, onToken) => {
    const body = getSettingsBody(messages, context);
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    const response = await fetch(`${baseUrl}/ai/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      let message = `Streaming API returned status ${response.status}`;
      let code: string | undefined;

      try {
        const payload = await response.json();
        message = payload.error || payload.message || message;
        code = payload.code;
      } catch {
        // Fall back to the default status message when the body is not JSON.
      }

      throw new ApiError(message, response.status, code);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('Completions stream reader is not available.');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (trimmed.startsWith('event: done')) continue;

        if (trimmed.startsWith('data: ')) {
          try {
            const parsed = JSON.parse(trimmed.slice(6));
            if (parsed.token) {
              onToken(parsed.token);
            } else if (parsed.metadata) {
              const latency = parsed.metadata.latencyMs || 0;
              const usage = parsed.metadata.usage || { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
              const cost = usage.estimatedCostUsd || 0;
              useAISettingsStore.getState().recordUsage(usage.totalTokens, latency, cost);
            } else if (parsed.message) {
              throw new ApiError(parsed.message, response.status, parsed.code);
            }
          } catch (err) {
            if (err instanceof ApiError) {
              throw err;
            }
            // Ignore incomplete line chunks
          }
        }
      }
    }
  },
  compare: (prompt, models) => request<{ results: any[] }>('/ai/compare', {
    method: 'POST',
    body: {
      prompt,
      models,
      temperature: useAISettingsStore.getState().temperature,
      maxTokens: useAISettingsStore.getState().maxTokens
    }
  }),
  benchmark: (provider, model, categories) => request<{ results: any[] }>('/ai/benchmark', {
    method: 'POST',
    body: {
      provider,
      model,
      categories
    }
  })
};
