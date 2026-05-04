import type { Express, Request, Response } from 'express';

export function registerHealthRoutes(app: Express) {
  const handleHealth = (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  };

  app.get('/health', handleHealth);
  app.get('/api/health', handleHealth);
}
