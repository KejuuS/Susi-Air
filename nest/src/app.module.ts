import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ClockModule } from './common/clock/clock.module';
import { validateEnv } from './config/env.validation';
import { DataModule } from './data/data.module';
import { HealthController } from './health/health.controller';
import { PilotModule } from './pilot/pilot.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    ClockModule,
    DataModule,
    AuthModule,
    PilotModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
