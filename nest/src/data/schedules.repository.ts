import { Injectable } from '@nestjs/common';
import type { LegendItem, ScheduleRecord, SchedulesFile } from './data.types';
import schedulesJson from './json/mock-schedules.json';

const data: SchedulesFile = schedulesJson;

@Injectable()
export class SchedulesRepository {
  getSchedules(): readonly ScheduleRecord[] {
    return data.schedules;
  }

  getLegend(): readonly LegendItem[] {
    return data.legend;
  }
}
