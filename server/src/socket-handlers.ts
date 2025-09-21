import type {
  Room,
  RoomId,
  TypedServer,
  ExtendedSocket,
  Message,
  SocketId,
  WebRTCOffer,
  WebRTCAnswer,
  IceCandidate,
  UserDataClientSide
} from '../../shared/types';

export default function createConnectionHandler(io: TypedServer, rooms: Map<RoomId, Room>) {
  const handleConnection = (socket: ExtendedSocket) => {
    socket.on('join-room', (roomId: RoomId) => handleRoomJoin(io, rooms, socket, roomId));
    socket.on('message', (data: { text: string }) => handleNewMessage(io, socket, data));
    socket.on('webrtc-ready', () => handleWebRTCReady(io, rooms, socket));
    socket.on('mute-status-changed', (data: { isMuted: boolean }) => handleMuteStatusChanged(io, rooms, socket, data)); // new handler
    socket.on('disconnect', () => handleDisconnect(io, rooms, socket));

    // WebRTC signaling events
    socket.on('webrtc-offer', (data: { offer: WebRTCOffer; toUserId: SocketId; }) => handleWebRTCOffer(io, socket, data));
    socket.on('webrtc-answer', (data: { answer: WebRTCAnswer; toUserId: SocketId; }) => handleWebRTCAnswer(io, socket, data));
    socket.on('webrtc-ice-candidate', (data: { candidate: IceCandidate; toUserId: SocketId; }) => handleWebRTCIceCandidate(io, socket, data));
  }
  return handleConnection;
}

// helper function to convert server user data to client user data
const getUsersForClient = (room: Room): UserDataClientSide[] => {
  return Array.from(room.users.entries()).map(([userId, userData]) => ({
    userId,
    isMuted: userData.isMuted
  }));
};


const handleRoomJoin = (io: TypedServer, rooms: Map<RoomId, Room>,
  socket: ExtendedSocket, roomId: RoomId): void => {
  const room = rooms.get(roomId);
  if (!room) {
    socket.emit('room-not-found', 'Room not found');
    return;
  }

  // check room capacity - max 2 people
  if (room.users.size >= 2) {
    socket.emit('room-full', 'Room is full (max 2 people)');
    return;
  }

  room.users.set(socket.id, { webRTCReady: false, isMuted: false });

  socket.join(roomId);
  socket.roomId = roomId;

  console.log(`🚪 ${socket.id} joined room ${roomId} (${room.users.size} users)`);

  const usersForClient = getUsersForClient(room);
  io.to(roomId).emit('room-users-update', usersForClient);

  // send success to the joining user
  socket.emit('room-join-success', { roomId });

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

  // notify other users about disconnect with updated user list
  const usersForClient = getUsersForClient(room);
  io.to(socket.roomId).emit('room-users-update', usersForClient);
  io.to(socket.roomId).emit('user-left', socket.id as SocketId);

  if (room.users.size === 0) {
    // rooms.delete(socket.roomId); // temporarily commented out for easier debug
    console.log(`🗑️ Deleted empty room: ${socket.roomId}`);
  }
}

const handleWebRTCReady = (io: TypedServer, rooms: Map<RoomId, Room>, socket: ExtendedSocket) => {
  if (!socket.roomId) return;

  const room = rooms.get(socket.roomId);
  if (!room) return;

  const userData = room.users.get(socket.id);
  if (userData) {
    room.users.set(socket.id, { ...userData, webRTCReady: true });
    console.log(`🎤 ${socket.id} is WebRTC ready`);

    // Check if all users are audio ready
    const allReady = Array.from(room.users.values()).every(user => user.webRTCReady);



    if (allReady && room.users.size === 2) {
      const users = Array.from(room.users.keys());
      const [firstUser, secondUser] = users;
      console.log(`🎬 Both users ready, telling ${firstUser} to initiate WebRTC`);
      io.to(firstUser).emit('initiate-webrtc-call', secondUser as SocketId);
    }
  }
}

const handleMuteStatusChanged = (io: TypedServer, rooms: Map<RoomId, Room>,
  socket: ExtendedSocket, data: { isMuted: boolean }) => {
  if (!socket.roomId) return;

  const room = rooms.get(socket.roomId);
  if (!room) return;

  const userData = room.users.get(socket.id);
  if (userData) {
    // update mute status while preserving webRTCReady status
    room.users.set(socket.id, { ...userData, isMuted: data.isMuted });
    console.log(`🔇 ${socket.id} mute status changed to: ${data.isMuted ? 'muted' : 'unmuted'}`);

    // broadcast updated user list to all users in room
    const usersForClient = getUsersForClient(room);
    io.to(socket.roomId).emit('room-users-update', usersForClient);
  }
}

// WebRTC signaling handlers
const handleWebRTCOffer = (io: TypedServer, socket: ExtendedSocket,
  data: { offer: WebRTCOffer; toUserId: SocketId }) => {
  console.log(`📞 Relaying offer from ${socket.id} to ${data.toUserId}`);

  io.to(data.toUserId).emit('webrtc-offer', {
    offer: data.offer,
    fromUserId: socket.id as SocketId
  });
}

const handleWebRTCAnswer = (io: TypedServer, socket: ExtendedSocket,
  data: { answer: WebRTCAnswer; toUserId: SocketId }) => {
  console.log(`✅ Relaying answer from ${socket.id} to ${data.toUserId}`);

  io.to(data.toUserId).emit('webrtc-answer', {
    answer: data.answer,
    fromUserId: socket.id as SocketId
  });
}

const handleWebRTCIceCandidate = (io: TypedServer, socket: ExtendedSocket,
  data: { candidate: IceCandidate; toUserId: SocketId }) => {
  console.log(`🧊 Relaying ICE candidate from ${socket.id} to ${data.toUserId}`);

  io.to(data.toUserId).emit('webrtc-ice-candidate', {
    candidate: data.candidate,
    fromUserId: socket.id as SocketId
  });
}