import { Request, Response, NextFunction } from 'express';
import { eq } from 'drizzle-orm';
import { verifyAccessToken, verifyRefreshToken } from '../utils/jwt';
import { db } from '../db';
import { refreshTokens } from '../db/schema';
import { refreshSchema } from '../schemas/auth';
import type { AccessTokenPayload, RefreshTokenPayload } from '../../../shared/auth-types';

declare global {
  namespace Express {
    interface Request {
      user?: Omit<AccessTokenPayload, 'exp' | 'iat'>;
      refreshPayload?: Omit<RefreshTokenPayload, 'iat'>;
    }
  }
}

export function requireAccessToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.substring(7);

  try {
    const payload = verifyAccessToken(token);
    req.user = { userId: payload.userId, email: payload.email };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired access token' });
  }
}

export async function requireRefreshToken(req: Request, res: Response, next: NextFunction) {
  const result = refreshSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: 'Invalid request body',
      details: result.error.issues,
    });
  }

  const { refreshToken } = result.data;

  try {
    const payload = verifyRefreshToken(refreshToken);

    const [tokenRecord] = await db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.jti, payload.jti))
      .limit(1);

    if (!tokenRecord) {
      return res.status(401).json({ error: 'Refresh token revoked' });
    }

    req.refreshPayload = { userId: payload.userId, jti: payload.jti };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
}
