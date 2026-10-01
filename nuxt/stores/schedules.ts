import type { LegendItem, ScheduleEntry, SchedulesResponse } from '~/types/api'
import type { LoadStatus } from '~/types/ui'

export const useSchedulesStore = defineStore('schedules', () => {
  const year = ref<number | null>(null)
  const month = ref<number | null>(null)
  const today = ref<string | null>(null)
  const entries = ref<ScheduleEntry[]>([])
  const legend = ref<LegendItem[]>([])
  const status = ref<LoadStatus>('idle')
  const errorMessage = ref<string | null>(null)

  let latestRequest = 0

  /** No year/month = the API's current month. */
  async function load(requested?: { year: number; month: number }): Promise<void> {
    const request = ++latestRequest
    status.value = 'loading'
    errorMessage.value = null
    if (requested) {
      year.value = requested.year
      month.value = requested.month
    }
    try {
      const response = await useApi().get<SchedulesResponse>('/schedules', {
        year: requested?.year,
        month: requested?.month,
      })
      if (request !== latestRequest) return
      year.value = response.year
      month.value = response.month
      today.value = response.today
      entries.value = response.entries
      legend.value = response.legend
      status.value = 'success'
    } catch (error) {
      if (request !== latestRequest) return
      errorMessage.value = errorMessageOf(error)
      status.value = 'error'
    }
  }

  return { year, month, today, entries, legend, status, errorMessage, load }
})
