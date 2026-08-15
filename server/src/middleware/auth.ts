import { Request, Response, NextFunction } from 'express';
import { eq } from 'drizzle-orm';
import { verifyAccessToken, verifyRefreshToken } from '../utils/jwt';
import { db } from '../db';
import { refreshTokens } from '../db/schema';
import { refreshSchema } from '../schemas/auth';
import type { AccessTokenPayload, RefreshTokenPayload } from '../../../shared/types/auth';
import type { ApiErrorResponse } from '../../../shared/errors';
import { ERROR_CODE } from '../../../shared/constants/errors';

declare global {
  namespace Express {
    interface Request {
      user?: Omit<AccessTokenPayload, 'exp' | 'iat'>;
      refreshPayload?: Omit<RefreshTokenPayload, 'iat'>;
    }
  }
}

export function requireAccessToken(
  req: Request,
  res: Response<ApiErrorResponse>,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({
      errorMessage: 'Missing or invalid authorization header',
      errorCode: ERROR_CODE.UNAUTHORIZED,
    });
  }

  const token = authHeader.substring(7);

  try {
    const payload = verifyAccessToken(token);
    req.user = { userId: payload.userId, email: payload.email, name: payload.name };
    next();
  } catch (error) {
    return res.status(401).json({
      errorMessage: 'Invalid or expired access token',
      errorCode: ERROR_CODE.UNAUTHORIZED,
    });
  }
}

export async function requireRefreshToken(
  req: Request,
  res: Response<ApiErrorResponse>,
  next: NextFunction
) {
  const result = refreshSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      errorMessage: 'Invalid request body',
      errorCode: ERROR_CODE.INVALID_REQUEST,
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
      return res.status(401).json({
        errorMessage: 'Refresh token revoked',
        errorCode: ERROR_CODE.REFRESH_TOKEN_REVOKED,
      });
    }

    req.refreshPayload = { userId: payload.userId, jti: payload.jti };
    next();
  } catch (error) {
    return res.status(401).json({
      errorMessage: 'Invalid refresh token',
      errorCode: ERROR_CODE.UNAUTHORIZED,
    });
  }
}
