
export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const thisId = query.orderId
    const response = await useApiFetch('/api/order-services', event, {
        method: 'GET',
        params: {
            orderId: thisId
        }
    })
    return response

})