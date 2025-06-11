// server/plugins/telegramPolling.ts
export default defineNitroPlugin((nitroApp) => {
    // State management
    const state = {
        isPolling: false,
        isInitialized: false,
        botToken: '8111705395:AAFWjIEHS3eXnaxS4D2AK7Dj6pOvIzg4EjE',
        abortController: null as AbortController | null,
        pollingInterval: 3000, // Default interval
    }

    // Storage setup
    const messages = useStorage('telegram:messages')
    const pollState = useStorage('telegram:state')

    // Core polling function
    async function startPolling() {
        if (!state.botToken) {
            console.error('Missing TELEGRAM_BOT_TOKEN')
            return
        }

        if (state.isPolling) {
            console.warn('Polling already running')
            return
        }

        state.isPolling = true
        state.abortController = new AbortController()
        let offset = (await pollState.getItem('offset')) || 0

        console.log('Starting Telegram polling...')

        const poll = async () => {
            if (state.abortController?.signal.aborted) return

            try {
                const res = await $fetch(`https://api.telegram.org/bot${state.botToken}/getUpdates`, {
                    params: { offset, timeout: 30 },
                    signal: state.abortController?.signal
                })

                // @ts-ignore - Telegram API response type
                const updates = res?.result || []

                for (const update of updates) {
                    offset = update.update_id + 1
                    await pollState.setItem('offset', offset)

                    const msg = update.message
                    if (!msg?.chat?.id || !msg.text) continue

                    await messages.setItem(`${update.update_id}`, {
                        chatId: msg.chat.id,
                        message: msg.text,
                        time: Date.now(),
                        fromMe: msg.from?.is_bot === true,
                        name: msg.chat.username ||
                            `${msg.chat.first_name || ''} ${msg.chat.last_name || ''}`.trim() || 'Unknown',
                    })
                }

                // Immediate next poll if we got updates
                if (updates.length > 0) {
                    setImmediate(poll)
                } else {
                    setTimeout(poll, state.pollingInterval)
                }
            } catch (err) {
                // @ts-ignore
                if (err.name !== 'AbortError') {
                    console.error('Polling error:', err)
                    setTimeout(poll, state.pollingInterval * 2) // Backoff on error
                }
            }
        }

        poll()
    }

    function stopPolling() {
        if (!state.isPolling) return

        console.log('Stopping Telegram polling...')
        state.abortController?.abort()
        state.isPolling = false
    }

    // API endpoints
    nitroApp.router.use('/api/telegram-polling', defineEventHandler(async (event) => {
        const { action, interval } = getQuery(event)

        switch (action) {
            case 'start':
                if (interval) state.pollingInterval = parseInt(interval as string) || 3000
                await startPolling()
                return { status: 'started' }

            case 'stop':
                stopPolling()
                return { status: 'stopped' }

            case 'status':
                return {
                    status: state.isPolling ? 'active' : 'inactive',
                    lastOffset: await pollState.getItem('offset'),
                    interval: state.pollingInterval
                }

            default:
                throw createError({
                    statusCode: 400,
                    message: 'Invalid action. Use "start", "stop", or "status"'
                })
        }
    }))

    // Auto-cleanup on server shutdown
    nitroApp.hooks.hookOnce('close', () => {
        stopPolling()
    })
})