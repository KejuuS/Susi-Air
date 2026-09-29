import { Global, Module } from '@nestjs/common';
import { DocumentsRepository } from './documents.repository';
import { FlightHoursRepository } from './flight-hours.repository';
import { SchedulesRepository } from './schedules.repository';

/** Serves the mock JSON data from memory. */
@Global()
@Module({
  providers: [FlightHoursRepository, DocumentsRepository, SchedulesRepository],
  exports: [FlightHoursRepository, DocumentsRepository, SchedulesRepository],
})
export class DataModule {}
