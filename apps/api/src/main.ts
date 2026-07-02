import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { createRouteHandler } from 'uploadthing/express';
import { uploadRouter } from './uploadthing/upload-router';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  app.enableCors();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.use(
    '/api/uploadthing',
    createRouteHandler({
      router: uploadRouter,
      config: {
        token: process.env.UPLOADTHING_TOKEN!,
      },
    }),
  );

  const port = process.env.PORT || 8000;

  await app.listen(port, () => {
    console.log(`🚀 API is running on: http://localhost:${port}/api`);
    console.log(`📋 Health Check: http://localhost:${port}/api/health`);
  });
}
bootstrap();
