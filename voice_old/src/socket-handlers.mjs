export default function createConnectionHandler(io, rooms) {
  const handleConnection = (socket) => {
    socket.on('join-room', (roomId) => handleRoomJoin(io, rooms, socket, roomId));
    socket.on('message', (data) => handleNewMessage(io, socket, data));
    socket.on('disconnect', () => handleDisconnect(io, rooms, socket));
  }
  return handleConnection;
}

const handleRoomJoin = (io, rooms, socket, roomId) => {
  if (!rooms.has(roomId)) {
    socket.emit('error', 'Room not found');
    return;
  }

  const room = rooms.get(roomId);
  room.users.add(socket.id);

  socket.join(roomId);
  socket.roomId = roomId;

  console.log(`🚪 ${socket.id} joined room ${roomId} (${room.users.size} users)`);

  io.to(roomId).emit('room-usercount-update', room.users.size);

  socket.emit('room-join-success', { roomId, userCount: room.users.size });
}

const handleNewMessage = (io, socket, data) => {
  if (socket.roomId) {
    console.log(`💬 Message in ${socket.roomId}: ${data.text}`);

    io.to(socket.roomId).emit('message', {
      text: data.text,
      userId: socket.id.slice(0, 8), // Show first 8 chars of socket ID
      timestamp: Date.now()
    });
  }
}

const handleDisconnect = (io, rooms, socket) => {
  console.log(`👋 User disconnected: ${socket.id}`);

  if (socket.roomId && rooms.has(socket.roomId)) {
    const room = rooms.get(socket.roomId);
    room.users.delete(socket.id);

    io.to(socket.roomId).emit('room-usercount-update', room.users.size);

    // clean up empty rooms
    if (room.users.size === 0) {
      rooms.delete(socket.roomId);
      console.log(`🗑️ Deleted empty room: ${socket.roomId}`);
    }
  }
}

