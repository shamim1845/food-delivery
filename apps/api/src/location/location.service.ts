import { Injectable } from '@nestjs/common';
import { Redis } from '@upstash/redis';

export interface DriverCoordinates {
  latitude: number;
  longitude: number;
}

function isDriverCoordinates(value: unknown): value is DriverCoordinates {
  return (
    typeof value === 'object' &&
    value !== null &&
    'latitude' in value &&
    'longitude' in value &&
    typeof value.latitude === 'number' &&
    typeof value.longitude === 'number'
  );
}

@Injectable()
export class LocationService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }

  async saveDriverLocation(
    orderId: string,
    latitude: number,
    longitude: number,
  ) {
    const key = `driver:location:${orderId}`;
    await this.redis.set(key, JSON.stringify({ latitude, longitude }), {
      ex: 3600,
    });
  }

  // GET /location/:orderId — customer hydrates map before first live tick
  async getDriverLocation(orderId: string): Promise<DriverCoordinates | null> {
    const key = `driver:location:${orderId}`;
    const data = await this.redis.get<string>(key);
    if (!data) return null;

    const parsed: unknown = typeof data === 'string' ? JSON.parse(data) : data;

    return isDriverCoordinates(parsed) ? parsed : null;
  }
}
