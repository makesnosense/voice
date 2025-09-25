import rateLimit from 'express-rate-limit';

// general API rate limiting
export const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // disable the `X-RateLimit-*` headers
});

// stricter rate limiting for room creation
export const createRoomLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // limit each IP to 20 room creations per 5 minutes
  message: {
    error: 'Too many room creation attempts, please try again in a few minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// rate limiting for TURN credentials (less strict since it's per connection)
export const turnCredentialsLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 requests per minute
  message: {
    error: 'Too many TURN credential requests, please try again shortly.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});