import {useApiFetch} from "~/server/utils/useApiFetch";

export default defineEventHandler(async (event) => {
    const response = await useApiFetch('/api/orders', event, {
        params: {
            page: 1,
            pageSize: 100
        }
    })

    if(event.method === 'POST') {
        const payload = await readBody(event)

        const response = await useApiFetch('/api/orders', event, {
            method: event.method,
            body: payload
        })
        return response
    }

    return response
})
