export interface DailyHoursDto {
  date: string;
  hours: number;
  /** After today: planned, not flown yet. */
  isFuture: boolean;
}

export interface DailyHoursResponseDto {
  from: string;
  to: string;
  today: string;
  days: DailyHoursDto[];
}
