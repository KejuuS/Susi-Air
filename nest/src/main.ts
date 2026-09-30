import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';
import { requestLogger } from './common/middleware/request-logger';
import {
  DEFAULT_JWT_SECRET,
  type EnvironmentVariables,
} from './config/env.validation';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(requestLogger);
  configureApp(app);

  const config = app.get(ConfigService<EnvironmentVariables, true>);
  const logger = new Logger('Bootstrap');
  if (config.get('JWT_SECRET', { infer: true }) === DEFAULT_JWT_SECRET) {
    logger.warn('JWT_SECRET is the development default. Set it in production.');
  }

  const port = config.get('PORT', { infer: true });
  await app.listen(port);
  logger.log(
    `API listening on port ${port}, today is ${config.get('APP_TODAY', { infer: true })}`,
  );
}

void bootstrap();
