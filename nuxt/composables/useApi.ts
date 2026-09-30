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
    const label = `${options.method ?? 'GET'} ${apiBase}${path}${queryString(options.query)}`
    const startedAt = Date.now()
    devLog('api', `→ ${label}`)

    try {
      const response = await $fetch.raw<T>(path, {
        ...options,
        baseURL: apiBase,
        headers: auth.token ? { Authorization: `Bearer ${auth.token}` } : undefined,
      })
      devLog('api', `← ${response.status} ${label} (${Date.now() - startedAt}ms)`)
      return response._data as T
    } catch (error) {
      const apiError = toApiError(error)
      devLog('api', `← ${apiError.status ?? 'no response'} ${label} (${Date.now() - startedAt}ms) - ${apiError.message}`)
      // 401 = wrong password.
      if (apiError.kind === 'unauthorized' && path !== '/auth/login') {
        devLog('auth', 'Session ended, signing out')
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

function queryString(query?: Query): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) params.set(key, String(value))
  }
  const text = params.toString()
  return text ? `?${text}` : ''
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
