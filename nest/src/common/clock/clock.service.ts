import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EnvironmentVariables } from '../../config/env.validation';
import { IsoDate } from '../date/iso-date';

/** Provides "today" from APP_TODAY. Use this instead of new Date(). */
@Injectable()
export class ClockService {
  constructor(
    private readonly config: ConfigService<EnvironmentVariables, true>,
  ) {}

  today(): IsoDate {
    return this.config.get('APP_TODAY', { infer: true });
  }
}
