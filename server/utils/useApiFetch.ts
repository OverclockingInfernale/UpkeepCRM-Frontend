import {H3Event} from "h3";

export const useApiFetch = async<T = unknown>(url: string, event: H3Event, options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    body?: any,
    params?: Record<string, any>
} = {}): Promise<T> => {
    const config = useRuntimeConfig()
    const headers = getRequestHeaders(event) as HeadersInit
    const token = await $fetch<string>('/api/token', {headers})

    try {
        const response = await $fetch(`${config.api_url}${url}`, {
            method: options.method || 'GET',
            headers: {
                // @ts-ignore
                Authorization: `Bearer ${token.accessToken}`
            },
            query: options.params,
            body: options.body
        }) as T

        return response
    } catch (err: any) {
        console.error('useFetchApi error:', err?.data || err)

        throw createError({
            statusCode: err?.status || 500,
            statusMessage: err?.data?.message || 'API fetch failed'
        })
    }
}