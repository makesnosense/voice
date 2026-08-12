import type { User } from './types/auth';

const getJwtPayload = (token: string): Record<string, any> | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(base64DecodeUnicode(base64));
  } catch (error) {
    console.error('failed to parse JWT:', error);
    return null;
  }
};

function base64DecodeUnicode(base64String: string): string {
  // atob takes a base64-encoded string and gives back the raw decoded bytes (character code 0–255)
  const rawBytes = atob(base64String);

  // we are making our bytes string suitable for decodeURIComponent which is available everywhere
  // decodeURIComponent is figuring out which bytes are continuations and which are starts (because it understands utf-8)
  let percentEncodedBytes = '';
  for (let byteIndex = 0; byteIndex < rawBytes.length; byteIndex++) {
    const byteValue = rawBytes.charCodeAt(byteIndex); // this byte's value, 0-255
    const hexByte = byteValue.toString(16).padStart(2, '0'); // as 2-digit hex, e.g. 12 -> '0c'
    percentEncodedBytes += `%${hexByte}`;
  }

  return decodeURIComponent(percentEncodedBytes);
}

export const getUserFromJwt = (token: string): User | null => {
  const payload = getJwtPayload(token);
  if (!payload) return null;

  if (payload.userId && payload.email) {
    return { userId: payload.userId, email: payload.email, name: payload.name ?? null };
  }
  return null;
};

export const isTokenExpired = (token: string): boolean => {
  const payload = getJwtPayload(token);
  if (!payload || !payload.exp) return true;

  // consider expired if less than 1 minute remaining
  return Date.now() >= payload.exp * 1000 - 60000;
};

export const getJtiFromRefreshToken = (token: string): string | null => {
  const payload = getJwtPayload(token);
  return payload?.jti ?? null;
};
