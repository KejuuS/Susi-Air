import type { ChartRange, FlightHoursSummary } from '~/types/api'
import type { LoadStatus } from '~/types/ui'

export const useFlightHoursStore = defineStore('flightHours', () => {
  const range = ref<ChartRange>('1w')
  const summary = ref<FlightHoursSummary | null>(null)
  const status = ref<LoadStatus>('idle')
  const errorMessage = ref<string | null>(null)

  let latestRequest = 0

  async function load(): Promise<void> {
    const request = ++latestRequest
    status.value = 'loading'
    errorMessage.value = null
    try {
      const result = await useApi().get<FlightHoursSummary>('/flight-hours/summary', {
        range: range.value,
      })
      // Ignore replies for an older range.
      if (request !== latestRequest) return
      summary.value = result
      status.value = 'success'
    } catch (error) {
      if (request !== latestRequest) return
      errorMessage.value = errorMessageOf(error)
      status.value = 'error'
    }
  }

  function setRange(next: ChartRange): Promise<void> {
    range.value = next
    return load()
  }

  return { range, summary, status, errorMessage, load, setRange }
})
