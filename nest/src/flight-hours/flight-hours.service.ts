import { Injectable } from '@nestjs/common';
import { ClockService } from '../common/clock/clock.service';
import { addDays, diffDays, eachDay, IsoDate } from '../common/date/iso-date';
import { round1 } from '../common/utils/round';
import type { ChartBounds, ChartRange } from '../data/data.types';
import { FlightHoursRepository } from '../data/flight-hours.repository';
import { DailyHoursResponseDto } from './dto/daily-hours-response.dto';
import {
  ChartPointDto,
  FlightHoursSummaryDto,
  LimitCardDto,
  LimitCardKey,
  LimitStatus,
} from './dto/summary-response.dto';

const CARD_DEFINITIONS: {
  key: LimitCardKey;
  label: string;
  windowDays: number;
}[] = [
  { key: 'daily', label: 'Daily', windowDays: 1 },
  { key: 'weekly', label: 'Weekly', windowDays: 7 },
  { key: 'monthly', label: 'Monthly', windowDays: 30 },
  { key: 'annual', label: 'Annual', windowDays: 365 },
];

export const WARNING_PERCENT = 80;

@Injectable()
export class FlightHoursService {
  private readonly today: IsoDate;
  private readonly recordedHours: Map<IsoDate, number>;

  private readonly startDate: IsoDate;
  private readonly dayCount: number;
  /** Running totals, so any window can be summed in one step. */
  private readonly prefixSums: number[];

  constructor(
    private readonly repository: FlightHoursRepository,
    clock: ClockService,
  ) {
    this.today = clock.today();

    const records = [...repository.getRecords()].sort((a, b) =>
      a.date.localeCompare(b.date),
    );
    this.recordedHours = new Map(records.map((r) => [r.date, r.hours]));
    this.startDate = records[0]?.date ?? this.today;
    const endDate = records[records.length - 1]?.date ?? this.today;

    // One entry per day. Missing days and days after today count as 0.
    const flownHours = eachDay(this.startDate, endDate).map((date) =>
      date <= this.today ? (this.recordedHours.get(date) ?? 0) : 0,
    );
    this.dayCount = flownHours.length;
    this.prefixSums = [0];
    for (const hours of flownHours) {
      this.prefixSums.push(this.prefixSums[this.prefixSums.length - 1] + hours);
    }
  }

  /** Hours flown in the `windowDays` days ending on `date`. Days before the data or after today count as 0. */
  rollingSum(date: IsoDate, windowDays: number): number {
    const endIndex = diffDays(date, this.startDate);
    const first = Math.max(endIndex - windowDays + 1, 0);
    const last = Math.min(endIndex, this.dayCount - 1);
    if (first > last) return 0;
    return this.prefixSums[last + 1] - this.prefixSums[first];
  }

  getDailyHours(from: IsoDate, to: IsoDate): DailyHoursResponseDto {
    return {
      from,
      to,
      today: this.today,
      days: eachDay(from, to).map((date) => ({
        date,
        hours: round1(this.recordedHours.get(date) ?? 0),
        isFuture: date > this.today,
      })),
    };
  }

  getSummary(range: ChartRange): FlightHoursSummaryDto {
    const bounds = this.repository.getChartBounds()[range];
    const days = eachDay(
      addDays(this.today, -bounds.displayRangeDays),
      addDays(this.today, bounds.displayRangeDays),
    );

    return {
      range,
      today: this.today,
      windowDays: bounds.windowDays,
      limit: bounds.limit,
      yMax: bounds.max,
      points: days.map((date) => this.toChartPoint(date, bounds)),
      cards: this.buildLimitCards(),
    };
  }

  private toChartPoint(date: IsoDate, bounds: ChartBounds): ChartPointDto {
    const value = round1(this.rollingSum(date, bounds.windowDays));
    const windowStart = addDays(date, -(bounds.windowDays - 1));
    return {
      date,
      value,
      isToday: date === this.today,
      isFuture: date > this.today,
      overLimit: value > bounds.limit,
      partialWindow: windowStart < this.startDate,
    };
  }

  private buildLimitCards(): LimitCardDto[] {
    const limits = this.repository.getLimits();
    return CARD_DEFINITIONS.map(({ key, label, windowDays }) => {
      const total = this.rollingSum(this.today, windowDays);
      const limit = limits[key];
      const percent = round1((total / limit) * 100);
      return {
        key,
        label,
        current: round1(total),
        limit,
        windowDays,
        percent,
        status: limitStatus(percent),
      };
    });
  }
}

/** Being exactly at the limit is still allowed. */
export function limitStatus(percent: number): LimitStatus {
  if (percent > 100) return 'over';
  if (percent >= WARNING_PERCENT) return 'warning';
  return 'safe';
}
