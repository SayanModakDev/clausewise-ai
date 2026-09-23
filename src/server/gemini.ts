import 'server-only';
import { GoogleGenAI } from '@google/genai';

/**
 * Centralized Gemini model configuration for ClauseWise AI.
 *
 * PRIMARY_GEMINI_MODEL: State-of-the-art reasoning model for legal analysis.
 * FALLBACK_GEMINI_MODEL: Verified, high-availability fallback model with identical
 * structured JSON schema, multi-modal document, and thinking budget support.
 */
export const PRIMARY_GEMINI_MODEL = process.env.PRIMARY_GEMINI_MODEL || 'gemini-3.8-flash';
export const FALLBACK_GEMINI_MODEL = process.env.FALLBACK_GEMINI_MODEL || 'gemini-3.5-flash-lite';

// Backwards-compatible export for existing callers
export const GEMINI_MODEL = PRIMARY_GEMINI_MODEL;

export interface ModelExecutionConfig {
  model: string;
  thinkingConfig?: { thinkingBudget: number };
  temperature: number;
}

export const PRIMARY_GEMINI_CONFIG: ModelExecutionConfig = {
  model: PRIMARY_GEMINI_MODEL,
  ...(PRIMARY_GEMINI_MODEL.includes('lite') ? {} : { thinkingConfig: { thinkingBudget: 1024 } }),
  temperature: 0.1,
};

export const FALLBACK_GEMINI_CONFIG: ModelExecutionConfig = {
  model: FALLBACK_GEMINI_MODEL,
  ...(FALLBACK_GEMINI_MODEL.includes('lite') ? {} : { thinkingConfig: { thinkingBudget: 1024 } }),
  temperature: 0.1,
};

export const GEMINI_CONFIG = PRIMARY_GEMINI_CONFIG;

export type GeminiModelConfig = ModelExecutionConfig;

let cachedAiClient: GoogleGenAI | null = null;

/**
 * Returns an authenticated GoogleGenAI client or throws a descriptive server-side error.
 */
export function getGeminiClient(): GoogleGenAI {
  if (cachedAiClient) return cachedAiClient;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server. Please check your server environment.');
  }
  cachedAiClient = new GoogleGenAI({ apiKey });
  return cachedAiClient;
}

/**
 * Lazy-loaded GoogleGenAI client singleton.
 * Defers client initialization until first API invocation, allowing safe module
 * imports during testing and compilation.
 */
export const ai = new Proxy({} as GoogleGenAI, {
  get(_target, prop) {
    const client = getGeminiClient();
    const val = Reflect.get(client as unknown as object, prop);
    return typeof val === 'function' ? val.bind(client) : val;
  },
});

export interface ClassifiedGeminiError {
  status: number;
  code: string;
  message: string;
  isUnavailable: boolean; // 503 or high demand
  isRateLimited: boolean; // 429
  isQuotaExhausted: boolean; // 429 daily/monthly quota reached
  isAuthError: boolean; // 401, 403
  isClientError: boolean; // 400, 404
  isRetryable: boolean;
  retryAfterMs?: number;
}

/**
 * Parses and classifies an error from Gemini API or network layer.
 */
