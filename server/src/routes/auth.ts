import { Router, type Response } from 'express';
import { db } from '../db';
import { users, otpCodes, refreshTokens } from '../db/schema';
import { eq, and, ne } from 'drizzle-orm';
import { generateOtpCode, sendOtpEmail } from '../utils/otp';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { requestOtpSchema, verifyOtpSchema } from '../schemas/auth';
import { OTP_EXPIRY_MS } from '../utils/otp';
import type { OtpVerificationResponse, RenewAccessTokenResponse } from '../../../shared/types/auth';
import type { ApiErrorResponse } from '../../../shared/errors';
import { ERROR_CODE } from '../../../shared/constants/errors';
import { requireRefreshToken } from '../middleware/auth';
import {
  otpRequestLimiter,
  otpVerificationLimiter,
  refreshLimiter,
} from '../middleware/api-rate-limiters';
import { findOrCreateUserForEmail, validateAndDeleteOtp } from '../services/auth';
import config from '../config';
import z from 'zod';

const router = Router();

router.post(
  '/request-otp',
  otpRequestLimiter,
  async (req, res: Response<{ success: true } | ApiErrorResponse>) => {
    const result = requestOtpSchema.safeParse(req.body);
    if (!result.success) {
      return res
        .status(400)
        .json({ errorMessage: 'Invalid email', errorCode: ERROR_CODE.INVALID_EMAIL });
    }

    const { email } = result.data;

    const isReviewAccount =
      config.playStoreReview.email &&
      config.playStoreReview.otpCode &&
      email === config.playStoreReview.email;

    if (isReviewAccount) {
      return res.json({ success: true });
    }

    const code = generateOtpCode();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

    await db.insert(otpCodes).values({ email, code, expiresAt });
    await sendOtpEmail(email, code);

    res.json({ success: true });
  }
);

router.post(
  '/verify-otp',
  otpVerificationLimiter,
  async (req, res: Response<OtpVerificationResponse | ApiErrorResponse>) => {
    const result = verifyOtpSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        errorMessage: 'Invalid email or code',
        errorCode: ERROR_CODE.INVALID_REQUEST,
      });
    }

    const { email, code } = result.data;

    const isReviewBypass =
      config.playStoreReview.email &&
      config.playStoreReview.otpCode &&
      email === config.playStoreReview.email &&
      code === config.playStoreReview.otpCode;

    const otpValidated = await validateAndDeleteOtp(email, code);

    const otpIsValid = otpValidated || isReviewBypass;

    if (!otpIsValid) {
      return res
        .status(401)
        .json({ errorMessage: 'Invalid or expired code', errorCode: ERROR_CODE.INVALID_OTP });
    }

    const user = await findOrCreateUserForEmail(email);

    // generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    const { token: refreshToken, jti } = generateRefreshToken(user.id);

    await db.insert(refreshTokens).values({
      jti,
      userId: user.id,
    });

    const response: OtpVerificationResponse = { accessToken, refreshToken };
    res.json(response);
  }
);

router.post(
  '/refresh',
  refreshLimiter,
  requireRefreshToken,
  async (req, res: Response<RenewAccessTokenResponse | ApiErrorResponse>) => {
    if (!req.refreshPayload) {
      return res
        .status(401)
        .json({ errorMessage: 'Unauthorized', errorCode: ERROR_CODE.UNAUTHORIZED });
    }

    // check if jti exists in database (not revoked)
    const [tokenRecord] = await db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.jti, req.refreshPayload.jti))
      .limit(1);

    if (!tokenRecord) {
      return res.status(401).json({
        errorMessage: 'Refresh token revoked',
        errorCode: ERROR_CODE.REFRESH_TOKEN_REVOKED,
      });
    }

    // get user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.refreshPayload.userId))
      .limit(1);

    if (!user) {
      return res
        .status(401)
        .json({ errorMessage: 'User not found', errorCode: ERROR_CODE.USER_NOT_FOUND });
    }

    // generate new access token (keep same refresh token)
    const newAccessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    res.json({ accessToken: newAccessToken });
  }
);

router.delete(
  '/sessions/current',
  requireRefreshToken,
  async (req, res: Response<{ success: true } | ApiErrorResponse>) => {
    if (!req.refreshPayload) {
      return res
        .status(401)
        .json({ errorMessage: 'Unauthorized', errorCode: ERROR_CODE.UNAUTHORIZED });
    }

    const { jti, userId } = req.refreshPayload;

    try {
      await db.delete(refreshTokens).where(eq(refreshTokens.jti, jti));
      console.log(`👋 logged out session ${jti} for user ${userId}`);
      res.json({ success: true });
    } catch (error) {
      console.error('failed to logout:', error);
      res.status(500).json({ errorMessage: 'logout failed', errorCode: ERROR_CODE.INTERNAL_ERROR });
    }
  }
);

router.delete(
  '/sessions/:jti',
  requireRefreshToken,
  async (req, res: Response<{ success: true } | ApiErrorResponse>) => {
    if (!req.refreshPayload) {
      return res
        .status(401)
        .json({ errorMessage: 'Unauthorized', errorCode: ERROR_CODE.UNAUTHORIZED });
    }
    const { userId } = req.refreshPayload;

    const jtiResult = z.uuid().safeParse(req.params.jti);
    if (!jtiResult.success) {
      return res
        .status(400)
        .json({ errorMessage: 'Invalid session id', errorCode: ERROR_CODE.INVALID_REQUEST });
    }
    const jti = jtiResult.data;

    // verify that authorized user owns the jti
    const [existingToken] = await db
      .select()
      .from(refreshTokens)
      .where(and(eq(refreshTokens.jti, jti), eq(refreshTokens.userId, userId)))
      .limit(1);

    if (!existingToken) {
      return res
        .status(404)
        .json({ errorMessage: 'Session not found', errorCode: ERROR_CODE.SESSION_NOT_FOUND });
    }

    await db.delete(refreshTokens).where(eq(refreshTokens.jti, jti));
    res.json({ success: true });
  }
);

router.delete(
  '/sessions',
  requireRefreshToken,
  async (req, res: Response<{ success: true; count: number } | ApiErrorResponse>) => {
    if (!req.refreshPayload) {
      return res
        .status(401)
        .json({ errorMessage: 'Unauthorized', errorCode: ERROR_CODE.UNAUTHORIZED });
    }
    const { userId, jti: currentJti } = req.refreshPayload;

    const deleted = await db
      .delete(refreshTokens)
      .where(and(eq(refreshTokens.userId, userId), ne(refreshTokens.jti, currentJti)))
      .returning();

    res.json({ success: true, count: deleted.length });
  }
);

export default router;
