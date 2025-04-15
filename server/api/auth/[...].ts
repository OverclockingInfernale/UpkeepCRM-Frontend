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



                userinfo: {
                    url: 'http://sandbox.tailaf6362.ts.net:49153/realms/dev/protocol/openid-connect/userinfo'
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
    events: {
        async signIn(message) { console.log('Authorized')},
    },
    pages: {
        signIn: '/login',
    }
})