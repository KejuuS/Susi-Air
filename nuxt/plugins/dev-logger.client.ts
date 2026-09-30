export default defineNuxtPlugin(() => {
  useRouter().afterEach((to, from) => {
    const message = from.matched.length ? `${from.fullPath} → ${to.fullPath}` : `opened ${to.fullPath}`
    devLog('router', message)
  })
})
