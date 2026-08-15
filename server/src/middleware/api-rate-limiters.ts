import rateLimit, { type Options } from 'express-rate-limit';
import config from '../config';
import { ERROR_CODE } from '../../../shared/constants/errors';

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
  message: {
    errorMessage: 'Too many requests from this IP, please try again later.',
    errorCode: ERROR_CODE.RATE_LIMITED,
  },
});

// otp email dispatch — primary spam vector
export const otpRequestLimiter = createRateLimiter({
  windowMs: 60 * minuteMs,
  max: 20,
  message: {
    errorMessage: 'Too many code requests, please try again later.',
    errorCode: ERROR_CODE.RATE_LIMITED,
  },
});

// otp verification — brute force surface
export const otpVerificationLimiter = createRateLimiter({
  windowMs: 30 * minuteMs,
  max: 20,
  message: {
    errorMessage: 'Too many verification attempts, please try again later.',
    errorCode: ERROR_CODE.RATE_LIMITED,
  },
});

// token refresh — hits db on every call, no auth required
export const refreshLimiter = createRateLimiter({
  windowMs: 15 * minuteMs,
  max: 50,
  message: {
    errorMessage: 'Too many refresh attempts, please try again later.',
    errorCode: ERROR_CODE.RATE_LIMITED,
  },
});

// anonymous room creation
export const roomCreationLimiter = createRateLimiter({
  windowMs: 5 * minuteMs,
  max: 20,
  message: {
    errorMessage: 'Too many room creation attempts, please try again in a few minutes.',
    errorCode: ERROR_CODE.RATE_LIMITED,
  },
});

// authenticated call initiation — creates room + fires FCM notification
export const callInitiationLimiter = createRateLimiter({
  windowMs: 5 * minuteMs,
  max: 15,
  message: {
    errorMessage: 'Too many call attempts, please try again in a few minutes.',
    errorCode: ERROR_CODE.RATE_LIMITED,
  },
});

// invite to existing room — fires FCM notification
export const inviteLimiter = createRateLimiter({
  windowMs: 5 * minuteMs,
  max: 20,
  message: {
    errorMessage: 'Too many invite attempts, please try again in a few minutes.',
    errorCode: ERROR_CODE.RATE_LIMITED,
  },
});

// unauthenticated call decline — prevents griefing via room id
export const inviteDeclineLimiter = createRateLimiter({
  windowMs: 10 * minuteMs,
  max: 100,
  message: {
    errorMessage: 'Too many requests, please try again shortly.',
    errorCode: ERROR_CODE.RATE_LIMITED,
  },
});

// cancel-invite — fires FCM notifications, must be tightly bounded
export const cancelInviteLimiter = createRateLimiter({
  windowMs: 10 * minuteMs,
  max: 30,
  message: {
    errorMessage: 'Too many cancel requests, please try again in a few minutes.',
    errorCode: ERROR_CODE.RATE_LIMITED,
  },
});

// user lookup by email — manual form submission only, enumeration surface
export const userLookupByEmailLimiter = createRateLimiter({
  windowMs: 15 * minuteMs,
  max: 20,
  message: {
    errorMessage: 'Too many lookup attempts, please try again later.',
    errorCode: ERROR_CODE.RATE_LIMITED,
  },
});

// account deletion — irreversible, tight bound even though access token is required
export const deleteAccountLimiter = createRateLimiter({
  windowMs: 60 * minuteMs,
  max: 5,
  message: {
    errorMessage: 'Too many requests, please try again later.',
    errorCode: ERROR_CODE.RATE_LIMITED,
  },
});

// name update — db write, low risk
export const updateNameLimiter = createRateLimiter({
  windowMs: 60 * minuteMs,
  max: 20,
  message: {
    errorMessage: 'Too many update attempts, please try again later.',
    errorCode: ERROR_CODE.RATE_LIMITED,
  },
});

// TURN credential requests
export const turnCredentialsLimiter = createRateLimiter({
  windowMs: 1 * minuteMs,
  max: 30, // limit each IP to 30 requests per minute
  message: {
    errorMessage: 'Too many TURN credential requests, please try again shortly.',
    errorCode: ERROR_CODE.RATE_LIMITED,
  },
});

// data export — full db scan, gdpr compliance endpoint
export const dataExportLimiter = createRateLimiter({
  windowMs: 60 * minuteMs,
  max: 10,
  message: {
    errorMessage: 'Too many export requests, please try again later.',
    errorCode: ERROR_CODE.RATE_LIMITED,
  },
});
