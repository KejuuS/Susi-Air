import { Injectable } from '@nestjs/common';
import { ClockService } from '../common/clock/clock.service';
import { monthPrefix, toYearMonth } from '../common/date/iso-date';
import type { ScheduleRecord } from '../data/data.types';
import { SchedulesRepository } from '../data/schedules.repository';
import {
  ScheduleEntryDto,
  SchedulesResponseDto,
} from './dto/schedules-response.dto';

@Injectable()
export class SchedulesService {
  constructor(
    private readonly repository: SchedulesRepository,
    private readonly clock: ClockService,
  ) {}

  getMonth(year?: number, month?: number): SchedulesResponseDto {
    const today = this.clock.today();
    const current = toYearMonth(today);
    const selectedYear = year ?? current.year;
    const selectedMonth = month ?? current.month;
    const prefix = monthPrefix(selectedYear, selectedMonth);

    const entries = this.repository
      .getSchedules()
      .filter((record) => record.duty_date.startsWith(prefix))
      .map((record) => toEntry(record, today))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      year: selectedYear,
      month: selectedMonth,
      today,
      entries,
      legend: [...this.repository.getLegend()],
    };
  }
}

function toEntry(record: ScheduleRecord, today: string): ScheduleEntryDto {
  const remaining = Math.max(record.count_schedules - record.count_logbooks, 0);
  return {
    id: record.id,
    date: record.duty_date,
    status: record.status,
    baseName: record.base_name,
    baseColor: record.base_color,
    dutyType: record.duty_type,
    countSchedules: record.count_schedules,
    countLogbooks: record.count_logbooks,
    remaining,
    isComplete: remaining === 0,
    isToday: record.duty_date === today,
  };
}
