import express from 'express';
import prisma from '../prisma.ts';
import { v4 as uuidv4 } from 'uuid';
import { logAudit } from '../utils/audit.ts';

const router = express.Router();

// POST /api/action/freeze-card
router.post('/freeze-card', async (req, res) => {
  const { cardId, otp } = req.body;
  const idempotencyKey = req.header('Idempotency-Key');
  const apiKey = req.header('X-API-Key');

  if (!cardId || !apiKey) {
    return res.status(400).json({ error: 'cardId and X-API-Key are required' });
  }

  // Placeholder: Check OTP requirement
  if (!otp) {
    // Audit log for OTP required
    await logAudit({
      caseId: cardId,
      actor: apiKey || 'unknown',
      action: 'freeze_card_pending_otp',
      payload: req.body
    });
    return res.json({ status: 'PENDING_OTP', requestId: uuidv4() });
  }

  // Placeholder: Freeze card in DB
  await prisma.card.update({
    where: { id: cardId },
    data: { status: 'FROZEN' }
  });

  // Audit log for freeze
  await logAudit({
    caseId: cardId,
    actor: apiKey || 'unknown',
    action: 'freeze_card',
    payload: req.body
  });

  res.json({ status: 'FROZEN', requestId: uuidv4() });
});

// POST /api/action/open-dispute
router.post('/open-dispute', async (req, res) => {
  console.log("In post")
  const { txnId, reasonCode, confirm } = req.body;
  const apiKey = req.header('X-API-Key');
  if (!txnId || !reasonCode || !confirm) {
    return res.status(400).json({ error: 'txnId, reasonCode, and confirm are required' });
  }

  // Placeholder: Create dispute case in DB
  const caseId = uuidv4();
  await prisma.case.create({
    data: {
      id: caseId,
      customerId: 'demo', // Should be looked up from txn
      txnId,
      type: 'DISPUTE',
      status: 'OPEN',
      reason_code: reasonCode,
      created_at: new Date()
    }
  });

  // Audit log for dispute
  await logAudit({
    caseId,
    actor: apiKey || 'unknown',
    action: 'open_dispute',
    payload: req.body
  });

  res.json({ caseId, status: 'OPEN' });
});

// GET /api/action/open-dispute → { count }
router.get('/open-dispute', async (req, res) => {
  // Count open dispute cases
  const count = await prisma.case.count({
    where: { type: 'DISPUTE', status: 'OPEN' }
  });
  res.json({ count });
});

export default router;
