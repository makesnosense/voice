import express from 'express';
import { createServer } from 'https';
import { Server } from 'socket.io';
import { generateRoomId } from './utils/generators';
import createConnectionHandler from './socket-handlers';
import type { Room, RoomId } from '../../shared/types'
import fs from 'node:fs'

const app = express();

const server = createServer({
  key: fs.readFileSync('../certs/key.pem'),
  cert: fs.readFileSync('../certs/cert.pem'),
}, app);

const io = new Server(server, {
  cors: {
    origin: [
      "https://localhost:5173"],
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


const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on https://localhost:${PORT}`);
});