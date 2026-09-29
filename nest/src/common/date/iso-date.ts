import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(customParseFormat);

/** Dates are plain YYYY-MM-DD strings, calculated in UTC so the server timezone does not matter. */
export type IsoDate = string;

export const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const ISO_DATE_FORMAT = 'YYYY-MM-DD';

function parse(date: IsoDate): dayjs.Dayjs {
  return dayjs.utc(date, ISO_DATE_FORMAT, true);
}

export function isValidIsoDate(value: unknown): value is IsoDate {
  return (
    typeof value === 'string' &&
    ISO_DATE_PATTERN.test(value) &&
    parse(value).isValid()
  );
}

export function addDays(date: IsoDate, days: number): IsoDate {
  return parse(date).add(days, 'day').format(ISO_DATE_FORMAT);
}

export function diffDays(later: IsoDate, earlier: IsoDate): number {
  return parse(later).diff(parse(earlier), 'day');
}

/** All dates from `from` to `to`, inclusive. */
export function eachDay(from: IsoDate, to: IsoDate): IsoDate[] {
  const days: IsoDate[] = [];
  for (let date = from; date <= to; date = addDays(date, 1)) {
    days.push(date);
  }
  return days;
}

export function toYearMonth(date: IsoDate): { year: number; month: number } {
  const parsed = parse(date);
  return { year: parsed.year(), month: parsed.month() + 1 };
}

/** For example 2026, 5 -> "2026-05". */
export function monthPrefix(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}
