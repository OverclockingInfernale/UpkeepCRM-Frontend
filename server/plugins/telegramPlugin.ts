export default defineNitroPlugin(async () => {
    console.log('Telegram polling plugin started')
    // @ts-ignore
    if (process.dev && globalThis.__telegramPollingStarted) return;
    // @ts-ignore
    globalThis.__telegramPollingStarted = true;

    const botToken = process.env.VITE_TELEGRAM_BOT_TOKEN;
    if (!botToken) return console.warn('Missing TELEGRAM_BOT_TOKEN');

    const messages = useStorage('telegram:messages');
    const state = useStorage('telegram:state');

    let offset = await state.getItem('offset') || 0;

    async function pollTelegram() {
        let res
        try {
             res = await $fetch(`https://api.telegram.org/bot${botToken}/getUpdates`, {
                params: { offset, timeout: 30 },
            });

            // @ts-ignore
            const updates = res?.result || [];
            for (const update of updates) {
                offset = update.update_id + 1;
                await state.setItem('offset', offset);
                const msg = update.message;
                const chat = msg?.chat
                const chatId = chat?.id;
                const message = msg?.text;
                const isFromBot = msg?.from?.is_bot

                if (!chatId || !message) continue;

                await messages.setItem(`${update.update_id}`, {
                    chatId,
                    message,
                    time: Date.now(),
                    fromMe: isFromBot === true,
                    name: chat?.username || `${chat?.first_name || 'user'} ${chat?.lastname || 'name'}`.trim(),
                });
            }
        } catch (e) {
            console.error('Polling error:', e);
        } finally {
            // @ts-ignore
            if (res?.result?.length) {
                setImmediate(pollTelegram);
            } else {
                setTimeout(pollTelegram, 3000);
            }
        }
    }

    pollTelegram();
});
