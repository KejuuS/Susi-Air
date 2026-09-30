import type { DocumentsResponse, PilotDocument } from '~/types/api'
import type { LoadStatus } from '~/types/ui'

export const useDocumentsStore = defineStore('documents', () => {
  const documents = ref<PilotDocument[] | null>(null)
  const status = ref<LoadStatus>('idle')
  const errorMessage = ref<string | null>(null)

  async function load(): Promise<void> {
    status.value = 'loading'
    errorMessage.value = null
    try {
      const response = await useApi().get<DocumentsResponse>('/documents')
      documents.value = response.documents
      status.value = 'success'
    } catch (error) {
      errorMessage.value = errorMessageOf(error)
      status.value = 'error'
    }
  }

  return { documents, status, errorMessage, load }
})
