import {useApiFetch} from "~/server/utils/useApiFetch";

export default defineEventHandler(async (event) => {
    if(event.method === 'GET'){
        return await useApiFetch('/api/clients', event, {
            method: 'GET',
            params: {
                page: 1,
                pageSize: 100
            }
        })
    }

    if(event.method === 'POST') {
        const clientData = await readBody(event)

        const response = await useApiFetch('/api/clients', event, {
            method: event.method,
            body: clientData
        })
        return response
    }

    if(event.method === 'PUT') {
        const clientData = await readBody(event)

        const response = await useApiFetch(`/api/clients/${clientData.id}`, event, {
            method: event.method,
            body:clientData
        })
        return response
    }
    return {message: 'Bad method'}
})
