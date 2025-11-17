import express from 'express';
import prisma from '../prisma.ts';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import { parse } from 'csv-parse/sync';

type TransactionInput = {
  id: string;
  customerId: string;
  cardId: string;
  mcc: string;
  merchant: string;
  amount_cents: number;
  currency: string;
  ts: string;          // ISO datetime string
  device_id: string;
  country: string;
  city: string;
  // Add other fields as needed
};

const router = express.Router();
const upload = multer();

/**
 * Ensure that the Customer and Card referenced by this transaction
 * exist in the database. If not, create them with placeholder data.
 */
async function ensureCustomerAndCard(txn: TransactionInput) {
  // Ensure customer exists
  await prisma.customer.upsert({
    where: { id: txn.customerId },
    update: {},
    create: {
      id: txn.customerId,
      name: 'Unknown Customer',           // placeholder
      email_masked: 'unknown@example.com',// placeholder
      kyc_level: 'unknown'                // placeholder
    }
  });

  // Ensure card exists
  await prisma.card.upsert({
    where: { id: txn.cardId },
    update: {},
    create: {
      id: txn.cardId,
      customerId: txn.customerId,
      last4: txn.cardId.slice(-4) || '0000', // placeholder from id
      network: 'unknown',                    // placeholder
      status: 'active'                       // placeholder
    }
  });
}

/**
 * Helper to normalize ts value to a Date Prisma accepts.
 */
function normalizeTransactionForPrisma(txn: TransactionInput) {
  return {
    ...txn,
    ts: new Date(txn.ts) // convert string → Date
  };
}

// POST /api/ingest/transactions (JSON)
router.post('/transactions', async (req, res, next) => {
  if (!req.is('application/json')) {
    return next(); // let the CSV route handle other content types
  }

  const transactions: TransactionInput[] = Array.isArray(req.body)
    ? (req.body as TransactionInput[])
    : [];

  const requestId = uuidv4();
  let count = 0;
  const errors: { id: string; error: string }[] = [];

  for (const raw of transactions) {
    const txn = raw as TransactionInput;

    if (!txn || !txn.id || !txn.customerId || !txn.cardId) {
      errors.push({
        id: txn?.id ?? 'unknown',
        error: 'Missing required fields: id, customerId, or cardId'
      });
      continue;
    }

    try {
      // Ensure related Customer and Card exist
      await ensureCustomerAndCard(txn);

      // Upsert transaction
      await prisma.transaction.upsert({
        where: { id: txn.id },
        update: normalizeTransactionForPrisma(txn),
        create: normalizeTransactionForPrisma(txn)
      });

      count++;
    } catch (err: any) {
      console.error('UPSERT ERROR for txn id', txn.id, err);
      errors.push({ id: txn.id, error: String(err) });
    }
  }

  return res.json({ accepted: true, count, requestId, errors });
});

// POST /api/ingest/transactions (CSV - multipart/form-data with "file" field)
router.post('/transactions', upload.single('file'), async (req, res) => {
  const file = req.file as Express.Multer.File | undefined;
  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const requestId = uuidv4();
  let count = 0;
  const errors: { id: string; error: string }[] = [];

  try {
    const csvString = file.buffer.toString('utf-8');
    const records = parse(csvString, {
      columns: true,
      skip_empty_lines: true
    }) as TransactionInput[];

    for (const raw of records) {
      const txn = raw as TransactionInput;

      if (!txn || !txn.id || !txn.customerId || !txn.cardId) {
        errors.push({
          id: txn?.id ?? 'unknown',
          error: 'Missing required fields: id, customerId, or cardId'
        });
        continue;
      }

      try {
        // Ensure related Customer and Card exist
        await ensureCustomerAndCard(txn);

        // Upsert transaction
        await prisma.transaction.upsert({
          where: { id: txn.id },
          update: normalizeTransactionForPrisma(txn),
          create: normalizeTransactionForPrisma(txn)
        });

        count++;
      } catch (err: any) {
        console.error('UPSERT ERROR for txn id', txn.id, err);
        errors.push({ id: txn.id, error: String(err) });
      }
    }

    return res.json({ accepted: true, count, requestId, errors });
  } catch (err) {
    console.error('CSV PARSE ERROR:', err);
    return res.status(400).json({ error: 'Invalid CSV format' });
  }
});

export default router;