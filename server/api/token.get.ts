import {getServerSession, getToken} from "#auth";

export default eventHandler(async (event) => {
    const token = await getToken({event})

    const session = await getServerSession(event)
    console.log(session?.expires)
    console.log("now:", new Date().toISOString())
    return token || 'no token present'
})