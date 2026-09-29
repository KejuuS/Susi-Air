import { addDays, eachDay } from '../common/date/iso-date';
import type {
  ChartBounds,
  ChartRange,
  FlightHourRecord,
} from '../data/data.types';
import { FlightHoursRepository } from '../data/flight-hours.repository';
import { fixedClock } from '../testing/fixed-clock';
import { FlightHoursService, limitStatus } from './flight-hours.service';

const bounds = (windowDays: number, limit: number, max: number) =>
  ({ windowDays, limit, max, displayRangeDays: 3 }) satisfies ChartBounds;

const FIXTURE_BOUNDS: Record<ChartRange, ChartBounds> = {
  '1w': bounds(3, 10, 10.1),
  '1m': bounds(7, 20, 25),
  '3m': bounds(14, 30, 35),
  '6m': bounds(21, 40, 45),
  '1y': bounds(28, 50, 55),
};

// Has a zero-hour day, missing days, and planned hours after 2026-01-10.
const FIXTURE_RECORDS: FlightHourRecord[] = [
  { date: '2026-01-01', hours: 2 },
  { date: '2026-01-02', hours: 0 },
  { date: '2026-01-04', hours: 1.5 },
  { date: '2026-01-05', hours: 4 },
  { date: '2026-01-08', hours: 0.1 },
  { date: '2026-01-09', hours: 0.2 },
  { date: '2026-01-10', hours: 9.9 },
  { date: '2026-01-11', hours: 6 },
  { date: '2026-01-12', hours: 6 },
];

function createService(
  today: string,
  records: FlightHourRecord[] = FIXTURE_RECORDS,
): FlightHoursService {
  const repository: FlightHoursRepository = {
    getPilot: () => ({ name: 'Test Pilot', totalFlightHours: 0 }),
    getLimits: () => ({ daily: 8, weekly: 40, monthly: 100, annual: 1050 }),
    getChartBounds: () => FIXTURE_BOUNDS,
    getRecords: () => records,
  };
  return new FlightHoursService(repository, fixedClock(today));
}

