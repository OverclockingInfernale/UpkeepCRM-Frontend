
export default defineEventHandler(async (event) => {
    const headers = getRequestHeaders(event) as HeadersInit
  const token = await $fetch('/api/token', { headers })

    // @ts-ignore
    const response = await $fetch('http://sandbox.tailaf6362.ts.net:49154/api/orders', {
        headers: {
            Authorization: `Bearer ${token.accessToken}`
        }
    })
    return response
})
