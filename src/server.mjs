import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { generateRoomId } from './utils/generators.mjs'

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const publicFolder = join(projectRoot, 'public');

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.static(publicFolder));

// store active rooms
const rooms = new Map();

app.get('/', (req, res) => res.sendFile(join(publicFolder, 'index.html')));

app.get('/:roomId', (req, res) => {
  const { roomId } = req.params;
  // check if room actually exists
  if (rooms.has(roomId)) {
    res.sendFile(join(publicFolder, 'room.html'));
  } else {
    res.status(404).send('Room not found');
  }
});

app.post('/create-room', (req, res) => {
  const roomId = generateRoomId();
  rooms.set(roomId, {
    created: Date.now(),
    users: new Set()
  });

  console.log(`📱 Created room: ${roomId}`);
  res.json({ roomId });
});


io.on('connection', (socket) => {
  console.log(`👤 User connected: ${socket.id}`);

  socket.on('join-room', (roomId) => {
    if (!rooms.has(roomId)) {
      socket.emit('error', 'Room not found');
      return;
    }

    const room = rooms.get(roomId);
    room.users.add(socket.id);
    socket.join(roomId);
    socket.roomId = roomId;

    console.log(`🚪 ${socket.id} joined room ${roomId} (${room.users.size} users)`);

    // notify all users in room about user count
    io.to(roomId).emit('user-count', room.users.size);

    // send connection success to joiner
    socket.emit('joined-room', { roomId, userCount: room.users.size });
  });

  socket.on('message', (data) => {
    if (socket.roomId) {
      console.log(`💬 Message in ${socket.roomId}: ${data.text}`);

      io.to(socket.roomId).emit('message', {
        text: data.text,
        userId: socket.id.slice(0, 8), // Show first 8 chars of socket ID
        timestamp: Date.now()
      });
    }
  });

  socket.on('disconnect', () => {
    console.log(`👋 User disconnected: ${socket.id}`);

    if (socket.roomId && rooms.has(socket.roomId)) {
      const room = rooms.get(socket.roomId);
      room.users.delete(socket.id);

      // notify remaining users
      io.to(socket.roomId).emit('user-count', room.users.size);

      // clean up empty rooms
      if (room.users.size === 0) {
        rooms.delete(socket.roomId);
        console.log(`🗑️ Deleted empty room: ${socket.roomId}`);
      }
    }
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  // console.log(`📊 Active rooms: ${rooms.size}`);
});