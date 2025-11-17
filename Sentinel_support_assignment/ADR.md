# Architecture Decision Record (ADR)

1. **PostgreSQL + Prisma as the primary data layer**  
   - *Decision*: Use PostgreSQL as the relational DB with Prisma as the ORM.  
   - *Rationale*: Postgres is battle‑tested for financial/transactional workloads and gives robust indexing, JSONB, and transactional guarantees. Prisma provides a typed client, schema‑first modeling, migrations, and works well with TypeScript, speeding up iteration while still allowing raw SQL for hot paths.

2. **Keyset pagination for high‑volume transaction queries**  
   - *Decision*: `/api/customer/:id/transactions` uses keyset pagination (`cursor` + `limit`) instead of offset/limit.  
   - *Rationale*: At ≥1M rows, offset‑based pagination becomes slow and unstable as pages get deeper. Keyset pagination leverages indexes (`customer_id, ts DESC`) for consistent p95 latency <100 ms and avoids duplicate/omitted rows when new transactions are inserted.

3. **Server‑Sent Events (SSE) for triage streaming instead of WebSockets**  
   - *Decision*: Triage runs stream events via SSE: `GET /api/triage/:runId/stream`.  
   - *Rationale*: Streaming is strictly server→client, low‑frequency, and append‑only. SSE is simpler to implement (no WS handshake, no custom protocol), fits HTTP infra well, supports automatic reconnection with `Last-Event-ID`, and keeps the API debuggable with curl while still meeting real‑time UX needs.

4. **Redis for rate limiting and background orchestration support**  
   - *Decision*: Use Redis as a shared infra component for token‑bucket rate limiting and background job coordination.  
   - *Rationale*: Redis offers atomic operations and expirations ideal for 5 r/s per‑client throttling, idempotency tracking, and simple job queues. Keeping rate limit state in Redis makes scaling the API horizontally trivial, as all instances share limits and tokens.

5. **Deterministic rule‑based agents with optional LLM behind a feature flag**  
   - *Decision*: Fraud, Insights, Compliance, and Redactor agents are deterministic rule engines; LLM phrasing is optional and guarded by a flag.  
   - *Rationale*: The system must work offline and be predictable for audits. Rules guarantee determinism and debuggability; the LLM is an enhancement for explanation quality, not a dependency. When the flag is off (or the model fails), the rules still produce complete outputs.

6. **Orchestrator + sub‑agent pattern for triage flows**  
   - *Decision*: Implement a central Planner/Orchestrator that runs a bounded plan like `["getProfile","recentTx","riskSignals","kbLookup","decide","proposeAction"]` and invokes tools/agents with timeouts, retries, and circuit breakers.  
   - *Rationale*: A single orchestrator makes it easy to enforce global guardrails (5 s budget, per‑tool timeouts, retry policy), capture traces, and evolve the plan. Sub‑agents remain composable, testable units that can be independently evaluated and replaced.

7. **Dedicated Redactor agent and masked logging for PII safety**  
   - *Decision*: All user/tool text entering logs, traces, or UI is passed through a Redactor agent that masks PAN‑like sequences and other sensitive fields; logs carry a `masked` flag.  
   - *Rationale*: Payment data requires strong guarantees that 13–19 digit PAN‑like strings never appear outside the DB. Centralizing redaction as a tool avoids ad‑hoc masking, keeps the policy testable, and supports future extensions (e.g., email masking) without changing all call sites.

8. **Zod‑based schema validation for tool and API I/O**  
   - *Decision*: Use Zod schemas to validate inputs/outputs for tools, agents, and API handlers.  
   - *Rationale*: Schema validation catches mismatches early, labels traces with validation errors, and gives strong TypeScript types from the same source of truth. This is especially important in multi‑agent flows where one tool’s output feeds another’s input.

9. **Prometheus metrics + structured JSON logs for observability and evals**  
   - *Decision*: Expose `/metrics` in Prometheus format and log in structured JSON with fields like `requestId`, `runId`, `customerId_masked`, `event`, and `masked`.  
   - *Rationale*: The acceptance criteria require metrics (latency histograms, tool_call_total, rate_limit_block_total, etc.) and auditability. Prometheus is the de‑facto standard for metrics scraping; structured logs are machine‑parsable for debugging and for computing eval statistics (success rate, fallbacks, confusion matrix).

10. **Docker Compose for local, offline‑first environment**  
    - *Decision*: Ship a `docker-compose.yml` that brings up Postgres, Redis, API, and Web in one command.  
    - *Rationale*: The system must be runnable locally/offline with minimal friction. Docker Compose gives a reproducible environment for reviewers, bundles all dependencies, and mirrors a realistic multi‑service setup without requiring cloud infrastructure or extra tooling.