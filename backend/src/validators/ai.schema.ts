import { z } from 'zod';

export const aiMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1).max(4000)
});

export const aiChatRequestSchema = z.object({
  messages: z.array(aiMessageSchema).min(1).max(20),
  context: z.record(z.any()).optional().default({}),
  provider: z.string().optional(),
  model: z.string().optional(),
  mode: z.string().optional(),
  stream: z.boolean().optional(),
  temperature: z.number().optional(),
  maxTokens: z.number().optional(),
  systemPrompt: z.string().optional()
});

export type AIChatRequest = z.infer<typeof aiChatRequestSchema>;