export function classifyGeminiError(err: unknown): ClassifiedGeminiError {
  const msg = err instanceof Error ? err.message : String(err);
  const errObj = (typeof err === 'object' && err !== null ? err : {}) as Record<string, unknown>;

  // Extract HTTP status code
  let status = 500;
  if (typeof errObj.status === 'number') {
    status = errObj.status;
  } else if (typeof errObj.statusCode === 'number') {
    status = errObj.statusCode;
  } else if (typeof errObj.code === 'number') {
    status = errObj.code;
  } else if (typeof errObj.status === 'string' && /^\d+$/.test(errObj.status)) {
    status = parseInt(errObj.status, 10);
  } else if (msg.includes('503') || msg.includes('UNAVAILABLE') || msg.includes('high demand')) {
    status = 503;
  } else if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
    status = 429;
  } else if (msg.includes('401') || msg.includes('UNAUTHENTICATED') || msg.includes('API key not valid')) {
    status = 401;
  } else if (msg.includes('403') || msg.includes('PERMISSION_DENIED')) {
    status = 403;
  } else if (msg.includes('404') || msg.includes('NOT_FOUND')) {
    status = 404;
  } else if (msg.includes('400') || msg.includes('INVALID_ARGUMENT')) {
    status = 400;
  }

  const isUnavailable =
    status === 503 ||
    msg.includes('503') ||
    msg.includes('UNAVAILABLE') ||
    msg.includes('high demand') ||
    msg.includes('Service Unavailable') ||
    msg.includes('temporarily overloaded') ||
    msg.includes('fetch failed');

  const isQuotaExhausted =
    msg.includes('Quota exceeded') ||
    msg.includes('GenerateContentRequestsPerDay') ||
    msg.includes('daily limit') ||
    msg.includes('exhausted your quota') ||
    msg.includes('insufficient quota');

  const isRateLimited = (status === 429 || msg.includes('RESOURCE_EXHAUSTED')) && !isQuotaExhausted;
  const isAuthError = status === 401 || status === 403 || msg.includes('API key') || msg.includes('GEMINI_API_KEY');
  const isClientError = status === 400 || status === 404;

  // Attempt to parse Retry-After guidance if provided by server
  let retryAfterMs: number | undefined;
  if (errObj.response && typeof errObj.response === 'object') {
    const resp = errObj.response as { headers?: { get?: (h: string) => string | null } };
    const retryHeader = resp.headers?.get?.('retry-after');
    if (retryHeader) {
      const parsedSec = parseFloat(retryHeader);
      if (!isNaN(parsedSec)) {
        retryAfterMs = parsedSec * 1000;
      }
    }
  }

  if (!retryAfterMs) {
    const match = msg.match(/retry(?:ing)? after (\d+(?:\.\d+)?)\s*(s|ms|seconds)?/i);
    if (match && match[1]) {
      const val = parseFloat(match[1]);
      const unit = (match[2] || 's').toLowerCase();
      retryAfterMs = unit === 'ms' ? val : val * 1000;
    }
  }

  // 503 and temporary 429 rate limits are retryable; 400, 401, 403, 404, quota exhaustion are NOT
  const isRetryable = (isUnavailable || isRateLimited) && !isQuotaExhausted && !isAuthError && !isClientError;

  return {
    status,
    code: String(errObj.status || errObj.code || status),
    message: msg,
    isUnavailable,
    isRateLimited,
    isQuotaExhausted,
    isAuthError,
    isClientError,
    isRetryable,
    retryAfterMs,
  };
}

export interface ExecuteModelOptions {
  overallBudgetMs?: number; // Total duration budget (default 35s to respect Vercel function limits)
  maxRetriesPerModel?: number; // Maximum additional retries per model (default 2 additional = 3 attempts total)
  initialDelayMs?: number; // Initial exponential backoff delay (default 1000ms)
  maxDelayMs?: number; // Maximum backoff delay cap (default 4000ms)
  signal?: AbortSignal;
  operationName?: string;
}

/**
 * Centralized Gemini request execution with bounded retries, jitter, and verified fallback.
 *
 * 1. Attempts PRIMARY_GEMINI_MODEL by default.
 * 2. If 503 UNAVAILABLE or temporary 429 occurs, retries up to 2 times with exponential backoff + jitter.
 * 3. If PRIMARY_GEMINI_MODEL returns persistent 503 after bounded retries, seamlessly invokes
 *    FALLBACK_GEMINI_MODEL with the remaining time budget.
 * 4. At most one fallback model is attempted per logical request (no recursive model cycling).
 * 5. Does not retry on 400, 401, 403, 404, or daily quota exhaustion.
 */
