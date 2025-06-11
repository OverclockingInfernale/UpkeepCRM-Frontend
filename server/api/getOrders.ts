import {useApiFetch} from "~/server/utils/useApiFetch";

export default defineEventHandler(async (event) => {
    if(event.method === 'GET') {
        const response = await useApiFetch('/api/orders', event, {
            params: {
                page: 1,
                pageSize: 500
            }
        })
        return response
    }

    if(event.method === 'POST') {
        const payload = await readBody(event)

        const response = await useApiFetch('/api/orders', event, {
            method: event.method,
            body: payload
        })
        return response
    }

    if(event.method === 'PUT') {
        const payload = await readBody(event)
        const query = getQuery(event)

        const response = await useApiFetch(`/api/orders/${query.orderId}`, event, {
            method: event.method,
            body: payload
        })
        return response
    }

    return {message: 'Bad method'}
})
