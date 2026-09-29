import { Injectable } from '@nestjs/common';
import type {
  ChartBounds,
  ChartRange,
  FlightHourRecord,
  FlightHoursFile,
  FlightHoursLimits,
  PilotRecord,
} from './data.types';
import flightHoursJson from './json/mock-flight-hours.json';

// Loaded once at startup. The "today" field in the file is ignored, see ClockService.
const data: FlightHoursFile = flightHoursJson;

@Injectable()
export class FlightHoursRepository {
  getPilot(): PilotRecord {
    return data.pilot;
  }

  getLimits(): FlightHoursLimits {
    return data.limits;
  }

  getChartBounds(): Record<ChartRange, ChartBounds> {
    return data.chartBounds;
  }

  getRecords(): readonly FlightHourRecord[] {
    return data.flightHours;
  }
}
