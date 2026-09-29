/** Shapes of the mock JSON files. */

export const CHART_RANGES = ['1w', '1m', '3m', '6m', '1y'] as const;
export type ChartRange = (typeof CHART_RANGES)[number];

export interface PilotRecord {
  name: string;
  totalFlightHours: number;
}

export interface FlightHoursLimits {
  daily: number;
  weekly: number;
  monthly: number;
  annual: number;
}

export interface ChartBounds {
  limit: number;
  max: number;
  windowDays: number;
  displayRangeDays: number;
}

export interface FlightHourRecord {
  date: string;
  hours: number;
}

export interface FlightHoursFile {
  pilot: PilotRecord;
  limits: FlightHoursLimits;
  chartBounds: Record<ChartRange, ChartBounds>;
  flightHours: FlightHourRecord[];
}

export interface DocumentRecord {
  id: string;
  label: string;
  expiryDate: string;
}

export interface DocumentsFile {
  thresholds: { warningDays: number };
  documents: DocumentRecord[];
}

export interface ScheduleRecord {
  id: string;
  duty_date: string;
  status: number;
  base_name: string;
  base_color: string;
  duty_type: string;
  count_schedules: number;
  count_logbooks: number;
}

export interface LegendItem {
  code: string;
  label: string;
  color: string;
}

export interface SchedulesFile {
  legend: LegendItem[];
  schedules: ScheduleRecord[];
}
