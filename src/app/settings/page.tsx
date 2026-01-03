"use client";

import { useState } from 'react';
import { Header } from '@/components/dashboard/header';
import { SidebarNav } from '@/components/settings/sidebar-nav';

// Section Imports
import { NetworkSettings } from '@/components/settings/sections/network-settings';
import { ExecutionSettings } from '@/components/settings/sections/execution-settings';
import { AlertsSettings } from '@/components/settings/sections/alerts-settings';
import { SecuritySettings } from '@/components/settings/sections/security-settings';
import { AppearanceSettings } from '@/components/settings/sections/appearance-settings';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('network');

  const renderContent = () => {
    switch (activeTab) {
        case 'network': return <NetworkSettings />;
        case 'execution': return <ExecutionSettings />;
        case 'alerts': return <AlertsSettings />;
        case 'security': return <SecuritySettings />;
        case 'appearance': return <AppearanceSettings />;
        default: return <NetworkSettings />;
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
        {/* Header needs to be present for consistency */}
        <Header />

        <main className="relative mx-auto px-[5%] pt-[120px] pb-[5%] h-screen container">
            {/* Split View Container */}
            <div className="flex gap-8 h-[calc(100vh-160px)]">
                
                {/* Left Sidebar (25%) */}
                <aside className="flex-shrink-0 slide-in-from-left-8 w-[300px] animate-in duration-700">
                    <SidebarNav activeTab={activeTab} onTabChange={setActiveTab} />
                </aside>
                
                {/* Right Panel (75%) */}
                <section className="flex-1 bg-black/20 shadow-2xl backdrop-blur-xl p-10 border border-white/5 rounded-3xl overflow-y-auto animate-in duration-500 no-scrollbar fade-in zoom-in-95">
                    {renderContent()}
                </section>

            </div>
        </main>
    </div>
  );
}
