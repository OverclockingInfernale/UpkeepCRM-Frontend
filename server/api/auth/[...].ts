import {NuxtAuthHandler} from "#auth";
import {getUserByIdentityId} from "~/server/utils/getUserByIdentityId";
import {H3Event} from "h3";

// @ts-ignore
// @ts-ignore
export default NuxtAuthHandler ({
    secret: 'alisa',
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
                        redirect_uri: `${process.env.AUTH_BASE_URL}/callback/keycloak`
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
        async signIn({account, profile}) {
            return true
        },
        async jwt({ token, account , profile}) {
            const config = useRuntimeConfig()

            if(account){
                token.accessToken = account.access_token
                token.refreshToken = account.refresh_token
                // @ts-ignore
                token.expiresAt = account.expires_at * 1000
                token.id = profile?.sub
                token.name = profile?.name
                token.email = profile?.email
            }

            const expiresAt = (token as any).expiresAt as number | undefined
            const refreshToken = (token as any).refreshToken as string | undefined


            // @ts-ignore
            const checkExpiration = expiresAt? Date.now() > token.expiresAt - 60 * 1000 : false
            if (checkExpiration && token.refreshToken) {
                try {
                    const response = await $fetch<{
                        access_token: string,
                        refresh_token: string,
                        expires_in: number
                    }>
                    (`${config.api_url_token}/realms/dev/protocol/openid-connect/token`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Authorization': `Basic Y29uc29sZTo=`
                        },
                        body: new URLSearchParams({
                            refresh_token: refreshToken!,
                            grant_type: 'refresh_token',

                        })
                    })

                    token.accessToken = response.access_token
                    token.refreshToken = response.refresh_token
                    token.expiresAt = Date.now() + response.expires_in * 1000
                } catch (e) {
                    console.error('Failed to refresh token', e)
                }
            }

            return token
        },

        session: ( async ({session, token}: any, event: H3Event)=> {        //ts is insane
            // if(token){
            //     const user = await getUserByIdentityId(token.id, event)
            //     if(user) {
            //         session.user.id = user.id
            //         session.user.username = user.username
            //         session.user.phone = user.phone
            //         session.user.email = user.email
            //     }
            // }
            return session
        })  as any
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