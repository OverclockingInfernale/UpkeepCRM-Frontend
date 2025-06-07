import {useApiFetch} from "~/server/utils/useApiFetch";

export default defineEventHandler(async (event) => {
    if(event.method === 'GET'){
        return await useApiFetch('/api/employees', event, {
            method: 'GET',
            params: {
                page: 1,
                pageSize: 100
            }
        })
    }

    if(event.method === 'POST') {
        const payload = await readBody(event)

        const response = await useApiFetch('/api/employees', event, {
            method: event.method,
            body: payload,
        })
        return response
    }

    if(event.method === 'PUT') {
        const query = getQuery(event)
        const payload = await readBody(event)

        const response = await useApiFetch(`/api/employees/${query.userId}`, event, {
            method: event.method,
            body: payload
        })
        return response
    }
    return {message: 'Bad method'}
})
