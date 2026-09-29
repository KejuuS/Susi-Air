import type { LegendItem } from '../../data/data.types';

export interface ScheduleEntryDto {
  id: string;
  date: string;
  /** 1 = pending, 2 = completed. */
  status: number;
  baseName: string;
  /** Taken from the data as-is. */
  baseColor: string;
  dutyType: string;
  countSchedules: number;
  countLogbooks: number;
  remaining: number;
  isComplete: boolean;
  isToday: boolean;
}

export type LegendItemDto = LegendItem;

export interface SchedulesResponseDto {
  year: number;
  month: number;
  today: string;
  entries: ScheduleEntryDto[];
  legend: LegendItemDto[];
}
