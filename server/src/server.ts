import { createApp } from './create-app';
import { createServer } from './create-server';
import { createSocketIO } from './create-socketio';
import { runMigrations } from './db';
import RoomDestructionManager from './managers/room-destruction-manager';
import config, { getProtocol } from './config';
import type { Room, RoomId } from '../../shared/types/core';
import AuthCleanupManager from './managers/auth-cleanup-manager';

await runMigrations();
console.log('🗄️  DB schema up to date');

const rooms = new Map<RoomId, Room>();
const roomDestructionManager = new RoomDestructionManager(rooms);
const authCleanupManager = new AuthCleanupManager();

roomDestructionManager.start();
authCleanupManager.start();

const app = createApp(rooms);
const server = createServer(app);
const io = createSocketIO(server, rooms, roomDestructionManager);

server.listen(config.port, config.host, () => {
  console.log(`🚀 Server running on ${getProtocol(server)}://${config.host}:${config.port}`);
  console.log(`🌍 Environment: ${config.nodeEnvironment}`);
});

process.on('SIGTERM', () => {
  console.log('📴 SIGTERM received, shutting down gracefully');
  roomDestructionManager.stop();
  authCleanupManager.stop();
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
