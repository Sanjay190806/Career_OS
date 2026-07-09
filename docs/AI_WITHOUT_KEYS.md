# Shayla AI Without API Keys

Shayla has three behavior levels.

## Tracker Works Without Keys

The tracker itself does not need AI keys. Local-only mode, daily logs, focus timers, calendar, dashboard, backups, and progress tracking keep working from browser storage.

## Local Fallbacks Work Without Keys

Some Shayla surfaces use rule-based local fallback output when the backend or provider is unavailable. Examples include daily briefings, evening reviews, mock interview helpers, and some resume review paths.

These are useful coaching summaries, but they are not full generative AI.

## Full Chat Needs A Ready Provider

The full Shayla chat and AI mentor page call the backend AI provider router. Cloud providers require keys in `backend/.env`:

- `GROQ_API_KEY`
- `OPENROUTER_API_KEY`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GEMINI_API_KEY`

Without these keys, cloud providers report missing authentication.

## Free Local AI Option

Use Ollama or LM Studio if you want real AI responses without cloud API keys.

For Ollama:

```bash
ollama serve
ollama pull qwen2.5-coder:latest
```

Then choose **Offline Local Mode** or provider **Ollama** in AI settings.

If Ollama or LM Studio is not running, Shayla should show provider offline/missing and the tracker should continue working.
