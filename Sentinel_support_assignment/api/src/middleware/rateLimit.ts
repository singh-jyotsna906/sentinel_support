import type { Request, Response, NextFunction } from 'express';
// import { createClient } from 'redis'; // Uncomment and configure for real Redis

// Placeholder: In-memory store for demo (replace with Redis in production)
const buckets: Record<string, { tokens: number; last: number }> = {};
const RATE_LIMIT = 5; // 5 requests per second

export async function rateLimit(req: Request, res: Response, next: NextFunction) {
  const key = req.header('X-API-Key') ?? req.ip ?? 'unknown';
  const now = Date.now();
  const bucket = buckets[key] || { tokens: RATE_LIMIT, last: now };
  const elapsed = (now - bucket.last) / 1000;
  bucket.tokens = Math.min(RATE_LIMIT, bucket.tokens + elapsed * RATE_LIMIT);
  bucket.last = now;

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    buckets[key] = bucket;
    next();
  } else {
    res.set('Retry-After', '1');
    res.status(429).json({ error: 'Rate limit exceeded' });
  }
}
