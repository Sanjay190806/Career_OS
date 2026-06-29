import { env } from '../../config/env.js';
import { OpenAICompatibleProvider } from './openaiCompatible.provider.js';

export class GroqProvider extends OpenAICompatibleProvider {
  constructor() {
    super({
      name: 'groq',
      baseUrl: 'https://api.groq.com/openai/v1',
      apiKey: env.GROQ_API_KEY,
      apiKeyRequired: true,
      defaultModel: env.GROQ_MODEL || 'openai/gpt-oss-20b',
      fallbackModels: ['openai/gpt-oss-120b', 'llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'deepseek-r1-distill-llama-70b'],
      contextLength: 8192,
      streamingSupported: true,
      embeddingsSupported: false,
      inputCostPer1K: 0,
      outputCostPer1K: 0
    });
  }
}
