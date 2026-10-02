import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { Express } from 'express';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';
import { requestLogger } from './common/middleware/request-logger';

/** Builds the app for Vercel's serverless runtime, see api/index.js. */
export async function createServer(): Promise<Express> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(requestLogger);
  configureApp(app);
  await app.init();
  return app.getHttpAdapter().getInstance();
}
