import {useApiFetch} from "~/server/utils/useApiFetch";

export default defineEventHandler(async (event) => {
    if(event.method === 'GET') {
        const query = getQuery(event)
        const thisId = query.orderId
        const response = await useApiFetch('/api/order-resources', event, {
            method: 'GET',
            params: {
                orderId: thisId
            }
        })
        return response
    }

    if(event.method === 'POST') {
        const payload = await readBody(event)

        const response = await useApiFetch('/api/order-resources', event, {
            method: event.method,
            body: payload
        })
        return response
    }
    if(event.method === 'PUT') {
        const payload = await readBody(event)
        const query = getQuery(event)

        const response = await useApiFetch(`/api/order-resources/${query.id}`, event, {
            method: event.method,
            body: payload
        })
        return response
    }

    return {message: 'Bad method'}
})