describe('FlightHoursService', () => {
  describe('rollingSum', () => {
    const service = createService('2026-01-10');

    it('counts missing dates and zero-hour days as 0', () => {
      // 01-01..01-05 = 2 + 0 + (missing) + 1.5 + 4
      expect(service.rollingSum('2026-01-05', 5)).toBeCloseTo(7.5);
      // 01-06 and 01-07 are both missing
      expect(service.rollingSum('2026-01-07', 2)).toBe(0);
    });

    it('treats days before the first record as 0', () => {
      // 2025-12-27..2026-01-02, only 01-01 has hours
      expect(service.rollingSum('2026-01-02', 7)).toBeCloseTo(2);
      expect(service.rollingSum('2025-12-31', 7)).toBe(0);
    });

    it('ignores hours after today, because they are not flown yet', () => {
      // 01-10..01-12 has 9.9 + 6 + 6 in the file, but only 01-10 is flown
      expect(service.rollingSum('2026-01-12', 3)).toBeCloseTo(9.9);
      expect(service.rollingSum('2026-01-20', 3)).toBe(0);
    });

    it('matches a naive loop for every date and window size', () => {
      const naive = (date: string, windowDays: number) =>
        eachDay(addDays(date, -(windowDays - 1)), date)
          .filter((day) => day <= '2026-01-10')
          .map((day) => FIXTURE_RECORDS.find((r) => r.date === day)?.hours ?? 0)
          .reduce((sum, hours) => sum + hours, 0);

      for (const date of eachDay('2025-12-25', '2026-01-20')) {
        for (let windowDays = 1; windowDays <= 20; windowDays++) {
          expect(service.rollingSum(date, windowDays)).toBeCloseTo(
            naive(date, windowDays),
            9,
          );
        }
      }
    });

    it('returns 0 for an empty dataset', () => {
      expect(createService('2026-01-10', []).rollingSum('2026-01-10', 7)).toBe(
        0,
      );
    });
  });

  describe('getSummary', () => {
    it('returns a dense series centered on today, with flags', () => {
      const summary = createService('2026-01-10').getSummary('1w');

      expect(summary).toMatchObject({
        range: '1w',
        today: '2026-01-10',
        windowDays: 3,
        limit: 10,
        yMax: 10.1,
      });
      expect(summary.points).toEqual([
        {
          date: '2026-01-07',
          value: 4,
          isToday: false,
          isFuture: false,
          overLimit: false,
          partialWindow: false,
        },
        {
          date: '2026-01-08',
          value: 0.1,
          isToday: false,
          isFuture: false,
          overLimit: false,
          partialWindow: false,
        },
        // Shows 0.3, not 0.30000000000000004
        {
          date: '2026-01-09',
          value: 0.3,
          isToday: false,
          isFuture: false,
          overLimit: false,
          partialWindow: false,
        },
        // Above the limit and the chart max, returned as-is
        {
          date: '2026-01-10',
          value: 10.2,
          isToday: true,
          isFuture: false,
          overLimit: true,
          partialWindow: false,
        },
        {
          date: '2026-01-11',
          value: 10.1,
          isToday: false,
          isFuture: true,
          overLimit: true,
          partialWindow: false,
        },
        {
          date: '2026-01-12',
          value: 9.9,
          isToday: false,
          isFuture: true,
          overLimit: false,
          partialWindow: false,
        },
        {
          date: '2026-01-13',
          value: 0,
          isToday: false,
          isFuture: true,
          overLimit: false,
          partialWindow: false,
        },
      ]);
    });

    it('flags points whose window starts before the dataset', () => {
      const points = createService('2026-01-02').getSummary('1w').points;

      expect(points.map((p) => [p.date, p.value, p.partialWindow])).toEqual([
        ['2025-12-30', 0, true],
        ['2025-12-31', 0, true],
        ['2026-01-01', 2, true],
        ['2026-01-02', 2, true],
        ['2026-01-03', 2, false],
        ['2026-01-04', 0, false],
        ['2026-01-05', 0, false],
      ]);
    });

    it('always returns the four limit cards computed at today', () => {
      const cards = createService('2026-01-10').getSummary('3m').cards;

      expect(cards.map((c) => [c.key, c.current, c.limit, c.status])).toEqual([
        ['daily', 9.9, 8, 'over'],
        ['weekly', 15.7, 40, 'safe'],
        ['monthly', 17.7, 100, 'safe'],
        ['annual', 17.7, 1050, 'safe'],
      ]);
    });
  });

  describe('getDailyHours', () => {
    it('returns every date in the range, with 0 for missing dates', () => {
      const result = createService('2026-01-10').getDailyHours(
        '2026-01-02',
        '2026-01-04',
      );

      expect(result.days).toEqual([
        { date: '2026-01-02', hours: 0, isFuture: false },
        { date: '2026-01-03', hours: 0, isFuture: false },
        { date: '2026-01-04', hours: 1.5, isFuture: false },
      ]);
    });

    it('returns planned hours after today, flagged as future', () => {
      const result = createService('2026-01-10').getDailyHours(
        '2026-01-11',
        '2026-01-11',
      );

      expect(result.days).toEqual([
        { date: '2026-01-11', hours: 6, isFuture: true },
      ]);
    });
  });

  describe('limitStatus', () => {
    it.each([
      [0, 'safe'],
      [79.9, 'safe'],
      [80, 'warning'],
      [100, 'warning'],
      [100.1, 'over'],
    ])('%s%% is %s', (percent, expected) => {
      expect(limitStatus(percent)).toBe(expected);
    });
  });

  describe('with the real mock data (today 2026-05-15)', () => {
    const service = new FlightHoursService(
      new FlightHoursRepository(),
      fixedClock('2026-05-15'),
    );

    it('computes the limit cards', () => {
      const cards = service.getSummary('1w').cards;

      expect(
        cards.map((c) => [c.key, c.current, c.limit, c.percent, c.status]),
      ).toEqual([
        ['daily', 6.4, 8, 80, 'warning'],
        ['weekly', 25.2, 40, 63, 'safe'],
        ['monthly', 87.2, 100, 87.2, 'warning'],
        ['annual', 1013.8, 1050, 96.6, 'warning'],
      ]);
    });

    it('computes the 1w series', () => {
      const points = service.getSummary('1w').points;

      expect(points).toHaveLength(15);
      expect(points[0].date).toBe('2026-05-08');
      expect(points[7]).toMatchObject({ date: '2026-05-15', isToday: true });
      expect(points[14].date).toBe('2026-05-22');
      expect(points.map((p) => p.value)).toEqual([
        15, 15, 16.6, 12.6, 16.3, 22.2, 24, 25.2, 25.2, 23.6, 23.6, 19, 13.1,
        6.4, 0,
      ]);
    });

    it('flags the real over-limit point in the 1m series', () => {
      const firstPoint = service.getSummary('1m').points[0];

      expect(firstPoint).toMatchObject({
        date: '2026-05-08',
        value: 102.2,
        overLimit: true,
      });
    });
  });
});
