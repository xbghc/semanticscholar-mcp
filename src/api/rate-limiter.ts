// 速率限制器 - 基于 p-queue

import PQueue from 'p-queue';

export class RateLimiter {
  private queue: PQueue;

  constructor(interval: number = 5000) {
    this.queue = new PQueue({
      interval,
      intervalCap: 1,
      concurrency: 1,
    });
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return this.queue.add(fn) as Promise<T>;
  }

  pause(duration: number) {
    this.queue.pause();
    setTimeout(() => this.queue.start(), duration);
  }

  get isPaused(): boolean {
    return this.queue.isPaused;
  }

  get pending(): number {
    return this.queue.pending;
  }
}
