import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

@Global()
@Module({
  providers: [
    {
      provide: 'DB',
      useFactory: (config: ConfigService) => {
        const connectionString = config.get<string>('DATABASE_URL');
        if (!connectionString) {
          throw new Error('DATABASE_URL is not defined');
        }

        const sql = neon(connectionString);
        return drizzle(sql, { schema });
      },
      inject: [ConfigService],
    },
  ],
  exports: ['DB'],
})
export class DbModule {}
