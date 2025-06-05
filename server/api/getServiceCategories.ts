import {useApiFetch} from "~/server/utils/useApiFetch";

export default defineEventHandler(async (event) => {
    if(event.method === 'GET'){
        return await useApiFetch('/api/service-categories', event, {
            method: 'GET',
            params: {
                page: 1,
                pageSize: 50
            }
        })
    }

    if(event.method === 'POST') {
        const serviceData = await readBody(event)

        const response = await useApiFetch('/api/service-categories', event, {
            method: event.method,
            body: serviceData
        })
        return response
    }

    if(event.method === 'PUT') {
        const serviceData = await readBody(event)

        const response = await useApiFetch(`/api/service-categories/${serviceData.id}`, event, {
            method: event.method,
            body:serviceData
        })
        return response
    }
    return {message: 'Bad method'}
})
