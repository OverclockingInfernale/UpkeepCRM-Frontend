import {useApiFetch} from "~/server/utils/useApiFetch";

export default defineEventHandler(async (event) => {
        return await useApiFetch('/api/resources', event, {
            method: 'GET'
        })

})