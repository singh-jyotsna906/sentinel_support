import prisma from '../prisma.ts';
import { z } from 'zod';

// Circuit breaker state (in-memory, per tool)
const circuitBreaker: Record<string, { failures: number; openUntil: number }> = {};

// Helper: timeout for a promise
function withTimeout<T>(promise: Promise<T>, ms: number, step: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${step} timed out`)), ms);
    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

// Helper: retry with backoff and jitter
async function withRetry<T>(fn: () => Promise<T>, step: string, maxRetries = 2): Promise<T> {
  let attempt = 0;
  let delay = 150;
  while (attempt <= maxRetries) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxRetries) throw err;
      await new Promise((r) => setTimeout(r, delay + Math.floor(Math.random() * 50)));
      delay = 400;
      attempt++;
    }
  }
  throw new Error(`${step} failed after retries`);
}

// Helper: circuit breaker
function checkCircuitBreaker(step: string) {
  const state = circuitBreaker[step];
  if (state && state.failures >= 3 && Date.now() < state.openUntil) {
    throw new Error(`Circuit breaker open for ${step}`);
  }
}
function recordFailure(step: string) {
  const now = Date.now();
  if (!circuitBreaker[step]) circuitBreaker[step] = { failures: 0, openUntil: 0 };
  circuitBreaker[step].failures++;
  if (circuitBreaker[step].failures >= 3) {
    circuitBreaker[step].openUntil = now + 30000; // 30s
  }
}
function recordSuccess(step: string) {
  if (circuitBreaker[step]) {
    circuitBreaker[step].failures = 0;
    circuitBreaker[step].openUntil = 0;
  }
}

// Zod schemas for agent I/O
const getProfileSchema = z.object({ profile: z.object({ kyc: z.string(), risk: z.string() }) });
const recentTxSchema = z.object({ txns: z.array(z.any()) });
const riskSignalsSchema = z.object({ score: z.number(), reasons: z.array(z.string()), action: z.string() });
const kbLookupSchema = z.object({ citation: z.string(), extract: z.string() });
const decideSchema = z.object({ recommendedAction: z.string(), reasons: z.array(z.string()) });
const proposeActionSchema = z.object({ action: z.string() });

// Input sanitizer for prompt-injection
function sanitizeInput(text: string) {
  return text.replace(/[{}$;]/g, '');
}

// Types for agent results and traces
export type AgentTrace = {
  step: string;
  ok: boolean;
  duration: number;
  detail: any;
};

export type OrchestratorResult = {
  plan: string[];
  traces: AgentTrace[];
  fallbackUsed: boolean;
  recommendedAction?: string;
  reasons?: string[];
  citations?: string[];
};

// Sub-agent stubs (with schema validation)
async function getProfile(customerId: string) {
  const result = { profile: { kyc: 'FULL', risk: 'low' } };
  getProfileSchema.parse(result);
  return result;
}
async function recentTx(customerId: string) {
  const result = { txns: [] };
  recentTxSchema.parse(result);
  return result;
}
async function riskSignals(customerId: string) {
  const result = { score: 0.2, reasons: ['velocity'], action: 'none' };
  riskSignalsSchema.parse(result);
  return result;
}
async function kbLookup(query: string) {
  const result = { citation: 'KB-123', extract: 'Dispute policy...' };
  kbLookupSchema.parse(result);
  return result;
}
async function decide(context: any) {
  const result = { recommendedAction: 'Freeze Card', reasons: ['high risk'] };
  decideSchema.parse(result);
  return result;
}
async function proposeAction(context: any) {
  const result = { action: 'Freeze Card' };
  proposeActionSchema.parse(result);
  return result;
}

// Orchestrator (planner) with guardrails
export async function runOrchestration(customerId: string, alertId: string, streamEvent: (event: any) => void) {
  const plan = ['getProfile', 'recentTx', 'riskSignals', 'kbLookup', 'decide', 'proposeAction'];
  const traces: AgentTrace[] = [];
  let fallbackUsed = false;
  let context: any = {};
  const flowStart = Date.now();

  for (const step of plan) {
    const start = Date.now();
    try {
      checkCircuitBreaker(step);
      const result = await withRetry(
        () => withTimeout(
          (async () => {
            switch (step) {
              case 'getProfile':
                return await getProfile(customerId);
              case 'recentTx':
                return await recentTx(customerId);
              case 'riskSignals':
                return await riskSignals(customerId);
              case 'kbLookup':
                return await kbLookup(sanitizeInput('dispute'));
              case 'decide':
                return await decide(context);
              case 'proposeAction':
                return await proposeAction(context);
              default:
                return {};
            }
          })(),
          1000,
          step
        ),
        step
      );
      recordSuccess(step);
      context = { ...context, ...result };
      traces.push({ step, ok: true, duration: Date.now() - start, detail: result });
      streamEvent({ step, ok: true, ...result });
    } catch (err: any) {
      recordFailure(step);
      traces.push({ step, ok: false, duration: Date.now() - start, detail: { error: err.message } });
      streamEvent({ step, ok: false, error: err.message });
      fallbackUsed = true;
      break;
    }
    // Flow budget ≤5s
    if (Date.now() - flowStart > 5000) {
      streamEvent({ step, ok: false, error: 'Flow budget exceeded' });
      fallbackUsed = true;
      break;
    }
  }

  // Finalize
  streamEvent({
    step: 'decision_finalized',
    ok: true,
    recommendedAction: context.recommendedAction || 'None',
    reasons: context.reasons || [],
    citations: context.citation ? [context.citation] : []
  });

  return {
    plan,
    traces,
    fallbackUsed,
    recommendedAction: context.recommendedAction,
    reasons: context.reasons,
    citations: context.citation ? [context.citation] : []
  } as OrchestratorResult;
}
