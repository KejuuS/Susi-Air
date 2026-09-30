import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { STATUS_CODES } from 'node:http';
import {
  ValidationErrorDetail,
  ValidationFailedException,
} from '../validation/validation-failed.exception';

export interface ErrorResponse {
  statusCode: number;
  error: string;
  message: string;
  details: ValidationErrorDetail[];
  path: string;
  timestamp: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    const statusCode = this.statusOf(exception);
    if (statusCode >= 500) {
      this.logger.error(exception);
    }

    const body: ErrorResponse = {
      statusCode,
      error: STATUS_CODES[statusCode] ?? 'Error',
      message: this.messageOf(exception, statusCode),
      details:
        exception instanceof ValidationFailedException ? exception.details : [],
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    // Used by the request logger.
    response.locals.errorMessage = body.message;
    response.status(statusCode).json(body);
  }

  private statusOf(exception: unknown): number {
    if (exception instanceof HttpException) return exception.getStatus();
    const status = (exception as { status?: unknown })?.status;
    if (typeof status === 'number' && status >= 400 && status < 500) {
      return status;
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private messageOf(exception: unknown, statusCode: number): string {
    if (statusCode >= 500) return 'Internal server error';

    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'string') return response;
      const message = (response as { message?: string | string[] }).message;
      if (Array.isArray(message)) return message.join('; ');
      if (message) return message;
    }
    if (exception instanceof Error) return exception.message;
    return STATUS_CODES[statusCode] ?? 'Error';
  }
}
