import type { ChartRange, FlightHoursSummary } from '~/types/api'
import type { LoadStatus } from '~/types/ui'

export const useFlightHoursStore = defineStore('flightHours', () => {
  const range = ref<ChartRange>('1w')
  const summary = ref<FlightHoursSummary | null>(null)
  const status = ref<LoadStatus>('idle')
  const errorMessage = ref<string | null>(null)

  async function load(): Promise<void> {
    status.value = 'loading'
    errorMessage.value = null
    try {
      summary.value = await useApi().get<FlightHoursSummary>('/flight-hours/summary', {
        range: range.value,
      })
      status.value = 'success'
    } catch (error) {
      errorMessage.value = errorMessageOf(error)
      status.value = 'error'
    }
  }

  return { range, summary, status, errorMessage, load }
})
