import rateLimit from 'express-rate-limit';

const minuteMs = 60 * 1000;

// general fallback for all /api/ routes
export const generalApiLimiter = rateLimit({
  windowMs: 15 * minuteMs,
  max: 200,
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// otp email dispatch — primary spam vector
export const otpRequestLimiter = rateLimit({
  windowMs: 60 * minuteMs,
  max: 20,
  message: { error: 'Too many code requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// otp verification — brute force surface
export const otpVerificationLimiter = rateLimit({
  windowMs: 30 * minuteMs,
  max: 20,
  message: { error: 'Too many verification attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// anonymous room creation
export const roomCreationLimiter = rateLimit({
  windowMs: 5 * minuteMs,
  max: 20,
  message: { error: 'Too many room creation attempts, please try again in a few minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// authenticated call initiation — creates room + fires FCM notification
export const callInitiationLimiter = rateLimit({
  windowMs: 5 * minuteMs,
  max: 15,
  message: { error: 'Too many call attempts, please try again in a few minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// invite to existing room — fires FCM notification
export const inviteLimiter = rateLimit({
  windowMs: 5 * minuteMs,
  max: 20,
  message: { error: 'Too many invite attempts, please try again in a few minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// unauthenticated call decline — prevents griefing via room id
export const inviteDeclineLimiter = rateLimit({
  windowMs: 10 * minuteMs,
  max: 100,
  message: { error: 'Too many requests, please try again shortly.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// TURN credential requests
export const turnCredentialsLimiter = rateLimit({
  windowMs: 1 * minuteMs,
  max: 30, // limit each IP to 30 requests per minute
  message: { error: 'Too many TURN credential requests, please try again shortly.' },
  standardHeaders: true,
  legacyHeaders: false,
});
