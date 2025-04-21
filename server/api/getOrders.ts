
export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const headers = getRequestHeaders(event) as HeadersInit
  const token = await $fetch('/api/token', { headers })
    const response = await $fetch(`${config.api_url}/api/orders`, {
        headers: {
            // @ts-ignore
            Authorization: `Bearer ${token.accessToken}`
        }
    })
    return response
})
