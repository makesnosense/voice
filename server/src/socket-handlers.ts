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
    socket.emit('room-not-found', 'Room not found');
    return;
  }


  const usersBeforeAddingNew = Array.from(room.users);

  room.users.add(socket.id);

  socket.join(roomId);
  socket.roomId = roomId;

  console.log(`🚪 ${socket.id} joined room ${roomId} (${room.users.size} users)`);

  // io.to(roomId).emit('room-usercount-update', room.users.size);
  // send current users list to everyone in the room
  const allUsers = Array.from(room.users);
  io.to(roomId).emit('room-users-update', allUsers);


  // send success to the joining user
  socket.emit('room-join-success', { roomId });

  // if new user is not the first one to join room, notify other users new user joining (triggers WebRTC)
  if (usersBeforeAddingNew.length === 1) {
    console.log(`📞 Second user ${socket.id} joined - initiating WebRTC call`);
    usersBeforeAddingNew.forEach(existingUserId => {
      io.to(existingUserId).emit('second-user-joined-initiate-webrtc-call', socket.id as SocketId);
    });
  }
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

  const roomUsersWithoutDisconnected = Array.from(room.users);
  io.to(socket.roomId).emit('room-users-update', roomUsersWithoutDisconnected);

  if (room.users.size === 0) {
    // rooms.delete(socket.roomId);
    console.log(`🗑️ Deleted empty room: ${socket.roomId}`);
  }

}

