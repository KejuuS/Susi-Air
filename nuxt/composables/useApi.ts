import type { ErrorResponse } from '~/types/api'

export type ApiErrorKind = 'unauthorized' | 'client' | 'server' | 'network'

export class ApiError extends Error {
  constructor(
    readonly kind: ApiErrorKind,
    message: string,
    readonly status?: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

type Query = Record<string, string | number | undefined>

interface RequestOptions {
  method?: 'GET' | 'POST'
  query?: Query
  body?: Record<string, unknown>
}

export function useApi() {
  const { apiBase } = useRuntimeConfig().public
  const auth = useAuthStore()

  async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    try {
      return await $fetch<T>(path, {
        ...options,
        baseURL: apiBase,
        headers: auth.token ? { Authorization: `Bearer ${auth.token}` } : undefined,
      })
    } catch (error) {
      const apiError = toApiError(error)
      // On login a 401 only means wrong credentials. Anywhere else the session has ended.
      if (apiError.kind === 'unauthorized' && path !== '/auth/login') {
        auth.logout()
        await navigateTo('/login')
      }
      throw apiError
    }
  }

  return {
    get: <T>(path: string, query?: Query) => request<T>(path, { query }),
    post: <T>(path: string, body: Record<string, unknown>) =>
      request<T>(path, { method: 'POST', body }),
  }
}

function toApiError(error: unknown): ApiError {
  const { response, data } = error as { response?: { status: number }; data?: ErrorResponse }
  const status = response?.status

  if (!status) {
    return new ApiError('network', 'Could not reach the server. Check your connection and try again.')
  }
  if (status === 401) {
    return new ApiError('unauthorized', data?.message ?? 'Please sign in again.', status)
  }
  if (status >= 500) {
    return new ApiError('server', 'The server had a problem. Please try again.', status)
  }
  return new ApiError('client', data?.message ?? 'The request was not valid.', status)
}
