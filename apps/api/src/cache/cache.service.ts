import { Injectable, Logger } from '@nestjs/common';
import { Redis } from '@upstash/redis';

@Injectable()
export class CacheService {
  private readonly redis: Redis;
  private readonly logger = new Logger(CacheService.name);

  constructor() {
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get<string>(key);
      if (!data) return null;

      const parsed: unknown =
        typeof data === 'string' ? JSON.parse(data) : data;

      return parsed as T;
    } catch (error) {
      this.logger.error(`Cache GET error for key "${key}"`, error);
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
    try {
      await this.redis.set(key, JSON.stringify(value), { ex: ttlSeconds });
    } catch (error) {
      this.logger.error(`Cache SET error for key "${key}"`, error);
    }
  }

  async del(...keys: string[]): Promise<void> {
    if (keys.length === 0) return;

    try {
      await this.redis.del(...keys);
    } catch (error) {
      this.logger.error(`Cache DEL error for keys "${keys.join(', ')}"`, error);
    }
  }
}
