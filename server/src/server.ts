import express from 'express';
import { createServer as createHttpServer } from 'http';
import { createServer as createHttpsServer } from 'https';
import { Server } from 'socket.io';
import { generateRoomId } from './utils/generators';
import createConnectionHandler from './socket-handlers';
import config from './config';
import type { Room, RoomId } from '../../shared/types'
import fs from 'node:fs'

const app = express();

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
  }
});

const rooms = new Map<RoomId, Room>();

app.use(express.json());

app.post('/api/create-room', (req, res) => {
  const roomId: RoomId = generateRoomId();
  rooms.set(roomId, {
    users: new Map()
  });

  console.log(`📱 Created room: ${roomId}`);
  res.json({ roomId });
});

const handleConnection = createConnectionHandler(io, rooms);
io.on('connection', handleConnection);


server.listen(config.port, config.host, () => {
  console.log(`🚀 Server running on https://${config.host}:${config.port}`);
  console.log(`🌍 Environment: ${config.nodeEnvironment}`);
});