import { createApp } from './create-app';
import { createServer } from './create-server';
import { createSocketIO } from './create-socketio';
import createRoomsRouter from './routes/rooms';
import { runMigrations } from './db';
import RoomDestructionManager from './managers/room-destruction-manager';
import config, { getProtocol } from './config';
import type { Room, RoomId } from '../../shared/types/core';
import CleanupManager from './managers/cleanup-manager';

await runMigrations();
console.log('🗄️  DB schema up to date');

const rooms = new Map<RoomId, Room>();
const roomDestructionManager = new RoomDestructionManager(rooms);
const cleanupManager = new CleanupManager();

roomDestructionManager.start();
cleanupManager.start();

const app = createApp(rooms);
const server = createServer(app);
const io = createSocketIO(server, rooms, roomDestructionManager);

app.use('/api/rooms', createRoomsRouter(rooms, io));

server.listen(config.port, config.host, () => {
  console.log(`🚀 Server running on ${getProtocol(server)}://${config.host}:${config.port}`);
  console.log(`🌍 Environment: ${config.nodeEnvironment}`);
});

process.on('SIGTERM', () => {
  console.log('📴 SIGTERM received, shutting down gracefully');
  roomDestructionManager.stop();
  cleanupManager.stop();
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
