import {NuxtAuthHandler} from "#auth";

export default NuxtAuthHandler ({
    providers: [
            {
                id: 'keycloak',
                name: 'Keycloak',
                type: 'oauth',
                clientId: 'console',
                clientSecret: '',
                idToken: false,

                token: {
                    url: 'http://sandbox.tailaf6362.ts.net:49153/realms/dev/protocol/openid-connect/token',
                    params: {
                        grant_type: 'authorization_code'
                    }
                },

                authorization: {
                    url: 'http://sandbox.tailaf6362.ts.net:49153/realms/dev/protocol/openid-connect/auth',
                    params: {
                        scope: 'openid profile email',
                        response_type: 'code'
                    }
                },

                userinfo: {
                    url: 'http://sandbox.tailaf6362.ts.net:49153/realms/dev/protocol/openid-connect/userinfo'
                },

                profile(profile) {
                    return {
                        id: profile.sub,
                        name: null,
                        email: null
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