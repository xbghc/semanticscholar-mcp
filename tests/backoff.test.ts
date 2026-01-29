import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RateLimiter } from '../src/api/rate-limiter.js';
import { BackoffStrategy } from '../src/api/backoff.js';

describe('BackoffStrategy', () => {
  let limiter: RateLimiter;
  let backoff: BackoffStrategy;

  beforeEach(() => {
    limiter = new RateLimiter(1000);
    backoff = new BackoffStrategy(limiter);
  });

  it('should calculate exponential delay', () => {
    // First attempt: 1000 * 2^0 = 1000ms
    expect(backoff.onRateLimited()).toBe(1000);

    // Second attempt: 1000 * 2^1 = 2000ms
    expect(backoff.onRateLimited()).toBe(2000);

    // Third attempt: 1000 * 2^2 = 4000ms
    expect(backoff.onRateLimited()).toBe(4000);
  });

  it('should return -1 when max attempts exceeded', () => {
    const shortBackoff = new BackoffStrategy(limiter, { maxAttempts: 2 });

    expect(shortBackoff.onRateLimited()).toBe(1000);
    expect(shortBackoff.onRateLimited()).toBe(2000);
    expect(shortBackoff.onRateLimited()).toBe(-1); // exceeded
  });

  it('should reset attempts on success', () => {
    backoff.onRateLimited(); // attempts = 1
    backoff.onRateLimited(); // attempts = 2
    expect(backoff.currentAttempts).toBe(2);

    backoff.reset();
    expect(backoff.currentAttempts).toBe(0);

    // Should start from beginning again
    expect(backoff.onRateLimited()).toBe(1000);
  });

  it('should pause limiter when rate limited', () => {
    const pauseSpy = vi.spyOn(limiter, 'pause');

    backoff.onRateLimited();

    expect(pauseSpy).toHaveBeenCalledWith(1000);
  });

  it('should use custom baseDelay', () => {
    const customBackoff = new BackoffStrategy(limiter, { baseDelay: 500 });

    expect(customBackoff.onRateLimited()).toBe(500);
    expect(customBackoff.onRateLimited()).toBe(1000);
    expect(customBackoff.onRateLimited()).toBe(2000);
  });

  it('should use custom maxAttempts', () => {
    const customBackoff = new BackoffStrategy(limiter, { maxAttempts: 3 });

    expect(customBackoff.onRateLimited()).toBe(1000);
    expect(customBackoff.onRateLimited()).toBe(2000);
    expect(customBackoff.onRateLimited()).toBe(4000);
    expect(customBackoff.onRateLimited()).toBe(-1);
  });
});
