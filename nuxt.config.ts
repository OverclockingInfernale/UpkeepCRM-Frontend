// https://nuxt.com/docs/api/configuration/nuxt-config
import Aura from '@primevue/themes/aura';
import tailwindcss from '@tailwindcss/vite';
export default defineNuxtConfig({
  modules: [
    '@sidebase/nuxt-auth',
    '@primevue/nuxt-module'
  ],
  compatibilityDate: '2024-11-01',
  css: ['/assets/tailwind.css', 'assets/css/style.css'],
  devtools: {enabled: true},

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
          cssLayer: {
            name: 'primevue',
            order: 'theme, base, primevue'
          }
        }
      }
    }
  }

})

