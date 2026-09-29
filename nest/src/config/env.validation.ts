import { plainToInstance, Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  Max,
  Min,
  validateSync,
} from 'class-validator';
import { ISO_DATE_PATTERN } from '../common/date/iso-date';
import { IsCalendarDate } from '../common/validation/date-validators';

export const DEFAULT_JWT_SECRET = 'dev-only-change-me';

/** Environment variables and their defaults. The app will not start if one is invalid. */
export class EnvironmentVariables {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT = 3001;

  /** The date the whole app treats as today. */
  @Matches(ISO_DATE_PATTERN, { message: 'APP_TODAY must use YYYY-MM-DD' })
  @IsCalendarDate()
  APP_TODAY = '2026-05-15';

  @IsString()
  @IsNotEmpty()
  JWT_SECRET = DEFAULT_JWT_SECRET;

  @Type(() => Number)
  @IsInt()
  @Min(60)
  JWT_EXPIRES_IN_SECONDS = 3600;

  @IsString()
  @IsNotEmpty()
  AUTH_USERNAME = 'johndoe';

  @IsString()
  @IsNotEmpty()
  AUTH_PASSWORD = 'susiairtest';

  /** Allowed frontend URLs, comma-separated. */
  @IsString()
  @IsNotEmpty()
  CORS_ORIGIN = 'http://localhost:3000';
}

export function validateEnv(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const env = plainToInstance(EnvironmentVariables, config);
  const errors = validateSync(env);
  if (errors.length > 0) {
    const messages = errors.flatMap((error) =>
      Object.values(error.constraints ?? {}),
    );
    throw new Error(`Invalid environment variables:\n${messages.join('\n')}`);
  }
  return env;
}
