import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;

  await app.listen(port, () => {
    console.log(`🚀 API is running on: http://localhost:${port}/api`);
    console.log(`📋 Health Check: http://localhost:${port}/api/health`);
  });
}
bootstrap();
