import express from 'express';
import authRoutes from './routes/auth';
import devicesRoutes from './routes/devices';
import turnRoutes from './routes/turn';
import createCallsRouter from './routes/calls';
import createRoomsRouter from './routes/rooms';
import contactsRoutes from './routes/contacts';
import usersRoutes from './routes/users';
import { generalApiLimiter } from './middleware/api-rate-limiters';
import config from './config';
import type { Room, RoomId } from '../../shared/types/core';

export function createApp(rooms: Map<RoomId, Room>) {
  const app = express();

  app.use(express.json());

  if (config.rateLimiting.trustProxy) {
    app.set('trust proxy', 1);
  }

  if (config.rateLimiting.enabled) {
    app.use('/api/', generalApiLimiter);
    console.log('🛡️  Rate limiting enabled for API endpoints');
  }

  app.use('/api/rooms', createRoomsRouter(rooms));
  app.use('/api/calls', createCallsRouter(rooms));
  app.use('/api/turn-credentials', turnRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/devices', devicesRoutes);
  app.use('/api/contacts', contactsRoutes);
  app.use('/api/users', usersRoutes);

  return app;
}
