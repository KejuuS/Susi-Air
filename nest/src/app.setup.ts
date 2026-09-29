import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { validationExceptionFactory } from './common/validation/validation-failed.exception';
import type { EnvironmentVariables } from './config/env.validation';

/** Shared app setup, used by main.ts and the e2e tests. */
export function configureApp(app: NestExpressApplication): void {
  const config = app.get(ConfigService<EnvironmentVariables, true>);

  // Lets the avatar URL use https when deployed behind a proxy.
  app.set('trust proxy', 1);

  app.enableCors({
    origin: parseOrigins(config.get('CORS_ORIGIN', { infer: true })),
    methods: ['GET', 'POST'],
    allowedHeaders: ['Authorization', 'Content-Type'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: validationExceptionFactory,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());
}

function parseOrigins(value: string): string[] {
  return value
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);
}
