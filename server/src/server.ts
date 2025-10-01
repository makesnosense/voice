import express from 'express';
import { createServer as createHttpServer } from 'http';
import { createServer as createHttpsServer } from 'https';
import { Server } from 'socket.io';
import { generateRoomId, generateTurnCredentials } from './utils/generators';
import { generalApiLimiter, createRoomLimiter, turnCredentialsLimiter } from './utils/rate-limiter';
import createConnectionHandler from './socket-handlers';
import RoomDestructionManager from './room-destruction-manager';
import config from './config';
import type { Room, RoomId } from '../../shared/types'
import fs from 'node:fs'

const app = express();

// trust proxy if in production (for rate limiting)
if (config.rateLimiting.trustProxy) {
  app.set('trust proxy', 1);
}

const server = config.isProduction
  ? createHttpServer(app)
  : createHttpsServer({
    key: fs.readFileSync(config.ssl.keyPath),
    cert: fs.readFileSync(config.ssl.certPath),
  }, app);

const io = new Server(server, {
  cors: {
    origin: config.corsOrigins,
    methods: ["GET", "POST"]
  },
  pingTimeout: 20000,      // 20s (increased from 10s)
  pingInterval: 25000,     // 25s (increased from 5s)
  upgradeTimeout: 10000,   // 10s (increased from 5s)
  allowEIO3: false,
});

const rooms = new Map<RoomId, Room>();
const roomDestructionManager = new RoomDestructionManager(rooms);
roomDestructionManager.start();

if (config.rateLimiting.enabled) {
  app.use('/api/', generalApiLimiter);
  console.log('🛡️  Rate limiting enabled for API endpoints');
}

app.post('/api/create-room', (req, res) => {
  const roomId: RoomId = generateRoomId();
  rooms.set(roomId, {
    users: new Map()
  });

  console.log(`📱 Created room: ${roomId}`);
  res.json({ roomId });
});

app.get('/api/turn-credentials', (req, res) => {
  if (!config.turnSecret) {
    return res.status(500).json({ error: 'TURN server not configured' });
  };
  const credentials = generateTurnCredentials(config.turnSecret);
  res.json({
    username: credentials.username,
    credential: credentials.credential
  });
});

const handleConnection = createConnectionHandler(io, rooms, roomDestructionManager);
io.on('connection', handleConnection);

const isHttps = 'cert' in server && 'key' in server;
const protocol = isHttps ? 'https' : 'http';


server.listen(config.port, config.host, () => {
  console.log(`🚀 Server running on ${protocol}://${config.host}:${config.port}`);
  console.log(`🌍 Environment: ${config.nodeEnvironment}`);
});

// graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 SIGTERM received, shutting down gracefully');

  roomDestructionManager.stop();

  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});