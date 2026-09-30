import { Logger } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

const logger = new Logger('HTTP');

export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const startedAt = Date.now();

  res.on('finish', () => {
    const { statusCode } = res;
    const errorMessage = res.locals.errorMessage as string | undefined;
    const line = `${req.method} ${req.originalUrl} ${statusCode} ${Date.now() - startedAt}ms${errorMessage ? ` - ${errorMessage}` : ''}`;

    if (statusCode >= 500) logger.error(line);
    else if (statusCode >= 400) logger.warn(line);
    else logger.log(line);
  });

  next();
}
