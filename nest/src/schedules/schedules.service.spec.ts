import { SchedulesRepository } from '../data/schedules.repository';
import { fixedClock } from '../testing/fixed-clock';
import { SchedulesService } from './schedules.service';

describe('SchedulesService', () => {
  const service = new SchedulesService(
    new SchedulesRepository(),
    fixedClock('2026-05-15'),
  );

  it('returns only the entries of the requested month, sorted by date', () => {
    const result = service.getMonth(2026, 5);

    expect(result).toMatchObject({ year: 2026, month: 5, today: '2026-05-15' });
    expect(result.entries).toHaveLength(21);
    expect(result.entries.every((e) => e.date.startsWith('2026-05-'))).toBe(
      true,
    );
    const dates = result.entries.map((e) => e.date);
    expect(dates).toEqual([...dates].sort());
  });

  it("defaults to today's month", () => {
    expect(service.getMonth()).toEqual(service.getMonth(2026, 5));
  });

  it('returns no entries but the full legend for an empty month', () => {
    const result = service.getMonth(2026, 7);

    expect(result.entries).toEqual([]);
    expect(result.legend).toHaveLength(10);
    expect(result.legend[0]).toEqual({
      code: 'DTY',
      label: 'On Duty',
      color: '#10B981',
    });
  });

  it('maps fields to camelCase and computes remaining and isComplete', () => {
    const entry = service
      .getMonth(2026, 5)
      .entries.find((e) => e.id === '97028');

    expect(entry).toEqual({
      id: '97028',
      date: '2026-05-19',
      status: 1,
      baseName: 'SIQ',
      baseColor: '#10B981',
      dutyType: 'DTY',
      countSchedules: 2,
      countLogbooks: 0,
      remaining: 2,
      isComplete: false,
      isToday: false,
    });
  });

  it('marks an entry complete from the counts, not the status field', () => {
    // Status is still 1, but all logbooks are done.
    const entry = service
      .getMonth(2026, 5)
      .entries.find((e) => e.id === '97027');

    expect(entry).toMatchObject({
      status: 1,
      remaining: 0,
      isComplete: true,
      isToday: true,
    });
  });

  it('passes base_color through unchanged, even when it disagrees with the legend', () => {
    // A TRX entry that uses the TRD color in the data.
    const entry = service
      .getMonth(2026, 6)
      .entries.find((e) => e.id === '97041');

    expect(entry).toMatchObject({ dutyType: 'TRX', baseColor: '#FBA577' });
  });
});
