import { createApp } from './create-app';
import { createServer } from './create-server';
import { setupSocketIO } from './setup-socketio';
import RoomDestructionManager from './managers/room-destruction-manager';
import config, { getProtocol } from './config';
import type { Room, RoomId } from '../../shared/types';

const rooms = new Map<RoomId, Room>();
const roomDestructionManager = new RoomDestructionManager(rooms);
roomDestructionManager.start();

const app = createApp(rooms);
const server = createServer(app);
const io = setupSocketIO(server, rooms, roomDestructionManager);

server.listen(config.port, config.host, () => {
  console.log(`🚀 Server running on ${getProtocol(server)}://${config.host}:${config.port}`);
  console.log(`🌍 Environment: ${config.nodeEnvironment}`);
});

process.on('SIGTERM', () => {
  console.log('📴 SIGTERM received, shutting down gracefully');
  roomDestructionManager.stop();
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
