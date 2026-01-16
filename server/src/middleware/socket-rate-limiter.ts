import type { SocketId } from '../../../shared/types';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class SocketRateLimiter {
  private limits = new Map<string, RateLimitEntry>();

  // clean up old entries every 5 minutes
  private cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(key);
      }
    }
  }, 5 * 60 * 1000);

  private getKey(socketId: SocketId, event: string): string {
    return `${socketId}:${event}`;
  }

  checkLimit(socketId: SocketId, event: string, maxRequests: number, windowMs: number): boolean {
    const key = this.getKey(socketId, event);
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry || now > entry.resetTime) {
      // first request or window expired
      this.limits.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      return true;
    }

    if (entry.count >= maxRequests) {
      return false; // rate limit exceeded
    }

    entry.count++;
    return true;
  }

  cleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.limits.clear();
  }
}

export const socketRateLimiter = new SocketRateLimiter();

// rate limiting configurations for different socket events
export const SOCKET_RATE_LIMITS = {
  'join-room': { max: 10, windowMs: 60 * 1000 },
  message: { max: 60, windowMs: 60 * 1000 },
  'webrtc-offer': { max: 20, windowMs: 60 * 1000 },
  'webrtc-answer': { max: 20, windowMs: 60 * 1000 },
  'webrtc-ice-candidate': { max: 200, windowMs: 60 * 1000 },
  'mute-status-changed': { max: 60, windowMs: 60 * 1000 },
  'webrtc-ready': { max: 10, windowMs: 60 * 1000 },
} as const;
