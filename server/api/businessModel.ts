import {useApiFetch} from "~/server/utils/useApiFetch";

export default defineEventHandler(async (event) => {
    if (event.method === 'GET') {
        return await useApiFetch('/api/business-models', event, {
            method: 'GET',
            params: {
                page: 1,
                pageSize: 100
            }
        })
    }
    return {message: 'bad method'}
})