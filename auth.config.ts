import type { AuthConfig }  from '@sidebase/nuxt-auth';

const authConfig: AuthConfig = {
    isEnabled: true,
    disableServerSideAuth: false,
    originEnvKey: 'AUTH_ORIGIN',
    baseURL: 'http://localhost:3000/api/auth',
    provider: { /* your provider config */ },
    sessionRefresh: {
        enablePeriodically: true,
        enableOnWindowFocus: true,
    }
}