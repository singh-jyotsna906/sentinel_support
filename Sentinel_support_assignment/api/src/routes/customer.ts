import express from 'express';
import prisma from '../prisma.ts';

const router = express.Router();

// GET /api/customer/:id/transactions?from=&to=&cursor=&limit=
router.get('/:id/transactions', async (req, res) => {
  const customerId = req.params.id;
  const { from, to, cursor, limit } = req.query;
  const take = Math.min(Number(limit) || 50, 200);

  // Keyset pagination: use ts + id as cursor
  let where: any = { customerId };
  if (typeof from === 'string') where.ts = { ...where.ts, gte: new Date(from) };
  if (typeof to === 'string') where.ts = { ...where.ts, lte: new Date(to) };
  if (typeof cursor === 'string') {
    // cursor format: ts_id (e.g., 2023-01-01T00:00:00.000Z_txnid)
    const [ts, id] = cursor.split('_');
    if (ts && id) {
      where.OR = [
        { ts: { lt: new Date(ts) } },
        { ts: new Date(ts), id: { lt: id } }
      ];
    }
  }

  const items = await prisma.transaction.findMany({
    where,
    orderBy: [{ ts: 'desc' }, { id: 'desc' }],
    take: take + 1
  });

  let nextCursor = null;
  if (items.length > take) {
    const last = items[take - 1];
    nextCursor = `${last.ts.toISOString()}_${last.id}`;
    items.length = take;
  }

  res.json({ items, nextCursor });
});

export default router;
