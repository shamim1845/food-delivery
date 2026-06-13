import { Controller, Get, Inject } from '@nestjs/common';
import type { HealthCheckResponse } from '@food-delivery/types';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from './db/schema';

@Controller()
export class AppController {
  constructor(@Inject('DB') private db: NeonHttpDatabase<typeof schema>) {}

  @Get('db-test')
  async dbTest() {
    const data = await this.db.select().from(schema.users);
    return { users: data, count: data.length };
  }

  @Get('health')
  getHealth(): HealthCheckResponse {
    return {
      status: 'ok',
      timestamp: new Date(),
    };
  }
}
