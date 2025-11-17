import express from 'express';
import prisma from '../prisma.ts';

const router = express.Router();

// GET /api/insights/:customerId/summary
router.get('/:customerId/summary', async (req, res) => {
  const customerId = req.params.customerId;

  // Fetch all transactions for the customer (last 1 year for perf)
  const since = new Date();
  since.setFullYear(since.getFullYear() - 1);

  const txns = await prisma.transaction.findMany({
    where: { customerId, ts: { gte: since } },
    select: {
      mcc: true,
      merchant: true,
      amount_cents: true,
      currency: true,
      ts: true,
      country: true,
      city: true,
      id: true
    }
  });

  // Category spend (by mcc)
  const categories: Record<string, { sum: number; count: number }> = {};
  let total = 0;
  for (const txn of txns) {
    if (!txn.mcc) continue;
    categories[txn.mcc] = categories[txn.mcc] || { sum: 0, count: 0 };
    const cat = categories[txn.mcc]!;
    cat.sum += txn.amount_cents;
    cat.count += 1;
    total += txn.amount_cents;
  }
  const categorySummary = Object.entries(categories).map(([name, v]) => ({
    name,
    pct: total ? v.sum / total : 0
  }));

  // Merchant mix
  const merchantCounts: Record<string, number> = {};
  for (const txn of txns) {
    merchantCounts[txn.merchant] = (merchantCounts[txn.merchant] || 0) + 1;
  }
  const topMerchants = Object.entries(merchantCounts)
    .map(([merchant, count]) => ({ merchant, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Monthly trend
  const monthly: Record<string, number> = {};
  for (const txn of txns) {
    const month = txn.ts.toISOString().slice(0, 7);
    monthly[month] = (monthly[month] || 0) + txn.amount_cents;
  }
  const monthlyTrend = Object.entries(monthly)
    .map(([month, sum]) => ({ month, sum }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // Anomalies: simple z-score on monthly sums
  const values = monthlyTrend.map(m => m.sum);
  const mean = values.reduce((a, b) => a + b, 0) / (values.length || 1);
  const std = Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2, 0) / (values.length || 1));
  const anomalies = monthlyTrend
    .map(m => ({
      ts: m.month,
      z: std ? (m.sum - mean) / std : 0,
      note: Math.abs(std ? (m.sum - mean) / std : 0) > 2 ? 'spike' : undefined
    }))
    .filter(a => a.note);

  res.json({
    topMerchants,
    categories: categorySummary,
    monthlyTrend,
    anomalies
  });
});

export default router;
