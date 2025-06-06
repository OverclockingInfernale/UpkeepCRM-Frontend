import {useApiFetch} from "~/server/utils/useApiFetch";

export default defineEventHandler(async (event) => {


    if(event.method === 'GET'){
        return await useApiFetch('/api/resources', event, {
            method: 'GET',
            params: {
                page: 1,
                pageSize: 100
            }
        })
    }

    if(event.method === 'POST') {
        const resourceData = await readBody(event)

        const response = await useApiFetch('/api/resources', event, {
            method: event.method,
            body: resourceData
        })
        return response
    }

    if(event.method === 'PUT') {
        const resourceData = await readBody(event)

        const response = await useApiFetch(`/api/resources/${resourceData.id}`, event, {
            method: event.method,
            body:resourceData
        })
        return response
    }
    return {message: 'Bad method'}
})
