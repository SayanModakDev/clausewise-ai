import 'server-only';
import { GoogleGenAI } from '@google/genai';

/**
 * Centralized Gemini model configuration for ClauseWise AI.
 * Thinking budget of 1024 provides rigorous legal reasoning while maintaining
 * fast interactive latency suitable for live hackathon demos.
 */
export const GEMINI_CONFIG = {
  model: 'gemini-3.8-flash',
  fallbackModel: 'gemini-3.7-flash',
  fallbackModels: ['gemini-3.7-flash', 'gemini-3.5-flash'] as const,
  thinkingConfig: {
    thinkingBudget: 1024,
  },
  temperature: 0.1,
} as const;

export const GEMINI_MODEL = GEMINI_CONFIG.model;

/**
 * Returns an authenticated GoogleGenAI client or throws a descriptive server-side error.
 */
export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server. Please check your server environment.');
  }
  return new GoogleGenAI({ apiKey });
}

export const ai = getGeminiClient();

/**
 * Executes a Gemini operation with exponential backoff retry for transient 503 / 429 / UNAVAILABLE errors.
 */
export async function withGeminiRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  initialDelayMs = 1500
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (err: unknown) {
      lastError = err;
      const errorMessage = err instanceof Error ? err.message : String(err);
      const isTransient =
        errorMessage.includes('503') ||
        errorMessage.includes('429') ||
        errorMessage.includes('high demand') ||
        errorMessage.includes('RESOURCE_EXHAUSTED') ||
        errorMessage.includes('UNAVAILABLE') ||
        errorMessage.includes('fetch failed');

      if (!isTransient || attempt === maxRetries - 1) {
        throw err;
      }

      const delay = initialDelayMs * Math.pow(2, attempt) + Math.random() * 300;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}

/**
 * Runs a Gemini generation task with automatic fallback across models when quota/rate limits are met.
 */
export async function executeWithModelFallback<T>(
  operation: (modelName: string) => Promise<T>
): Promise<T> {
  const models = [GEMINI_CONFIG.model, ...GEMINI_CONFIG.fallbackModels];
  let lastError: unknown;

  for (let i = 0; i < models.length; i++) {
    const currentModel = models[i];
    try {
      return await withGeminiRetry(() => operation(currentModel), 2, 1000);
    } catch (err: unknown) {
      lastError = err;
      const msg = err instanceof Error ? err.message : String(err);
      const isQuota =
        msg.includes('RESOURCE_EXHAUSTED') ||
        msg.includes('429') ||
        msg.includes('Quota exceeded');

      if (isQuota && i < models.length - 1) {
        console.warn(
          `[Gemini Fallback] Quota reached for ${currentModel}; cascading to ${models[i + 1]}...`
        );
        continue;
      }
      throw err;
    }
  }

  throw lastError;
}
