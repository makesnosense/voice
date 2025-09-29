import config from './config';
import { socketRateLimiter, SOCKET_RATE_LIMITS } from './utils/socket-rate-limiter';
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
import type RoomDestructionManager from './room-destruction-manager';

export default function createConnectionHandler(
  io: TypedServer,
  rooms: Map<RoomId, Room>,
  roomDestructionManager: RoomDestructionManager) {

  const handleConnection = (socket: ExtendedSocket) => {
    console.log(`🔌 New connection: ${socket.id}`);

    socket.on('join-room', (roomId: RoomId) => {
      if (!checkRateLimit(socket, 'join-room')) return;
      handleRoomJoin(io, rooms, socket, roomId, roomDestructionManager);
    });

    socket.on('message', (data: { text: string }) => {
      if (!checkRateLimit(socket, 'message')) return;
      handleNewMessage(io, socket, data);
    });

    socket.on('webrtc-ready', () => {
      if (!checkRateLimit(socket, 'webrtc-ready')) return;
      handleWebRTCReady(io, rooms, socket);
    });

    socket.on('mute-status-changed', (data: { isMuted: boolean }) => {
      if (!checkRateLimit(socket, 'mute-status-changed')) return;
      handleMuteStatusChanged(io, rooms, socket, data);
    });

    socket.on('disconnect', () => handleDisconnect(io, rooms, socket, roomDestructionManager));

    // WebRTC signaling events with rate limiting
    socket.on('webrtc-offer', (data: { offer: WebRTCOffer; toUserId: SocketId; }) => {
      if (!checkRateLimit(socket, 'webrtc-offer')) return;
      handleWebRTCOffer(io, socket, data);
    });

    socket.on('webrtc-answer', (data: { answer: WebRTCAnswer; toUserId: SocketId; }) => {
      if (!checkRateLimit(socket, 'webrtc-answer')) return;
      handleWebRTCAnswer(io, socket, data);
    });

    socket.on('webrtc-ice-candidate', (data: { candidate: IceCandidate; toUserId: SocketId; }) => {
      if (!checkRateLimit(socket, 'webrtc-ice-candidate')) return;
      handleWebRTCIceCandidate(io, socket, data);
    });
  };

  return handleConnection;
}

// helper to check rate limits for socket events
const checkRateLimit = (socket: ExtendedSocket, event: keyof typeof SOCKET_RATE_LIMITS): boolean => {
  if (!config.rateLimiting.enabled) {
    return true; // always allow if rate limiting is disabled
  }

  const limit = SOCKET_RATE_LIMITS[event];
  const allowed = socketRateLimiter.checkLimit(
    socket.id as SocketId,
    event,
    limit.max,
    limit.windowMs
  );

  if (!allowed) {
    console.warn(`🚫 Rate limit exceeded for ${socket.id} on event ${event}`);
    socket.emit('error' as any, {
      message: `Rate limit exceeded for ${event}. Please slow down.`
    });
  }

  return allowed;
};

// helper function to convert server user data to client user data
const getUsersForClient = (room: Room): UserDataClientSide[] => {
  return Array.from(room.users.entries()).map(([userId, userData]) => ({
    userId,
    isMuted: userData.isMuted
  }));
};

const forceCleanupRoom = (io: TypedServer, room: Room, roomId: RoomId): number => {
  let removedCount = 0;

  for (const [userId, userData] of room.users.entries()) {
    const socket = io.sockets.sockets.get(userId);

    // kick if socket is dead or disconnected
    if (!socket || !socket.connected) {
      console.log(`💀 Force cleanup: removing dead socket ${userId}`);
      room.users.delete(userId);
      io.to(roomId).emit('user-left', userId as SocketId);
      removedCount++;
      continue;
    }

    // kick if not webrtc ready (stuck in some broken state)
    if (!userData.webRTCReady) {
      console.log(`🚫 Force cleanup: removing non-webRTC-ready socket ${userId}`);
      room.users.delete(userId);

      socket.disconnect(true);

      io.to(roomId).emit('user-left', userId as SocketId);
      removedCount++;
    }
  }

  return removedCount;
};



const handleRoomJoin = (io: TypedServer,
  rooms: Map<RoomId, Room>,
  socket: ExtendedSocket,
  roomId: RoomId,
  roomDestructionManager: RoomDestructionManager
): void => {
  const room = rooms.get(roomId);
  if (!room) {
    socket.emit('room-not-found', 'Room not found');
    return;
  }

  // aggressively clean up problematic connections
  if (room.users.size >= 2) {
    const removedCount = forceCleanupRoom(io, room, roomId);
    if (removedCount > 0) {
      console.log(`🧹 Force cleaned up ${removedCount} problematic connections from room ${roomId}`);
    }
  }

  // check room capacity after cleanup
  if (room.users.size >= 2) {
    socket.emit('room-full', 'Room is full (max 2 people)');
    return;
  }

  if (room.users.size === 0) {
    roomDestructionManager.cancelDestruction(roomId);
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

    if (!data.text || data.text.length > 1000) {
      socket.emit('error' as any, { message: 'Invalid message content' });
      return;
    }
    console.log(`💬 Message in ${socket.roomId}: ${data.text}`);

    const message: Message = {
      text: data.text,
      userId: socket.id as SocketId,
      timestamp: Date.now()
    };

    io.to(socket.roomId).emit('message', message);
  }
}

const handleDisconnect = (io: TypedServer,
  rooms: Map<RoomId, Room>,
  socket: ExtendedSocket,
  roomDestructionManager: RoomDestructionManager) => {

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
    roomDestructionManager.scheduleDestruction(socket.roomId);
    console.log(`🕐 Room ${socket.roomId} is now empty, scheduled for destruction`);
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