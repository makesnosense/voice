import crypto from 'crypto';
import type { RoomId } from '../../../shared/types/core';

export function generateRoomId(): RoomId {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const id = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join(
    ''
  );

  // format: xxx-xxx
  return `${id.slice(0, 3)}-${id.slice(3, 6)}` as RoomId;
}

export function generateTurnCredentials(secret: string): { username: string; credential: string } {
  // username format: timestamp:random
  const timestamp = Math.floor(Date.now() / 1000) + 86400; // valid for 24 hours
  const username = `${timestamp}:voiceuser`;

  // credential is HMAC of username using shared secret
  const credential = crypto.createHmac('sha1', secret).update(username).digest('base64');

  return { username, credential };
}
