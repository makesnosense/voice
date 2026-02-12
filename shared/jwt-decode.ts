import type { User } from './auth-types';

const getJwtPayload = (token: string): Record<string, any> | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  } catch (error) {
    console.error('failed to parse JWT:', error);
    return null;
  }
};

export const getUserFromJwt = (token: string): User | null => {
  const payload = getJwtPayload(token);
  if (!payload) return null;

  if (payload.userId && payload.email) {
    return { userId: payload.userId, email: payload.email };
  }
  return null;
};

export const isTokenExpired = (token: string): boolean => {
  const payload = getJwtPayload(token);
  if (!payload || !payload.exp) return true;

  // consider expired if less than 1 minute remaining
  return Date.now() >= payload.exp * 1000 - 60000;
};
