
export default defineEventHandler(async (event) => {
    const response = await useApiFetch('/api/users', event, {
        method: 'GET',
        params: {
            page: 1,
            pageSize: 100
        }
    })
    return response

})