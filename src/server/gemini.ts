import 'server-only';
import { GoogleGenAI } from '@google/genai';

/**
 * Centralized Gemini model configuration for ClauseWise AI.
 * Thinking budget of 1024 provides rigorous legal reasoning while maintaining
 * fast interactive latency suitable for live hackathon demos.
 */
export const GEMINI_CONFIG = {
  model: 'gemini-3.8-flash',
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
  maxRetries = 4,
  initialDelayMs = 2000
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

      const delay = initialDelayMs * Math.pow(2, attempt) + Math.random() * 500;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}
