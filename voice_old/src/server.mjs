import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import createConnectionHandler from './socket-handlers.mjs'
import { generateRoomId } from './utils/generators.mjs'

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const publicFolder = join(projectRoot, 'public');

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.static(publicFolder));

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

const handleConnection = createConnectionHandler(io, rooms);

io.on('connection', handleConnection);

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  // console.log(`📊 Active rooms: ${rooms.size}`);
});