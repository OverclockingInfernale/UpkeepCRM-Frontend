import {useApiFetch} from "~/server/utils/useApiFetch";

export default defineEventHandler(async (event) => {
    const response = await useApiFetch('/api/order-statuses', event, {
        params: {
            page: 1,
            pageSize: 100
        }
    })
    return response
})
