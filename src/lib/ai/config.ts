// The shopping assistant (components/assistant, app/api/assistant) answers
// shoppers' questions with Google Gemini. It is optional: without a key the
// chat button is simply not drawn and the route answers 503. The key is
// server-only — the browser only ever learns whether the assistant is on.

type Env = Record<string, string | undefined>

// Flash-Lite: measured against this shop (October 2026) it answered as well
// as gemini-3.8-flash in English and Amharic, at a fraction of the price, and
// usually in 3–7 seconds where Flash took anywhere from 3 to 30. GEMINI_MODEL
// overrides it (e.g. "gemini-3.8-flash"). The thinking level in gemini.ts
// must be one the model accepts ("minimal" is refused by 3.8 Flash).
export const DEFAULT_GEMINI_MODEL = "gemini-3.5-flash-lite"

export function geminiApiKey(env: Env = process.env): string | null {
  const key = env.GEMINI_API_KEY?.trim()
  return key ? key : null
}

export function isAssistantConfigured(env: Env = process.env): boolean {
  return geminiApiKey(env) !== null
}

export function assistantModel(env: Env = process.env): string {
  return env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL
}
