const hoursFormat = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

const numberFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 })

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

/** 1444.5 -> "1,444.5" */
export function formatHours(value: number): string {
  return hoursFormat.format(value)
}

/** 1050 -> "1,050", 87.2 -> "87.2" */
export function formatNumber(value: number): string {
  return numberFormat.format(value)
}

/** "2026-05-15" -> "15 May 2026" */
export function formatDate(isoDate: string): string {
  return dateFormat.format(new Date(`${isoDate}T00:00:00Z`))
}

export function greetingFor(hour: number): string {
  if (hour >= 5 && hour < 12) return 'Good morning'
  if (hour >= 12 && hour < 18) return 'Good afternoon'
  return 'Good evening'
}
