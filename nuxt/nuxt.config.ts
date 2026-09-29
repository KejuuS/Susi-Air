export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  // Single-page app: data loads in the browser.
  ssr: false,

  modules: ['@pinia/nuxt'],

  devtools: { enabled: true },

  typescript: {
    strict: true,
  },

  css: ['~/assets/styles/main.scss'],

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          // Makes tokens and mixins available in every SCSS block.
          additionalData: '@use "~/assets/styles/tokens" as *; @use "~/assets/styles/mixins" as *;',
        },
      },
    },
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
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap',
        },
      ],
    },
  },
})
