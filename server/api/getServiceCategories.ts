import {useApiFetch} from "~/server/utils/useApiFetch";

export default defineEventHandler(async (event) => {
    const response = await useApiFetch('/api/service-categories', event)
    return response
})
