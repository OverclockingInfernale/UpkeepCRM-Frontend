import {getServerSession} from "#auth";
import {H3Event} from "h3";

export async function getUserByIdentityId(identityId: string, event: H3Event){
    const response = await useApiFetch('/api/users', event) as any

    // @ts-ignore
    const user = response.items.find(user => user.identityId === identityId)
    return {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone
    }
}