export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  // Single-page app.
  ssr: false,

  modules: ['@pinia/nuxt'],

  devtools: { enabled: true },

  typescript: {
    strict: true,
    tsConfig: {
      vueCompilerOptions: {
        // Typo in a component name = typecheck error.
        checkUnknownComponents: true,
      },
    },
  },

  css: ['~/assets/styles/main.scss'],

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "~/assets/styles/tokens" as *; @use "~/assets/styles/mixins" as *;',
        },
      },
    },
  },

  runtimeConfig: {
    public: {
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
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'apple-touch-icon', href: '/susiair-logo2.png' },
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
