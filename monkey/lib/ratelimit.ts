import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize rate limiters
// Note: These use environment variables UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Rate limiters por endpoint
export const rateLimiters = {
  // 5 requests per minute for creating invitations
  invitations: new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    analytics: true,
    prefix: 'ratelimit:invitations',
  }),

  // 10 requests per minute for QR validation
  scanner: new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    analytics: true,
    prefix: 'ratelimit:scanner',
  }),

  // 3 requests per minute for login attempts
  login: new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(3, '1 m'),
    analytics: true,
    prefix: 'ratelimit:login',
  }),

  // 30 requests per minute for general API
  api: new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(30, '1 m'),
    analytics: true,
    prefix: 'ratelimit:api',
  }),
};

export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const result = await limiter.limit(identifier);
    return {
      allowed: result.success,
      remaining: result.remaining,
    };
  } catch (error) {
    // If Redis is unavailable, allow the request (fail open)
    console.error('Rate limit error:', error);
    return { allowed: true, remaining: 0 };
  }
}
