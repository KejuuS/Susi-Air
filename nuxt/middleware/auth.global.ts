export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()

  if (to.path === '/login' && auth.isLoggedIn) {
    devLog('router', 'Already signed in, redirecting to /')
    return navigateTo('/')
  }
  if (to.path !== '/login' && !auth.isLoggedIn) {
    devLog('router', `Not signed in, redirecting ${to.fullPath} to /login`)
    return navigateTo('/login')
  }
})
