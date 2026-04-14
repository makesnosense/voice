import { Server } from 'socket.io';
import createConnectionHandler from './socket-handlers';
import config from './config';
import { socketRateLimiter, SOCKET_CONNECTION_RATE_LIMIT } from './middleware/socket-rate-limiter';
import type { Server as HttpServer } from 'http';
import type {
  Room,
  RoomId,
  ClientToServerEvents,
  ServerToClientEvents,
  ExtendedConnectedSocket,
} from '../../shared/types/core';
import type RoomDestructionManager from './managers/room-destruction-manager';

const getClientIp = (socket: ExtendedConnectedSocket): string => {
  if (config.rateLimiting.trustProxy) {
    const forwardedHeader = socket.handshake.headers['x-forwarded-for'];
    if (forwardedHeader) {
      const firstIp = String(forwardedHeader).split(',')[0].trim();
      return firstIp;
    }
  }
  return socket.handshake.address;
};

export function createSocketIO(
  server: HttpServer,
  rooms: Map<RoomId, Room>,
  roomDestructionManager: RoomDestructionManager
) {
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
    cors: {
      origin: config.corsOrigins,
      methods: ['GET', 'POST'],
    },
    pingTimeout: 20000,
    pingInterval: 25000,
    upgradeTimeout: 10000,
    allowEIO3: false,
  });

  io.use((socket, next) => {
    if (!config.rateLimiting.enabled) return next();
    const ip = getClientIp(socket as ExtendedConnectedSocket);
    const allowed = socketRateLimiter.checkLimit(
      ip,
      'connection',
      SOCKET_CONNECTION_RATE_LIMIT.max,
      SOCKET_CONNECTION_RATE_LIMIT.windowMs
    );
    if (!allowed) {
      console.warn(`🚫 [RateLimit] connection rejected for ${ip}`);
      return next(new Error('too many connections'));
    }
    next();
  });

  const handleConnection = createConnectionHandler(io, rooms, roomDestructionManager);
  io.on('connection', handleConnection);

  return io;
}
