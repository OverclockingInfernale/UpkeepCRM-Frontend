// https://nuxt.com/docs/api/configuration/nuxt-config
import Aura from '@primevue/themes/aura';
import tailwindcss from '@tailwindcss/vite';
export default defineNuxtConfig({
  modules: [
    '@sidebase/nuxt-auth',
    '@primevue/nuxt-module'
  ],
  compatibilityDate: '2024-11-01',
  css: ['/assets/styles.scss', 'assets/css/style.css'],
  devtools: {enabled: true},

  runtimeConfig: {
    api_url: process.env.API_URL || '',
    api_url_token: process.env.API_URL_TOKEN || '',

    public: {
      host_url: process.env.HOST || ''
    }
  },

  auth: {
    globalAppMiddleware: true,

  },


  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  primevue: {
    options: {
      ripple: true,
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.app-dark',
          cssLayer: {
            name: 'primevue',
            order: 'theme, base, primevue'
          }
        }
      }
    }
  }

})

