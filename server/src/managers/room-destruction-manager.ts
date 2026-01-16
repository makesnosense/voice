import type { RoomId, Room } from '../../../shared/types';

interface DestructionEntry {
  roomId: RoomId;
  scheduledDestructionTime: number;
}

export default class RoomDestructionManager {
  private destructionQueue = new Map<RoomId, DestructionEntry>();
  private destructionDelayMs: number = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
  private checkIntervalMs = 60 * 1000; // check every minute
  private intervalId: NodeJS.Timeout | null = null;
  private rooms: Map<RoomId, Room>;

  constructor(rooms: Map<RoomId, Room>) {
    this.rooms = rooms;
  }

  // start the interval checker
  start(): void {
    if (this.intervalId) {
      console.warn('⚠️ Room destruction manager already started');
      return;
    }
    this.performDestructions();

    // set up the interval
    this.intervalId = setInterval(() => {
      this.performDestructions();
    }, this.checkIntervalMs);

    console.log(
      `🔄 Room destruction checker started (checking every ${this.checkIntervalMs / 1000} seconds)`
    );
  }

  private performDestructions(): void {
    if (!this.rooms) return;

    const now = Date.now();
    const roomsToDestroy: RoomId[] = [];

    // find all rooms that should be destroyed
    for (const [roomId, entry] of this.destructionQueue.entries()) {
      if (now >= entry.scheduledDestructionTime) {
        roomsToDestroy.push(roomId);
      }
    }

    // destroy the rooms
    for (const roomId of roomsToDestroy) {
      this.destructionQueue.delete(roomId);

      // perform the actual destruction
      this.destroyRoom(roomId);
    }
  }

  private destroyRoom(roomId: RoomId): void {
    const room = this.rooms.get(roomId);

    if (!room) {
      console.log(`⚠️ Room ${roomId} was scheduled for destruction but no longer exists`);
      return;
    }

    if (room.users.size === 0) {
      this.rooms.delete(roomId);
      console.log(`💥 Destroyed empty room ${roomId} after timeout`);
    } else {
      console.log(
        `⚠️ Room ${roomId} was scheduled for destruction but is no longer empty (${room.users.size} users)`
      );
    }
  }

  scheduleDestruction(roomId: RoomId): void {
    const scheduledTime = Date.now() + this.destructionDelayMs;

    this.destructionQueue.set(roomId, {
      roomId,
      scheduledDestructionTime: scheduledTime,
    });

    const destructionDate = new Date(scheduledTime);
    console.log(
      `⏰ Scheduled destruction for room ${roomId} at ${destructionDate.toLocaleTimeString()}`
    );
  }

  cancelDestruction(roomId: RoomId): void {
    if (this.destructionQueue.has(roomId)) {
      this.destructionQueue.delete(roomId);
      console.log(`❌ Cancelled destruction for room ${roomId}`);
    }
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('⏹️ Room destruction checker stopped');
    }
  }
}
