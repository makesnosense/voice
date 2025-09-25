import crypto from 'crypto';
import type { RoomId } from '../../../shared/types'

export function generateRoomId(): RoomId {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const id = Array.from({ length: 12 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');

  // format like Google Meet: xxx-xxxx-xxx  
  return `${id.slice(0, 3)}-${id.slice(3, 7)}-${id.slice(7)}` as RoomId;
}

export function generateUserName() {
  const adjectives = [
    'Swift', 'Bright', 'Clever', 'Bold', 'Calm', 'Brave', 'Quick', 'Wise',
    'Silent', 'Fierce', 'Gentle', 'Sharp', 'Cool', 'Warm', 'Fresh', 'Strong'
  ];

  const animals = [
    'Tiger', 'Eagle', 'Wolf', 'Fox', 'Bear', 'Lion', 'Hawk', 'Owl',
    'Shark', 'Whale', 'Falcon', 'Raven', 'Lynx', 'Puma', 'Viper', 'Cobra'
  ];

  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];

  return `${adjective}${animal}`;
}

export function generateTurnCredentials(secret: string): { username: string; credential: string } {
  // username format: timestamp:random
  const timestamp = Math.floor(Date.now() / 1000) + 86400; // valid for 24 hours
  const username = `${timestamp}:voiceuser`;

  // credential is HMAC of username using shared secret
  const credential = crypto
    .createHmac('sha1', secret)
    .update(username)
    .digest('base64');

  return { username, credential };
}


// export function generateChatName() {
//   const adjectives = [
//     'swift', 'bright', 'clever', 'bold', 'calm', 'brave', 'quick', 'wise',
//     'silent', 'fierce', 'gentle', 'sharp', 'cool', 'warm', 'fresh', 'strong'
//   ];

//   const nouns = [
//     'tiger', 'eagle', 'ocean', 'mountain', 'river', 'forest', 'storm', 'flame',
//     'star', 'moon', 'sun', 'wind', 'wave', 'rock', 'tree', 'cloud'
//   ];

//   const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
//   const noun = nouns[Math.floor(Math.random() * nouns.length)];

//   return `${adjective}-${noun}`;
// }