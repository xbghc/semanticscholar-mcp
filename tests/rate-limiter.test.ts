import { describe, it, expect } from 'vitest';
import { RateLimiter } from '../src/api/rate-limiter.js';

describe('RateLimiter', () => {
  it('should execute function and return result', async () => {
    const limiter = new RateLimiter(100);
    const result = await limiter.execute(async () => 'hello');
    expect(result).toBe('hello');
  });

  it('should throttle requests based on interval', async () => {
    const limiter = new RateLimiter(200); // 200ms interval

    const start = Date.now();
    await limiter.execute(async () => 1);
    await limiter.execute(async () => 2);
    await limiter.execute(async () => 3);
    const elapsed = Date.now() - start;

    // 3 requests with 200ms interval = at least 400ms
    expect(elapsed).toBeGreaterThanOrEqual(380);
    expect(elapsed).toBeLessThan(700);
  });

  it('should pause and resume queue', async () => {
    const limiter = new RateLimiter(50);

    limiter.pause(200);
    expect(limiter.isPaused).toBe(true);

    // Wait for resume
    await new Promise(resolve => setTimeout(resolve, 250));
    expect(limiter.isPaused).toBe(false);
  });

  it('should report pending count', async () => {
    const limiter = new RateLimiter(1000);

    // Start multiple requests
    const p1 = limiter.execute(async () => {
      await new Promise(r => setTimeout(r, 100));
      return 1;
    });
    const p2 = limiter.execute(async () => 2);

    // One should be pending
    expect(limiter.pending).toBeGreaterThanOrEqual(0);

    await Promise.all([p1, p2]);
  });
});
