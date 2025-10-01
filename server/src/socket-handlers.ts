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
    console.log(`🔌 [Socket] new connection: ${socket.id}`);

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

    socket.on('disconnect', (reason: string) => {
      console.log(`👋 [Socket] disconnecting ${socket.id}, reason: ${reason}`);
      handleDisconnect(io, rooms, socket, roomDestructionManager, reason)
    }
    );

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
    console.warn(`🚫 [RateLimit] ${socket.id} exceeded limit for ${event}`);
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
      console.log(`💀 [Cleanup] removing dead socket ${userId} from room ${roomId}`);
      room.users.delete(userId);
      io.to(roomId).emit('user-left', userId as SocketId);
      removedCount++;
      continue;
    }

    // kick if not webrtc ready (stuck in some broken state)
    if (!userData.webRTCReady) {
      console.log(`🚫 [Cleanup] removing non-webRTC-ready socket ${userId} from room ${roomId}`);
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
    console.warn(`❌ [Socket] room ${roomId} not found`);
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
    console.warn(`🚫 [Socket] room ${roomId} is full`);
    socket.emit('room-full', 'Room is full (max 2 people)');
    return;
  }

  if (room.users.size === 0) {
    console.log(`⏰ [Destruction] cancelling scheduled destruction for ${roomId}`);
    roomDestructionManager.cancelDestruction(roomId);
  }

  room.users.set(socket.id, { webRTCReady: false, isMuted: false });

  socket.join(roomId);
  socket.roomId = roomId;

  console.log(`✅ [Socket] ${socket.id} joined room ${roomId} (${room.users.size}/2 users)`);

  const usersForClient = getUsersForClient(room);
  io.to(roomId).emit('room-users-update', usersForClient);

  // send success to the joining user
  socket.emit('room-join-success', { roomId });

}

const handleNewMessage = (io: TypedServer, socket: ExtendedSocket, data: { text: string }) => {
  if (!socket.roomId) {
    console.warn(`⚠️ [Message] ${socket.id} sent message but not in a room`);
    return;
  }

  if (!data.text || data.text.length > 1000) {
    console.warn(`⚠️ [Message] invalid message from ${socket.id}`);
    socket.emit('error' as any, { message: 'Invalid message content' });
    return;
  }
  console.log(`💬 [Message] ${socket.id} in ${socket.roomId}: "${data.text.substring(0, 50)}${data.text.length > 50 ? '...' : ''}"`);

  const message: Message = {
    text: data.text,
    userId: socket.id as SocketId,
    timestamp: Date.now()
  };

  io.to(socket.roomId).emit('message', message);

}

const handleDisconnect = (io: TypedServer,
  rooms: Map<RoomId, Room>,
  socket: ExtendedSocket,
  roomDestructionManager: RoomDestructionManager,
  reason: string) => {

  console.log(`👋 [Socket] ${socket.id} disconnected (socket.io reason: ${reason})`);


  if (!socket.roomId) {
    console.log(`ℹ️ [Socket] ${socket.id} wasn't in any room`);
    return;
  }

  const room = rooms.get(socket.roomId);
  if (!room) {
    console.warn(`⚠️ [Socket] ${socket.id} had roomId ${socket.roomId} but room not found`);
    return;
  }

  const wasInRoom = room.users.has(socket.id);
  room.users.delete(socket.id);


  if (wasInRoom) {
    console.log(`🔌 [Socket] removed ${socket.id} from room ${socket.roomId} (${room.users.size} remaining)`);

    const usersForClient = getUsersForClient(room);
    io.to(socket.roomId).emit('room-users-update', usersForClient);
    io.to(socket.roomId).emit('user-left', socket.id as SocketId);
  }

  if (room.users.size === 0) {
    console.log(`⏰ [Destruction] scheduling destruction for empty room ${socket.roomId}`);
    roomDestructionManager.scheduleDestruction(socket.roomId);
  }

}

const handleWebRTCReady = (io: TypedServer, rooms: Map<RoomId, Room>, socket: ExtendedSocket) => {
  if (!socket.roomId) {
    console.warn(`⚠️ [WebRTC] ${socket.id} is ready but not in a room`);
    return;
  }

  const room = rooms.get(socket.roomId);
  if (!room) {
    console.warn(`⚠️ [WebRTC] ${socket.id} is ready but room ${socket.roomId} not found`);
    return;
  }

  const userData = room.users.get(socket.id);
  if (userData) {
    room.users.set(socket.id, { ...userData, webRTCReady: true });
    console.log(`✅ [WebRTC] ${socket.id} is ready`);

    // Check if all users are audio ready
    const allReady = Array.from(room.users.values()).every(user => user.webRTCReady);



    if (allReady && room.users.size === 2) {
      const users = Array.from(room.users.keys());
      const [firstUser, secondUser] = users;
      console.log(`🎬 [WebRTC] both users ready, telling ${firstUser} to initiate call to ${secondUser}`);
      io.to(firstUser).emit('initiate-webrtc-call', secondUser as SocketId);
    } else {
      console.log(`⏳ [WebRTC] waiting for all users to be ready (${room.users.size}/2, all ready: ${allReady})`);
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
    console.log(`🔇 [Mute] ${socket.id} is now ${data.isMuted ? 'muted' : 'unmuted'}`);

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