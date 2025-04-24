import {useApiFetch} from "~/server/utils/useApiFetch";

export default defineEventHandler(async (event) => {


    if(event.method === 'GET'){
        return await useApiFetch('/api/services', event, {
            method: 'GET'
        })
    }


    if(event.method === 'POST') {
        const serviceData = await readBody(event)

        console.log(serviceData)
        const response = await useApiFetch('/api/services', event, {
            method: event.method,
            body: serviceData
        })
        return response
    }
    return {message: 'Bad method'}
})
