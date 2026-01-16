import { Server } from 'socket.io';
import createConnectionHandler from './socket-handlers';
import config from './config';
import type { Server as HttpServer } from 'http';
import type { Room, RoomId } from '../../shared/types';
import type RoomDestructionManager from './managers/room-destruction-manager';

export function createSocketIO(
  server: HttpServer,
  rooms: Map<RoomId, Room>,
  roomDestructionManager: RoomDestructionManager
) {
  const io = new Server(server, {
    cors: {
      origin: config.corsOrigins,
      methods: ['GET', 'POST'],
    },
    pingTimeout: 20000,
    pingInterval: 25000,
    upgradeTimeout: 10000,
    allowEIO3: false,
  });

  const handleConnection = createConnectionHandler(io, rooms, roomDestructionManager);
  io.on('connection', handleConnection);

  return io;
}
