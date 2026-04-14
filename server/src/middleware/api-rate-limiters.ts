import rateLimit, { type Options } from 'express-rate-limit';
import config from '../config';

const minuteMs = 60 * 1000;

const createRateLimiter = (options: Partial<Options>) =>
  rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    ...options,
    skip: () => !config.rateLimiting.enabled,
  });

// general fallback for all /api/ routes
export const generalApiLimiter = createRateLimiter({
  windowMs: 15 * minuteMs,
  max: 200,
  message: { error: 'Too many requests from this IP, please try again later.' },
});

// otp email dispatch — primary spam vector
export const otpRequestLimiter = createRateLimiter({
  windowMs: 60 * minuteMs,
  max: 20,
  message: { error: 'Too many code requests, please try again later.' },
});

// otp verification — brute force surface
export const otpVerificationLimiter = createRateLimiter({
  windowMs: 30 * minuteMs,
  max: 20,
  message: { error: 'Too many verification attempts, please try again later.' },
});

// token refresh — hits db on every call, no auth required
export const refreshLimiter = createRateLimiter({
  windowMs: 15 * minuteMs,
  max: 50,
  message: { error: 'Too many refresh attempts, please try again later.' },
});

// anonymous room creation
export const roomCreationLimiter = createRateLimiter({
  windowMs: 5 * minuteMs,
  max: 20,
  message: { error: 'Too many room creation attempts, please try again in a few minutes.' },
});

// authenticated call initiation — creates room + fires FCM notification
export const callInitiationLimiter = createRateLimiter({
  windowMs: 5 * minuteMs,
  max: 15,
  message: { error: 'Too many call attempts, please try again in a few minutes.' },
});

// invite to existing room — fires FCM notification
export const inviteLimiter = createRateLimiter({
  windowMs: 5 * minuteMs,
  max: 20,
  message: { error: 'Too many invite attempts, please try again in a few minutes.' },
});

// unauthenticated call decline — prevents griefing via room id
export const inviteDeclineLimiter = createRateLimiter({
  windowMs: 10 * minuteMs,
  max: 100,
  message: { error: 'Too many requests, please try again shortly.' },
});

// cancel-invite — fires FCM notifications, must be tightly bounded
export const cancelInviteLimiter = createRateLimiter({
  windowMs: 10 * minuteMs,
  max: 30,
  message: { error: 'Too many cancel requests, please try again in a few minutes.' },
});

// user lookup by email — manual form submission only, enumeration surface
export const userLookupByEmailLimiter = createRateLimiter({
  windowMs: 15 * minuteMs,
  max: 20,
  message: { error: 'Too many lookup attempts, please try again later.' },
});

// TURN credential requests
export const turnCredentialsLimiter = createRateLimiter({
  windowMs: 1 * minuteMs,
  max: 30, // limit each IP to 30 requests per minute
  message: { error: 'Too many TURN credential requests, please try again shortly.' },
});
