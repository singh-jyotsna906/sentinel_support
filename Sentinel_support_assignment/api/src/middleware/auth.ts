import type { Request, Response, NextFunction } from 'express';

// Example API keys and roles (in production, use DB or env/config)
const API_KEYS: Record<string, 'agent' | 'lead'> = {
  'agent-key': 'agent',
  'lead-key': 'lead'
};

export function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.header('X-API-Key');
  if (!apiKey || !API_KEYS[apiKey]) {
    return res.status(401).json({ error: 'Invalid or missing API key' });
  }
  // Attach role to request for RBAC
  (req as any).role = API_KEYS[apiKey];
  next();
}

export function requireRole(role: 'agent' | 'lead') {
  return (req: Request, res: Response, next: NextFunction) => {
    if ((req as any).role !== role) {
      return res.status(403).json({ error: 'Insufficient role' });
    }
    next();
  };
}
