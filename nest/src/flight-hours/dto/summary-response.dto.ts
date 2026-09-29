import type { ChartRange } from '../../data/data.types';

export interface ChartPointDto {
  date: string;
  /** Not capped at the limit or the chart max. */
  value: number;
  isToday: boolean;
  /** After today. Only hours flown so far are counted. */
  isFuture: boolean;
  overLimit: boolean;
  /** The window starts before the data does. */
  partialWindow: boolean;
}

export type LimitCardKey = 'daily' | 'weekly' | 'monthly' | 'annual';
export type LimitStatus = 'safe' | 'warning' | 'over';

export interface LimitCardDto {
  key: LimitCardKey;
  label: string;
  current: number;
  limit: number;
  windowDays: number;
  percent: number;
  status: LimitStatus;
}

export interface FlightHoursSummaryDto {
  range: ChartRange;
  today: string;
  windowDays: number;
  limit: number;
  yMax: number;
  points: ChartPointDto[];
  /** Always all four limits, as of today. */
  cards: LimitCardDto[];
}
