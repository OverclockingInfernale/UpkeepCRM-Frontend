import {useApiFetch} from "~/server/utils/useApiFetch";

export default defineEventHandler(async (event) => {


    if(event.method === 'GET'){
        return await useApiFetch('/api/resources', event, {
            method: 'GET',
            params: {
                page: 1,
                limit: 50
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
    return {message: 'Bad method'}
})
