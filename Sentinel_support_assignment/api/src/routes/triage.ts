import express from 'express';
import prisma from '../prisma.ts';
import { v4 as uuidv4 } from 'uuid';
import { runOrchestration } from '../agents/orchestrator.ts';

const router = express.Router();

// POST /api/triage → starts a triage run (returns runId, alertId)
router.post('/', async (req, res) => {
  console.log("INas asduoas")
  const { alertId } = req.body;
  if (!alertId) {
    return res.status(400).json({ error: 'alertId is required' });
  }
  const runId = uuidv4();

  // Create triage run in DB (placeholder, orchestration logic to be added)
  await prisma.triageRun.create({
    data: {
      id: runId,
      alertId,
      started_at: new Date(),
      risk: 'pending',
      reasons: [],
      fallback_used: false,
      latency_ms: 0
    }
  });

  res.json({ runId, alertId });
});

// GET /api/triage/:runId/stream → streams triage events via SSE
router.get('/:runId/stream', async (req, res) => {
  const { runId } = req.params;

  // Set headers for SSE
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive'
  });
  res.flushHeaders();

  // Fetch triage run to get alertId and customerId
  const triageRun = await prisma.triageRun.findUnique({
    where: { id: runId },
    include: { alert: { select: { customerId: true } } }
  });
  if (!triageRun || !triageRun.alert) {
    res.write(`event: error\ndata: ${JSON.stringify({ error: 'Triage run not found' })}\n\n`);
    res.end();
    return;
  }
  const customerId = triageRun.alert.customerId;
  const alertId = triageRun.alertId;

  // Run orchestrator and stream events
  await runOrchestration(customerId, alertId, (event) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  });

  res.end();
});

export default router;

// GET /api/triage → { avgLatency }
router.get('/', async (req, res) => {
  console.log("IN triAGE")
  // Calculate average latency of triage runs
  const runs = await prisma.triageRun.findMany({
    select: { latency_ms: true },
    where: { latency_ms: { gt: 0 } }
  });
const avgLatency =
    runs.length > 0
      ? Math.round(
          runs.reduce((sum: any, r: { latency_ms: any; }) => sum + (r.latency_ms || 0), 0) / runs.length
        )
      : 0;
  res.json({ avgLatency });
});
