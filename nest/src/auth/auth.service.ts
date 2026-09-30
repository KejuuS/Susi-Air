import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, timingSafeEqual } from 'node:crypto';
import type { EnvironmentVariables } from '../config/env.validation';
import { FlightHoursRepository } from '../data/flight-hours.repository';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { JwtPayload } from './jwt-payload';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('Auth');

  constructor(
    private readonly config: ConfigService<EnvironmentVariables, true>,
    private readonly jwt: JwtService,
    private readonly flightHoursRepository: FlightHoursRepository,
  ) {}

  async login({ username, password }: LoginDto): Promise<LoginResponseDto> {
    const expectedUsername = this.config.get('AUTH_USERNAME', { infer: true });
    const expectedPassword = this.config.get('AUTH_PASSWORD', { infer: true });

    // Check both so the reply doesn't reveal which one was wrong.
    const usernameMatches = safeEqual(username, expectedUsername);
    const passwordMatches = safeEqual(password, expectedPassword);
    if (!usernameMatches || !passwordMatches) {
      this.logger.warn(`Login failed for "${username}"`);
      throw new UnauthorizedException('Invalid username or password');
    }

    this.logger.log(`Login succeeded for "${username}"`);
    const { name } = this.flightHoursRepository.getPilot();
    const payload: JwtPayload = { sub: username, name };

    return {
      accessToken: await this.jwt.signAsync(payload),
      expiresIn: this.config.get('JWT_EXPIRES_IN_SECONDS', { infer: true }),
      pilot: { name },
    };
  }
}

function safeEqual(actual: string, expected: string): boolean {
  const hash = (value: string) => createHash('sha256').update(value).digest();
  return timingSafeEqual(hash(actual), hash(expected));
}
