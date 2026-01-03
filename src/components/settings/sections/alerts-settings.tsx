import React from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { TechInput } from '../ui/tech-input';
import { CyberSwitch } from '../ui/cyber-switch';

export function AlertsSettings() {
  const { telegramToken, telegramChatId, telegramEnabled, discordWebhook, actions } = useSettingsStore();

  return (
    <div className="slide-in-from-right-4 space-y-8 animate-in duration-500 fade-in">
        <div>
            <h2 className="mb-2 font-bold text-white text-2xl">Notification Channels</h2>
            <p className="text-gray-400 text-sm">Configure outbound alerts for trade execution and errors.</p>
        </div>

        <section className="space-y-6">
            <div className="space-y-4">
                <CyberSwitch 
                    label="Enable Telegram Notifications"
                    checked={telegramEnabled}
                    onCheckedChange={actions.toggleTelegram}
                />
                <TechInput 
                    label="Telegram Bot Token"
                    placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                    value={telegramToken}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => actions.setTelegramToken(e.target.value)}
                    saved={telegramToken.length > 5}
                />
                <TechInput 
                    label="Telegram Chat ID"
                    placeholder="-100123456789"
                    value={telegramChatId}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => actions.setTelegramChatId(e.target.value)}
                    saved={telegramChatId.length > 5}
                />
            </div>
            
            <div className="pt-4 border-white/5 border-t">
                <TechInput 
                    label="Discord Webhook URL"
                    placeholder="https://discord.com/api/webhooks/..."
                    value={discordWebhook}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => actions.setDiscordWebhook(e.target.value)}
                    saved={discordWebhook.includes('discord')}
                />
            </div>

            <div className="space-y-6 pt-8 border-white/5 border-t">
                <div>
                    <h2 className="mb-2 font-bold text-white text-xl">Autonomous Management</h2>
                    <p className="text-gray-400 text-sm">Allow the bot to automatically pause or switch strategies based on market volatility and performance.</p>
                </div>
                
                <div className="space-y-4">
                    <CyberSwitch 
                        label="Enable Market Sentinel"
                        checked={useSettingsStore((state) => state.autonomousManagementEnabled)}
                        onCheckedChange={actions.toggleAutonomousManagement}
                    />
                    <p className="ml-12 text-blue-400/60 text-xs">Automatically pauses high-risk strategies during extreme market volatility.</p>
                    
                    <CyberSwitch 
                        label="Performance Guard"
                        checked={useSettingsStore((state) => state.performanceGuardEnabled)}
                        onCheckedChange={actions.togglePerformanceGuard}
                    />
                    <p className="ml-12 text-blue-400/60 text-xs">Pauses strategies after 3 consecutive stop losses to prevent capital drain.</p>
                </div>
            </div>
        </section>
    </div>
  );
}
