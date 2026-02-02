import { Router } from 'express';
import { db } from '../db';
import { users, otpCodes, refreshTokens } from '../db/schema';
import { eq, and, gt } from 'drizzle-orm';
import { generateOtpCode, sendOtpEmail } from '../utils/otp';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { requestOtpSchema, verifyOtpSchema, refreshSchema } from '../schemas/auth';
import { OTP_EXPIRY_MS } from '../utils/otp';
import { OtpVerificationResponse } from '../../../shared/auth-types';
import { requireRefreshToken } from '../middleware/auth';

const router = Router();

router.post('/request-otp', async (req, res) => {
  const result = requestOtpSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  const { email } = result.data;

  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

  await db.insert(otpCodes).values({ email, code, expiresAt });
  await sendOtpEmail(email, code);

  res.json({ success: true });
});

router.post('/verify-otp', async (req, res) => {
  const result = verifyOtpSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Invalid email or code' });
  }

  const { email, code } = result.data;

  // find valid OTP
  const [otpRecord] = await db
    .select()
    .from(otpCodes)
    .where(
      and(eq(otpCodes.email, email), eq(otpCodes.code, code), gt(otpCodes.expiresAt, new Date()))
    )
    .limit(1);

  if (!otpRecord) {
    return res.status(401).json({ error: 'Invalid or expired code' });
  }

  // delete used OTP
  await db.delete(otpCodes).where(eq(otpCodes.id, otpRecord.id));

  // find or create user
  let [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (!user) {
    [user] = await db.insert(users).values({ email }).returning();
  }

  // generate tokens
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
  });

  const { token: refreshToken, jti } = generateRefreshToken(user.id);

  await db.insert(refreshTokens).values({
    jti,
    userId: user.id,
  });

  const response: OtpVerificationResponse = { accessToken, refreshToken };
  res.json(response);
});

router.post('/refresh', requireRefreshToken, async (req, res) => {
  // check if jti exists in database (not revoked)
  const [tokenRecord] = await db
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.jti, req.refreshPayload!.jti))
    .limit(1);

  if (!tokenRecord) {
    return res.status(401).json({ error: 'Refresh token revoked' });
  }

  // get user
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, req.refreshPayload!.userId))
    .limit(1);

  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }

  // generate new access token (keep same refresh token)
  const newAccessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
  });

  res.json({ accessToken: newAccessToken });
});

export default router;
