import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';

const ACCESS_TOKEN_EXPIRY = '120m';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}
const JWT_SECRET = process.env.JWT_SECRET;

interface AccessTokenPayload {
  userId: string;
  email: string;
}

interface RefreshTokenPayload {
  userId: string;
  jti: string;
}

export function generateAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

export function generateRefreshToken(userId: string): { token: string; jti: string } {
  const jti = randomUUID();
  const token = jwt.sign({ userId, jti }, JWT_SECRET);
  return { token, jti };
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, JWT_SECRET) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, JWT_SECRET) as RefreshTokenPayload;
}
