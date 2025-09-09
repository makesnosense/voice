import type {
  Room,
  RoomId,
  TypedServer,
  ExtendedSocket,
  Message,
  SocketId
} from '../../shared/types';

export default function createConnectionHandler(io: TypedServer, rooms: Map<RoomId, Room>) {
  const handleConnection = (socket: ExtendedSocket) => {
    socket.on('join-room', (roomId: RoomId) => handleRoomJoin(io, rooms, socket, roomId));
    socket.on('message', (data: { text: string }) => handleNewMessage(io, socket, data));
    socket.on('disconnect', () => handleDisconnect(io, rooms, socket));
  }
  return handleConnection;
}

const handleRoomJoin = (io: TypedServer, rooms: Map<RoomId, Room>,
  socket: ExtendedSocket, roomId: RoomId): void => {
  const room = rooms.get(roomId);
  if (!room) {
    socket.emit('error', 'Room not found');
    return;
  }

  room.users.add(socket.id);

  socket.join(roomId);
  socket.roomId = roomId;

  console.log(`🚪 ${socket.id} joined room ${roomId} (${room.users.size} users)`);

  io.to(roomId).emit('room-usercount-update', room.users.size);

  socket.emit('room-join-success', { roomId, userCount: room.users.size });
}

const handleNewMessage = (io: TypedServer, socket: ExtendedSocket, data: { text: string }) => {
  if (socket.roomId) {
    console.log(`💬 Message in ${socket.roomId}: ${data.text}`);

    const message: Message = {
      text: data.text,
      userId: socket.id as SocketId,
      timestamp: Date.now()
    };

    io.to(socket.roomId).emit('message', message);
  }
}

const handleDisconnect = (io: TypedServer, rooms: Map<RoomId, Room>, socket: ExtendedSocket) => {
  console.log(`👋 User disconnected: ${socket.id}`);
  if (!socket.roomId) return;

  const room = rooms.get(socket.roomId);
  if (!room) {
    console.warn(`⚠️ Socket ${socket.id} had roomId ${socket.roomId} but room not found`);
    return;
  }

  room.users.delete(socket.id);

  io.to(socket.roomId).emit('room-usercount-update', room.users.size);

  if (room.users.size === 0) {
    rooms.delete(socket.roomId);
    console.log(`🗑️ Deleted empty room: ${socket.roomId}`);
  }

}

