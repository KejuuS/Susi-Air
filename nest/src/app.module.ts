import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ClockModule } from './common/clock/clock.module';
import { validateEnv } from './config/env.validation';
import { DataModule } from './data/data.module';
import { DocumentsModule } from './documents/documents.module';
import { FlightHoursModule } from './flight-hours/flight-hours.module';
import { HealthController } from './health/health.controller';
import { PilotModule } from './pilot/pilot.module';
import { SchedulesModule } from './schedules/schedules.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    ClockModule,
    DataModule,
    AuthModule,
    PilotModule,
    FlightHoursModule,
    DocumentsModule,
    SchedulesModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
