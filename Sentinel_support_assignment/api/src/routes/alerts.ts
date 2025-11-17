// src/routes/alerts.ts
import express from 'express';
import prisma from '../prisma.ts';

const router = express.Router();

// GET /api/alerts → { count }
router.get('/', async (req, res) => {
  try {
    const count = await prisma.alert.count({
      where: { status: { in: ['OPEN', 'PENDING', 'IN_QUEUE'] } },
    });
    res.json({ count });
  } catch (err) {
    console.error('Error counting alerts:', err);
    res.status(500).json({ error: 'Failed to count alerts' });
  }
});

// POST /api/alerts → create a new alert
// Body: { suspectTxnId: string, risk: string, status: string }
router.post('/', async (req, res) => {
  try {
    const { suspectTxnId, risk, status } = req.body;

    if (!suspectTxnId || !risk || !status) {
      return res
        .status(400)
        .json({ error: 'suspectTxnId, risk, and status are required' });
    }

    // Make sure the transaction exists
    const txn = await prisma.transaction.findUnique({
      where: { id: suspectTxnId },
    });

    if (!txn) {
      return res.status(400).json({ error: 'Transaction not found' });
    }

    // Create alert, using the transaction's customerId to satisfy FK
    const alert = await prisma.alert.create({
      data: {
        customerId: txn.customerId,
        suspectTxnId,
        risk,
        status,
      },
    });

    res.status(201).json(alert);
  } catch (err) {
    console.error('Error creating alert:', err);
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

/**
 * GET /api/alerts/list
 * Returns recent alerts with customerId and other relevant fields.
 */
router.get('/list', async (req, res) => {
  try {
    const alerts = await prisma.alert.findMany({
      select: {
        id: true,
        customerId: true,
        suspectTxnId: true,
        risk: true,
        status: true,
        created_at: true, // matches your schema
      },
      orderBy: {
        created_at: 'desc',
      },
      take: 50,
    });

    console.log('alerts from /api/alerts/list:', alerts);
    res.json({ items: alerts });
  } catch (err) {
    console.error('Error fetching alerts list:', err);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

export default router;