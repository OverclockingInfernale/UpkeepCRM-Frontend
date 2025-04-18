import {NuxtAuthHandler} from "#auth";

export default NuxtAuthHandler ({
    providers: [
            {
                id: 'keycloak',
                name: 'Keycloak',
                type: 'oauth',
                clientId: 'console',
                clientSecret: '',
                idToken: true,

                issuer: 'http://sandbox.tailaf6362.ts.net:49153/realms/dev',

                authorization: {
                    url: 'http://sandbox.tailaf6362.ts.net:49153/realms/dev/protocol/openid-connect/auth',
                    params: {
                        scope: 'openid profile email',
                        response_type: 'code'
                    }
                },

                token: {
                    url: 'http://sandbox.tailaf6362.ts.net:49153/realms/dev/protocol/openid-connect/token',
                    params: {
                        grant_type: 'authorization_code',
                        redirect_uri: 'http://localhost:3000/api/auth/callback/keycloak'
                    }
                },

                jwks_endpoint: 'http://sandbox.tailaf6362.ts.net:49153/realms/dev/protocol/openid-connect/certs',

                profile(profile) {
                    return {
                        id: profile.sub,
                        name: profile.username,
                        email: profile.email
                    }
                },
                checks: ["pkce", "state"],

            }
    ],
    callbacks: {
        async jwt({ token, account }) {
            // When logging in
            if (account) {
                token.accessToken = account.access_token
                token.refreshToken = account.refresh_token
                token.expiresAt = Math.floor(Date.now() / 1000) + account.expires_at
            }

            // If token is expired, refresh it
            if (Date.now() >= token.expiresAt * 1000) {
                try {
                    const response = await fetch('http://sandbox.tailaf6362.ts.net:49153/realms/dev/openid-connect/token', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        body: new URLSearchParams({
                            grant_type: 'refresh_token',
                            refresh_token: token.refreshToken,
                            client_id: 'console',
                            client_secret: ''
                        })
                    })

                    const refreshed = await response.json()
                    token.accessToken = refreshed.access_token
                    token.refreshToken = refreshed.refresh_token
                    token.expiresAt = Math.floor(Date.now() / 1000) + refreshed.expires_in
                } catch (e) {
                    console.error('Failed to refresh token', e)
                }
            }

            return token
        },

        async session({ session, token }) {
            session.accessToken = token.accessToken
            return session
        }
    },
    events: {
        async signIn(message) {
        },
        // async signOut(message){
        //     const logoutUrl = 'http://sandbox.tailaf6362.ts.net:49153/realms/dev/protocol/openid-connect/logout'
        //     const redirectUri = 'http://localhost:3000'
        //     return sendRedirect(message., `${logoutUrl}?post_logout_redirect_uri=${encodeURIComponent(redirectUri)}`)        }
    },
    pages: {
        signIn: '/login',
    }
})