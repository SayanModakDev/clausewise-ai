import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PRIMARY_GEMINI_MODEL,
  FALLBACK_GEMINI_MODEL,
  executeWithModelFallback,
  classifyGeminiError,
} from '../gemini';
import { documentAnalysisDataSchema } from '../../lib/schemas';

interface MockApiError extends Error {
  status?: number;
  statusCode?: number;
}

function createMockError(message: string, status?: number): MockApiError {
  const err = new Error(message) as MockApiError;
  if (status !== undefined) {
    err.status = status;
  }
  return err;
}

test('Gemini Resilience & Fallback Test Suite', async (t) => {
  // Test 1: Primary model succeeds on first attempt
  await t.test('1. Primary model succeeds on first attempt', async () => {
    let callCount = 0;
    const attemptedModels: string[] = [];

    const result = await executeWithModelFallback(
      async (model: string) => {
        callCount++;
        attemptedModels.push(model);
        return { success: true, modelUsed: model };
      },
      {
        overallBudgetMs: 5000,
        maxRetriesPerModel: 2,
        initialDelayMs: 20,
      }
    );

    assert.equal(result.success, true);
    assert.equal(result.modelUsed, PRIMARY_GEMINI_MODEL);
    assert.equal(callCount, 1);
    assert.deepEqual(attemptedModels, [PRIMARY_GEMINI_MODEL]);
  });

  // Test 2: Primary model returns 503, then succeeds on retry
  await t.test('2. Primary model returns 503, then succeeds on retry', async () => {
    let callCount = 0;
    const attemptedModels: string[] = [];

    const result = await executeWithModelFallback(
      async (model: string) => {
        callCount++;
        attemptedModels.push(model);
        if (callCount === 1) {
          throw createMockError('503 Service Unavailable: This model is currently experiencing high demand.', 503);
        }
        return { success: true, attempt: callCount };
      },
      {
        overallBudgetMs: 5000,
        maxRetriesPerModel: 2,
        initialDelayMs: 20,
      }
    );

    assert.equal(result.success, true);
    assert.equal(result.attempt, 2);
    assert.equal(callCount, 2);
    assert.deepEqual(attemptedModels, [PRIMARY_GEMINI_MODEL, PRIMARY_GEMINI_MODEL]);
  });

  // Test 3: Primary model returns persistent 503, fallback model succeeds
  await t.test('3. Primary model returns persistent 503, fallback model succeeds', async () => {
    let primaryAttempts = 0;
    let fallbackAttempts = 0;
    const modelSequence: string[] = [];

    const result = await executeWithModelFallback(
      async (model: string) => {
        modelSequence.push(model);
        if (model === PRIMARY_GEMINI_MODEL) {
          primaryAttempts++;
          throw createMockError('503 Service Unavailable: High demand on primary model.', 503);
        }
        fallbackAttempts++;
        return { success: true, modelAnswered: model };
      },
      {
        overallBudgetMs: 10000,
        maxRetriesPerModel: 2,
        initialDelayMs: 20,
      }
    );

    assert.equal(result.success, true);
    assert.equal(result.modelAnswered, FALLBACK_GEMINI_MODEL);
    // Primary was attempted 1 initial + 2 retries = 3 attempts
    assert.equal(primaryAttempts, 3);
    // Fallback succeeded on attempt 1
    assert.equal(fallbackAttempts, 1);
    assert.deepEqual(modelSequence, [
      PRIMARY_GEMINI_MODEL,
      PRIMARY_GEMINI_MODEL,
      PRIMARY_GEMINI_MODEL,
      FALLBACK_GEMINI_MODEL,
    ]);
  });

  // Test 4: Primary and fallback models both return 503 -> fails with 503
  await t.test('4. Primary and fallback models both return 503', async () => {
    let totalAttempts = 0;

    await assert.rejects(
      async () => {
        await executeWithModelFallback(
          async () => {
            totalAttempts++;
            throw createMockError('503 UNAVAILABLE: Service overloaded.', 503);
          },
          {
            overallBudgetMs: 5000,
            maxRetriesPerModel: 1, // 2 attempts per model = 4 attempts total
            initialDelayMs: 10,
          }
        );
      },
      (err: unknown) => {
        const classified = classifyGeminiError(err);
        assert.equal(classified.status, 503);
        assert.equal(classified.isUnavailable, true);
        return true;
      }
    );

    // 2 models * 2 attempts each = 4 total attempts
    assert.equal(totalAttempts, 4);
  });

  // Test 5: Primary model returns 429 quota exhaustion -> thrown immediately without retries
  await t.test('5. Primary model returns 429 quota exhaustion (not retried)', async () => {
    let attempts = 0;

    await assert.rejects(
      async () => {
        await executeWithModelFallback(
          async () => {
            attempts++;
            throw createMockError('429 RESOURCE_EXHAUSTED: Quota exceeded for GenerateContentRequestsPerDay', 429);
          },
          {
            overallBudgetMs: 5000,
            maxRetriesPerModel: 2,
            initialDelayMs: 20,
          }
        );
      },
      (err: unknown) => {
        const classified = classifyGeminiError(err);
        assert.equal(classified.status, 429);
        assert.equal(classified.isQuotaExhausted, true);
        assert.equal(classified.isRetryable, false);
        return true;
      }
    );

    // Must NOT retry exhausted daily quota
    assert.equal(attempts, 1);
  });

  // Test 6: Primary model returns invalid credentials (401/403) -> fails immediately without retry
  await t.test('6. Primary model returns invalid credentials (401/403)', async () => {
    let attempts = 0;

    await assert.rejects(
      async () => {
        await executeWithModelFallback(
          async () => {
            attempts++;
            throw createMockError('401 UNAUTHENTICATED: API key not valid. Please pass a valid API key.', 401);
          },
          {
            overallBudgetMs: 5000,
            maxRetriesPerModel: 2,
            initialDelayMs: 20,
          }
        );
      },
      (err: unknown) => {
        const classified = classifyGeminiError(err);
        assert.equal(classified.status, 401);
        assert.equal(classified.isAuthError, true);
        assert.equal(classified.isRetryable, false);
        return true;
      }
    );

    assert.equal(attempts, 1);
  });

  // Test 7: Fallback response fails schema validation -> caught cleanly
  await t.test('7. Fallback response fails schema validation', async () => {
    await assert.rejects(
      async () => {
        const result = await executeWithModelFallback(
          async (model: string) => {
            if (model === PRIMARY_GEMINI_MODEL) {
              throw createMockError('503 Service Unavailable', 503);
            }
            // Fallback returns invalid schema missing required fields
            return { invalidField: 'malformed output' };
          },
          {
            overallBudgetMs: 5000,
            maxRetriesPerModel: 0,
            initialDelayMs: 10,
          }
        );

        // Validate with actual Zod schema
        documentAnalysisDataSchema.parse(result);
      },
      (err: unknown) => {
        const errObj = (typeof err === 'object' && err !== null ? err : {}) as Record<string, unknown>;
        assert.ok(errObj.name === 'ZodError' || errObj.issues !== undefined);
        return true;
      }
    );
  });

  // Test 8: Request is cancelled via AbortSignal or exceeds time budget
  await t.test('8. Request is cancelled via AbortSignal', async () => {
    const controller = new AbortController();

    // Abort after 50ms
    setTimeout(() => controller.abort(), 50);

    await assert.rejects(
      async () => {
        await executeWithModelFallback(
          async () => {
            // First call fails with 503, triggering backoff sleep where abort triggers
            throw createMockError('503 UNAVAILABLE', 503);
          },
          {
            overallBudgetMs: 10000,
            maxRetriesPerModel: 3,
            initialDelayMs: 200,
            signal: controller.signal,
          }
        );
      },
      (err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        const name = err instanceof Error ? err.name : '';
        assert.ok(msg.includes('abort') || name === 'AbortError');
        return true;
      }
    );
  });
});
