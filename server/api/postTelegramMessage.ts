export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const { chatId, text } = body;

    const botToken = process.env.VITE_TELEGRAM_BOT_TOKEN;
    if (!botToken || !chatId || !text) return { error: 'Missing data' };

    await $fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        body: {
            chat_id: chatId,
            text: text,
        },
    });

    // Store message as "fromMe"
    const messages = useStorage('telegram:messages');
    const id = `bot-${Date.now()}-${Math.random()}`; // unique ID to avoid collisions
    await messages.setItem(id, {
        chatId,
        message: text,
        time: Date.now(),
        fromMe: true,
        name: 'You',
    });

    return { status: 'sent' };
});
