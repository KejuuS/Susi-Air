import type { PilotProfile } from '~/types/api'
import type { LoadStatus } from '~/types/ui'

export const usePilotStore = defineStore('pilot', () => {
  const profile = ref<PilotProfile | null>(null)
  const status = ref<LoadStatus>('idle')
  const errorMessage = ref<string | null>(null)

  async function load(): Promise<void> {
    status.value = 'loading'
    errorMessage.value = null
    try {
      profile.value = await useApi().get<PilotProfile>('/pilot/me')
      status.value = 'success'
    } catch (error) {
      errorMessage.value = errorMessageOf(error)
      status.value = 'error'
    }
  }

  return { profile, status, errorMessage, load }
})
