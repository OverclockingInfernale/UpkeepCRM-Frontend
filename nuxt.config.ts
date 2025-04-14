// https://nuxt.com/docs/api/configuration/nuxt-config
import Aura from '@primevue/themes/aura';
import tailwindcss from '@tailwindcss/vite';
export default defineNuxtConfig({
  modules: [
    '@sidebase/nuxt-auth',
    '@primevue/nuxt-module'
  ],
  compatibilityDate: '2024-11-01',
  css: ['assets/css/style.css'],
  devtools: { enabled: true },

  runtimeConfig: {
    baseURL: 'http://sandbox.tailaf6362.ts.net:49154/scalar/'
  },
  auth: {
    originEnvKey: 'NUXT_BASE_URL',
    provider: {
      type: 'local',

      endpoints: {
        signIn: { path: '/auth/login', method: 'post' },
        signOut: { path: '/auth/logout', method: 'post' },
        signUp: { path: '/auth/register', method: 'post' },
        getSession: { path: '/user/session', method: 'get' },
      },
      token: {
        signInResponseTokenPointer: '/token',
        type: 'Bearer',
        cookieName: 'auth.token',
        headerName: 'Authorization',
        maxAgeInSeconds: 1800,
        sameSiteAttribute: 'lax',
        cookieDomain: 'sidebase.io',
        secureCookieAttribute: false,
        httpOnlyCookieAttribute: false,
      },
      refresh: {
        endpoint: {
          path: '/refresh',
          method: 'post'
        },
      },

      session: {
        dataType: {
          id: 'string | number',
          firstName: 'string',
          lastName: 'string',
        },
      },

      pages: {
        login: '/login'
      },
    },
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

