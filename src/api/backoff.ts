// 指数退避策略

import type { RateLimiter } from './rate-limiter.js';

export class BackoffStrategy {
  private attempts = 0;
  private maxAttempts: number;
  private baseDelay: number;

  constructor(
    private limiter: RateLimiter,
    options: { maxAttempts?: number; baseDelay?: number } = {}
  ) {
    this.maxAttempts = options.maxAttempts ?? 5;
    this.baseDelay = options.baseDelay ?? 1000;
  }

  /**
   * 当收到 429 时调用
   * 返回等待时间(ms)，如果超过最大重试次数返回 -1
   */
  onRateLimited(): number {
    if (this.attempts >= this.maxAttempts) {
      return -1;
    }

    const delay = this.baseDelay * Math.pow(2, this.attempts);
    this.attempts++;
    this.limiter.pause(delay);
    return delay;
  }

  /**
   * 请求成功时调用，重置计数
   */
  reset() {
    this.attempts = 0;
  }

  get currentAttempts(): number {
    return this.attempts;
  }
}
