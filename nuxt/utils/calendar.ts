export interface YearMonth {
  year: number
  month: number
}

const monthTitleFormat = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' })

/** 2026, 5, 1 -> "2026-05-01" */
export function isoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/** Monday-first month grid; null = empty cell. */
export function buildMonthGrid({ year, month }: YearMonth): (string | null)[] {
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate()
  const leadingBlanks = (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7
  const cells: (string | null)[] = Array(leadingBlanks).fill(null)
  for (let day = 1; day <= daysInMonth; day++) cells.push(isoDate(year, month, day))
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

export function shiftMonth({ year, month }: YearMonth, delta: number): YearMonth {
  const date = new Date(Date.UTC(year, month - 1 + delta, 1))
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 }
}

/** "May 2026" */
export function monthTitle({ year, month }: YearMonth): string {
  return monthTitleFormat.format(new Date(Date.UTC(year, month - 1, 1)))
}

/** ?year=2026&month=5 -> { year, month }, or null if invalid. */
export function parseMonthQuery(query: Record<string, unknown>): YearMonth | null {
  const year = Number(query.year)
  const month = Number(query.month)
  const valid = Number.isInteger(year) && year >= 2000 && year <= 2100 && Number.isInteger(month) && month >= 1 && month <= 12
  return valid ? { year, month } : null
}
