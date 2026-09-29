import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClockModule } from './common/clock/clock.module';
import { validateEnv } from './config/env.validation';
import { DataModule } from './data/data.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    ClockModule,
    DataModule,
  ],
})
export class AppModule {}
