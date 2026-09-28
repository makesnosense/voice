import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import type { AccessTokenPayload, RefreshTokenPayload } from '../../../shared/types/auth';

const ACCESS_TOKEN_EXPIRY = '120m';

const TOKEN_TYPE = {
  ACCESS: 'access',
  REFRESH: 'refresh',
} as const;

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}
const JWT_SECRET = process.env.JWT_SECRET;

// Omit from AccessTokenPayload because:
// - type is set to "access" by this function
// - iat is written by jsonwebtoken at sign time.
// - exp is written by jsonwebtoken from expiresIn
export function generateAccessToken(
  payload: Omit<AccessTokenPayload, 'exp' | 'iat' | 'type'>
): string {
  return jwt.sign({ ...payload, type: TOKEN_TYPE.ACCESS }, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

export function generateRefreshToken(userId: string): { token: string; jti: string } {
  const jti = randomUUID();
  const token = jwt.sign({ userId, jti, type: TOKEN_TYPE.REFRESH }, JWT_SECRET);
  return { token, jti };
}

// PATCH /api/users/me is the only caller
// we do it upon user rename
export function reissueAccessTokenWithUpdatedName(
  originalToken: string,
  newName: string | null
): string {
  const original = verifyAccessToken(originalToken);
  return jwt.sign(
    {
      type: TOKEN_TYPE.ACCESS,
      userId: original.userId,
      email: original.email,
      name: newName,
      exp: original.exp,
    },
    JWT_SECRET
  );
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const payload = jwt.verify(token, JWT_SECRET);

  if (typeof payload === 'string' || payload.type !== TOKEN_TYPE.ACCESS) {
    throw new Error('invalid token type');
  }

  return payload as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const payload = jwt.verify(token, JWT_SECRET);

  if (typeof payload === 'string' || payload.type !== TOKEN_TYPE.REFRESH) {
    throw new Error('invalid token type');
  }

  return payload as RefreshTokenPayload;
}
