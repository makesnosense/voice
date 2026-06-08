import express from 'express';
import authRoutes from './routes/auth';
import devicesRoutes from './routes/devices';
import turnRoutes from './routes/turn';
import statusRoutes from './routes/status';

import contactsRoutes from './routes/contacts';
import usersRoutes from './routes/users';
import { generalApiLimiter } from './middleware/api-rate-limiters';
import config from './config';
import type { Request, Response, NextFunction } from 'express';

export function createApp() {
  const app = express();

  app.use(express.json());

  if (config.rateLimiting.trustProxy) {
    app.set('trust proxy', 1);
  }

  app.use('/', generalApiLimiter, statusRoutes);
  app.use('/api/', generalApiLimiter);

  app.use('/api/turn-credentials', turnRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/devices', devicesRoutes);
  app.use('/api/contacts', contactsRoutes);
  app.use('/api/users', usersRoutes);

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}
