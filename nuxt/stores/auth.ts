import type { LoginResponse } from '~/types/api'

const TOKEN_COOKIE = 'susi_token'

function tokenCookie(maxAge?: number) {
  return useCookie<string | null>(TOKEN_COOKIE, {
    maxAge,
    sameSite: 'lax',
    secure: !import.meta.dev,
  })
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(tokenCookie().value ?? null)
  const isLoggedIn = computed(() => token.value !== null)

  async function login(username: string, password: string): Promise<void> {
    const response = await useApi().post<LoginResponse>('/auth/login', { username, password })
    tokenCookie(response.expiresIn).value = response.accessToken
    token.value = response.accessToken
    devLog('auth', `Signed in as "${username}", token valid for ${response.expiresIn}s`)
  }

  function logout(): void {
    tokenCookie().value = null
    token.value = null
    devLog('auth', 'Signed out, token removed')
  }

  return { token, isLoggedIn, login, logout }
})
