export default defineEventHandler(async () => {
    const messages = useStorage('telegram:messages');
    const allKeys = await messages.getKeys();

    const data = await Promise.all(
        allKeys.map(async key => {
            const message = await messages.getItem(key);
            // @ts-ignore
            return { id: key, ...message };
        })
    );

    // Sort by time descending (latest first)
    return data.sort((a, b) => b.time - a.time);
});
