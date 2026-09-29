import { ConfigService } from '@nestjs/config';
import { ClockService } from '../common/clock/clock.service';
import type { EnvironmentVariables } from '../config/env.validation';

/** A clock fixed to one date, for tests. */
export function fixedClock(today: string): ClockService {
  return new ClockService(
    new ConfigService<EnvironmentVariables, true>({ APP_TODAY: today }),
  );
}
