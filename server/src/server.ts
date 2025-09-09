import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { generateRoomId } from './utils/generators';
import createConnectionHandler from './socket-handlers';
import type { Room, RoomId } from '../../shared/types'

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:3001"],
    methods: ["GET", "POST"]
  }
});

const rooms = new Map<RoomId, Room>();

app.use(express.json());

app.post('/api/create-room', (req, res) => {
  const roomId: RoomId = generateRoomId();
  rooms.set(roomId, {
    created: Date.now(),
    users: new Set()
  });

  console.log(`📱 Created room: ${roomId}`);
  res.json({ roomId });
});

const handleConnection = createConnectionHandler(io, rooms);
io.on('connection', handleConnection);


const PORT = 3001; // Different port to avoid conflicts with Vite
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});