export async function executeWithModelFallback<T>(
  operation: (model: string, config: GeminiModelConfig, signal?: AbortSignal) => Promise<T>,
  options: ExecuteModelOptions = {}
): Promise<T> {
  const {
    overallBudgetMs = 35_000,
    maxRetriesPerModel = 2,
    initialDelayMs = 1000,
    maxDelayMs = 4000,
    signal,
    operationName = 'Gemini operation',
  } = options;

  const startTime = Date.now();
  const deadline = startTime + overallBudgetMs;

  const checkBudgetAndSignal = () => {
    if (signal?.aborted) {
      throw new Error(`${operationName} was aborted by client.`);
    }
    const remaining = deadline - Date.now();
    if (remaining <= 500) {
      throw new Error(`${operationName} exceeded execution time budget (${overallBudgetMs}ms).`);
    }
    return remaining;
  };

  const sleep = async (ms: number) => {
    if (ms <= 0) return;
    return new Promise<void>((resolve, reject) => {
      const timer = setTimeout(resolve, ms);
      if (signal) {
        signal.addEventListener(
          'abort',
          () => {
            clearTimeout(timer);
            reject(new Error(`${operationName} aborted during retry backoff.`));
          },
          { once: true }
        );
      }
    });
  };

  let lastError: unknown;
  const modelsToAttempt = [
    { model: PRIMARY_GEMINI_MODEL, config: PRIMARY_GEMINI_CONFIG, isPrimary: true },
    { model: FALLBACK_GEMINI_MODEL, config: FALLBACK_GEMINI_CONFIG, isPrimary: false },
  ];

  for (let modelIdx = 0; modelIdx < modelsToAttempt.length; modelIdx++) {
    const { model, config, isPrimary } = modelsToAttempt[modelIdx]!;

    for (let attempt = 0; attempt <= maxRetriesPerModel; attempt++) {
      checkBudgetAndSignal();

      try {
        const result = await operation(model, config, signal);
        if (!isPrimary) {
          console.info(`[Gemini] Fallback model (${model}) succeeded for ${operationName}.`);
        }
        return result;
      } catch (err: unknown) {
        lastError = err;
        const classified = classifyGeminiError(err);

        // Client errors (400, 404), auth errors (401, 403), and quota exhaustion are NOT retryable
        if (!classified.isRetryable) {
          console.error(
            `[Gemini] Non-retryable error on ${model} for ${operationName} (HTTP ${classified.status}): ${classified.message}`
          );
          throw err;
        }

        const remainingBudget = deadline - Date.now();
        const isLastAttemptForThisModel = attempt === maxRetriesPerModel;

        if (isLastAttemptForThisModel) {
          // If primary model exhausted retries with 503 UNAVAILABLE, fall back to FALLBACK_GEMINI_MODEL
          if (isPrimary && classified.isUnavailable && modelIdx < modelsToAttempt.length - 1) {
            console.warn(
              `[Gemini] Primary model (${model}) returned persistent HTTP 503 after ${
                attempt + 1
              } attempts. Attempting verified fallback model (${FALLBACK_GEMINI_MODEL}) with ${remainingBudget}ms remaining budget...`
            );
            break; // Break out of retry loop to move to fallback model
          } else {
            console.error(
              `[Gemini] All retry attempts exhausted for ${model} on ${operationName} (HTTP ${classified.status}).`
            );
            throw err;
          }
        }

        // Calculate backoff with full randomized jitter
        const baseDelay = Math.min(maxDelayMs, initialDelayMs * Math.pow(2, attempt));
        const jitter = Math.random() * 400;
        let delay = baseDelay + jitter;

        if (classified.retryAfterMs && classified.retryAfterMs > 0) {
          delay = Math.max(delay, classified.retryAfterMs);
        }

        // If delay exceeds remaining time budget, do not attempt another retry for this model
        if (delay >= remainingBudget - 1000) {
          if (isPrimary && classified.isUnavailable && modelIdx < modelsToAttempt.length - 1) {
            console.warn(
              `[Gemini] Insufficient remaining budget (${remainingBudget}ms) for further retries on ${model}. Switching to fallback model (${FALLBACK_GEMINI_MODEL})...`
            );
            break;
          }
          throw err;
        }

        console.warn(
          `[Gemini] Attempt ${attempt + 1}/${maxRetriesPerModel + 1} for ${model} failed (HTTP ${
            classified.status
          }). Retrying in ${Math.round(delay)}ms... (Remaining budget: ${Math.round(remainingBudget)}ms)`
        );

        await sleep(delay);
      }
    }
  }

  throw lastError;
}

/**
 * Executes a standalone Gemini operation (such as Files API upload) with exponential
 * backoff, full jitter, and error classification.
 */
export async function withGeminiRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 2,
  initialDelayMs = 1000,
  maxDelayMs = 4000
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (err: unknown) {
      lastError = err;
      const classified = classifyGeminiError(err);

      if (!classified.isRetryable || attempt === maxRetries) {
        throw err;
      }

      const baseDelay = Math.min(maxDelayMs, initialDelayMs * Math.pow(2, attempt));
      const jitter = Math.random() * 300;
      let delay = baseDelay + jitter;

      if (classified.retryAfterMs && classified.retryAfterMs > 0) {
        delay = Math.max(delay, classified.retryAfterMs);
      }

      console.warn(
        `[Gemini Files] Retry attempt ${attempt + 1}/${maxRetries + 1} after HTTP ${
          classified.status
        }. Waiting ${Math.round(delay)}ms...`
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}
