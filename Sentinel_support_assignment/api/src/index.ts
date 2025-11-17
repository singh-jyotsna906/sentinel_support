import express from 'express';
import type { Request, Response } from 'express';

import ingestRouter from './routes/ingest.ts'
import prisma from './prisma.ts';
import customerRouter from './routes/customer.ts';
import insightsRouter from './routes/insights.ts';
import triageRouter from './routes/triage.ts';
import actionRouter from './routes/action.ts';
import { requireApiKey } from './middleware/auth.ts';
import { rateLimit } from './middleware/rateLimit.ts';
import observabilityRouter from './routes/observability.ts';
import alertsRouter from './routes/alerts.ts';
import kbRouter from './routes/kb.ts';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: 'http://localhost:5173', // your React dev origin
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-API-Key'],
  })
);

app.use(express.json());
app.use('/', observabilityRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/kb', kbRouter);
app.use('/api/ingest', requireApiKey, rateLimit, ingestRouter);
app.use('/api/customer', customerRouter);
app.use('/api/insights', insightsRouter);
app.use('/api/triage', rateLimit, triageRouter);
app.use('/api/action', requireApiKey, rateLimit, actionRouter);

app.get('/', (req: Request, res: Response) => {
  res.send('Sentinel Support API is running!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
