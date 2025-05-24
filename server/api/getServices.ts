import {useApiFetch} from "~/server/utils/useApiFetch";

export default defineEventHandler(async (event) => {


    if(event.method === 'GET'){
        return await useApiFetch('/api/services', event, {
            method: 'GET'
        })
    }

    if(event.method === 'POST') {
        const serviceData = await readBody(event)

        console.log('post method', serviceData)
        const response = await useApiFetch('/api/services', event, {
            method: event.method,
            body: serviceData
        })
        console.log(response)
        return response
    }

    if(event.method === 'PUT') {
        const serviceData = await readBody(event)

        console.log('put method', serviceData)
        const response = await useApiFetch(`/api/services/${serviceData.id}`, event, {
            method: event.method,
            body:serviceData
        })
        return response
    }
    return {message: 'Bad method'}
})
