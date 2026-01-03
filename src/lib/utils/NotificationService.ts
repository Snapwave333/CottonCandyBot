/**
 * NotificationService: Handles Telegram alerts for the bot.
 */
export class NotificationService {
  static async sendTelegram(botToken: string, chatId: string, message: string): Promise<boolean> {
    if (!botToken || !chatId) return false;

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Telegram notification failed:', error);
      return false;
    }
  }

  static formatTradeAlert(strategy: string, action: string, token: string, price: number, pnl?: number): string {
    const emoji = action === 'BUY' ? '🚀' : '💰';
    let msg = `${emoji} <b>${strategy} ALERT</b>\n`;
    msg += `Action: <b>${action}</b>\n`;
    msg += `Token: $${token}\n`;
    msg += `Price: $${price.toFixed(6)}`;
    
    if (pnl !== undefined) {
      const pnlEmoji = pnl >= 0 ? '📈' : '📉';
      msg += `\nPNL: ${pnlEmoji} <b>${pnl > 0 ? '+' : ''}${pnl.toFixed(2)}%</b>`;
    }

    return msg;
  }
}
