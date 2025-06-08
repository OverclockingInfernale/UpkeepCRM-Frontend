
export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    console.log(query.orderId)
    const response = await useApiFetch('/api/order-resource', event, {
        method: 'GET',
        params: {
            page: 1,
            pageSize: 100,
            orderId: query.orderId
        }
    })
    return response

})