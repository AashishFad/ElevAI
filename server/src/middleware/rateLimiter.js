/**
 * Lightweight, in-memory sliding-window rate limiter for ElevAI
 * Protects auth and expensive AI endpoints from abuse without adding heavy dependencies.
 */

function createRateLimiter({
  windowMs = 60 * 1000, // 1 minute window
  maxRequests = 60,      // Max requests per window
  message = 'Too many requests. Please try again later.',
  keyGenerator = (req) => req.ip || req.headers['x-forwarded-for'] || 'global',
} = {}) {
  const requestHits = new Map();

  // Cleanup expired timestamps every 2 minutes
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, timestamps] of requestHits.entries()) {
      const valid = timestamps.filter((t) => now - t < windowMs);
      if (valid.length === 0) {
        requestHits.delete(key);
      } else {
        requestHits.set(key, valid);
      }
    }
  }, 2 * 60 * 1000);

  // Prevent interval from keeping the Node.js event loop alive in test runners
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return (req, res, next) => {
    // Skip rate limiting during automated test suite runs
    if (process.env.NODE_ENV === 'test') {
      return next();
    }

    const now = Date.now();
    const key = keyGenerator(req);
    const timestamps = requestHits.get(key) || [];

    // Filter to requests within current sliding window
    const recentHits = timestamps.filter((t) => now - t < windowMs);

    if (recentHits.length >= maxRequests) {
      const oldestHit = recentHits[0];
      const retryAfterSeconds = Math.ceil((windowMs - (now - oldestHit)) / 1000) || 1;

      res.set('Retry-After', String(retryAfterSeconds));
      return res.status(429).json({
        success: false,
        message,
        retryAfterSeconds,
      });
    }

    recentHits.push(now);
    requestHits.set(key, recentHits);
    next();
  };
}

// Pre-configured rate limiters
const authRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 30,
  message: 'Too many authentication attempts. Please wait a minute and try again.',
  keyGenerator: (req) => `auth_${req.ip || 'ip'}_${req.body?.email || 'email'}`,
});

const aiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 40,
  message: 'AI request limit reached for this minute. Please wait a moment before sending another request.',
  keyGenerator: (req) => `ai_${req.user?.userId || req.ip || 'user'}`,
});

module.exports = {
  createRateLimiter,
  authRateLimiter,
  aiRateLimiter,
};
