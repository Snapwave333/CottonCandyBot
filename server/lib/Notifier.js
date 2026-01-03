import getDb from './db.js';

class Notifier {
    constructor(io) {
        this.io = io;
    }

    async notify(event) {
        const { type, message, strategyId, symbol, price, amount, pnl, signature } = event;
        const db = await (await import('./db.js')).getDb();
        const settings = db.data.settings;

        const timestamp = new Date().toLocaleString();
        let formattedMessage = `[${timestamp}] 🤖 ${message}`;

        if (symbol) formattedMessage += `\nToken: ${symbol}`;
        if (price) formattedMessage += `\nPrice: $${price}`;
        if (pnl !== undefined) formattedMessage += `\nP/L: ${pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}%`;
        if (signature) formattedMessage += `\nSig: ${signature.slice(0, 8)}...`;

        // 1. Send to Telegram if enabled
        if (settings.telegramEnabled && settings.telegramToken && settings.telegramChatId) {
            this.sendTelegram(settings.telegramToken, settings.telegramChatId, formattedMessage);
        }

        // 2. Send to Discord if enabled
        if (settings.discordWebhook) {
            this.sendDiscord(settings.discordWebhook, formattedMessage);
        }

        // 3. Log to dashboard
        this.io.emit('log', {
            timestamp: Date.now(),
            message: `[NOTIFIER] Alert Sent: ${message.slice(0, 30)}...`,
            type: 'INFO'
        });
    }

    async sendTelegram(token, chatId, text) {
        try {
            const url = `https://api.telegram.org/bot${token}/sendMessage`;
            await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: text,
                    parse_mode: 'HTML'
                })
            });
        } catch (error) {
            console.error('[Notifier] Telegram Error:', error.message);
        }
    }

    async sendDiscord(webhookUrl, text) {
        try {
            await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: text
                })
            });
        } catch (error) {
            console.error('[Notifier] Discord Error:', error.message);
        }
    }
}

export default Notifier;
