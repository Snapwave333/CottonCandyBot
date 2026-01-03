import { validateSecretKey } from './crypto.js';

const VALID_API_KEYS = new Set();

/**
 * Initializes authentication system
 * Validates environment variables and loads API keys
 */
export const initAuth = () => {
  if (!process.env.API_KEY) {
    throw new Error('API_KEY environment variable is required for production');
  }

  const keys = process.env.API_KEY.split(',').map(k => k.trim());
  keys.forEach(key => {
    if (key.length < 32) {
      throw new Error('All API keys must be at least 32 characters long');
    }
    VALID_API_KEYS.add(key);
  });

  validateSecretKey(process.env.SECRET_KEY);
};

/**
 * Express middleware to validate API key from Authorization header
 * Header format: Authorization: Bearer <api_key>
 */
export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Authorization header required'
    });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      error: 'INVALID_AUTH_FORMAT',
      message: 'Authorization format must be: Bearer <api_key>'
    });
  }

  const apiKey = parts[1];

  if (!VALID_API_KEYS.has(apiKey)) {
    return res.status(403).json({
      error: 'FORBIDDEN',
      message: 'Invalid API key'
    });
  }

  next();
};

/**
 * Rate limiting middleware (simple in-memory implementation)
 * For production, consider Redis-based rate limiting
 */
const requestCounts = new Map();
const RATE_LIMIT_WINDOW_MS = 60000;
const RATE_LIMIT_MAX_REQUESTS = 100;

export const rateLimiter = (req, res, next) => {
  const identifier = req.headers.authorization || req.ip;
  const now = Date.now();

  if (!requestCounts.has(identifier)) {
    requestCounts.set(identifier, []);
  }

  const timestamps = requestCounts.get(identifier);
  const recentRequests = timestamps.filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);

  if (recentRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
    return res.status(429).json({
      error: 'RATE_LIMIT_EXCEEDED',
      message: `Maximum ${RATE_LIMIT_MAX_REQUESTS} requests per minute exceeded`,
      retryAfter: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000)
    });
  }

  recentRequests.push(now);
  requestCounts.set(identifier, recentRequests);

  res.setHeader('X-RateLimit-Limit', RATE_LIMIT_MAX_REQUESTS);
  res.setHeader('X-RateLimit-Remaining', RATE_LIMIT_MAX_REQUESTS - recentRequests.length);
  res.setHeader('X-RateLimit-Reset', new Date(now + RATE_LIMIT_WINDOW_MS).toISOString());

  next();
};

setInterval(() => {
  const now = Date.now();
  for (const [identifier, timestamps] of requestCounts.entries()) {
    const recentRequests = timestamps.filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);
    if (recentRequests.length === 0) {
      requestCounts.delete(identifier);
    } else {
      requestCounts.set(identifier, recentRequests);
    }
  }
}, RATE_LIMIT_WINDOW_MS);
