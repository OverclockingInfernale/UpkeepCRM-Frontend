import {useApiFetch} from "~/server/utils/useApiFetch";

export default defineEventHandler(async (event) => {
    if(event.method === 'GET'){
        return await useApiFetch('/api/measurement-units', event, {
            method: 'GET',
            params: {
                page: 1,
                pageSize: 100
            }
        })
    }

    if(event.method === 'POST') {
        const payload = await readBody(event)

        const response = await useApiFetch('/api/measurement-units', event, {
            method: event.method,
            body: payload
        })
        return response
    }

    if(event.method === 'PUT') {
        const payload = await readBody(event)

        const response = await useApiFetch(`/api/measurement-units/${payload.id}`, event, {
            method: event.method,
            body: payload
        })
        return response
    }
    return {message: 'Bad method'}
})