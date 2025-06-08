
export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const response = await useApiFetch('/api/order-service', event, {
        method: 'GET',
        params: {
            page: 1,
            pageSize: 100,
            orderId: query.orderId
        }
    })
    return response

})