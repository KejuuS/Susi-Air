export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  // Single-page app: data loads in the browser.
  ssr: false,

  devtools: { enabled: true },

  typescript: {
    strict: true,
  },

  runtimeConfig: {
    public: {
      // Overridden by NUXT_PUBLIC_API_BASE.
      apiBase: 'http://localhost:3001',
    },
  },

  app: {
    head: {
      title: 'Susi Air Pilot',
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#0E2138' },
      ],
    },
  },
})
