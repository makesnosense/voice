import type { RoomId } from '../../../shared/types/core';

export default class InviteTimeoutManager {
  private timers = new Map<RoomId, NodeJS.Timeout>();

  scheduleTimeout(roomId: RoomId, delayMs: number, callback: () => void): void {
    this.cancelTimeout(roomId);
    this.timers.set(
      roomId,
      setTimeout(() => {
        this.timers.delete(roomId);
        callback();
      }, delayMs)
    );
  }

  cancelTimeout(roomId: RoomId): void {
    const timer = this.timers.get(roomId);
    if (!timer) return;
    clearTimeout(timer);
    this.timers.delete(roomId);
  }
}
