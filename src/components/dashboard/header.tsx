"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useTradingStore } from "@/store/useTradingStore";
import { cn } from "@/lib/utils";
import { ClientOnly } from "@/components/client-only";
import { 
  Settings, 
  Terminal, 
  Activity, 
  Wallet, 
  Bot, 
  Play, 
  Pause, 
  Square,
  Menu,
  X,
  Zap,
  Trash2
} from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const { mode, setMode, paperBalance, botStatus, setBotStatus, strategies, resetData } = useTradingStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const activeStrategy = strategies[0];

  const navItems = [
    { name: "Terminal", href: "/", icon: Terminal },
    { name: "Strategies", href: "/strategies", icon: Activity },
    { name: "Wallet Lab", href: "/wallet-lab", icon: Wallet },
  ];

  return (
    <>
      <header className="top-0 z-50 fixed flex justify-between items-center bg-black/60 shadow-lg backdrop-blur-[20px] px-6 border-white/10 border-b w-full h-16 transition-all duration-300">
        
        {/* ZONE 1: Identity (Left) */}
        <div className="flex items-center gap-3">
          <Link href="/" className="group flex items-center gap-2">
            <div className="flex justify-center items-center bg-gradient-to-br from-pink-500 to-blue-500 shadow-[0_0_15px_rgba(169,222,249,0.3)] group-hover:shadow-[0_0_25px_rgba(255,153,200,0.5)] rounded-lg w-9 h-9 transition-all duration-300">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-bold text-white text-lg leading-none tracking-tight">Cotton Candy</span>
              <span className="font-thin text-pink-500 text-lg leading-none">Bot</span>
            </div>
          </Link>
        </div>

        {/* ZONE 2: Navigation (Center) */}
        <nav className="hidden top-1/2 left-1/2 absolute xl:flex items-center bg-white/5 p-1 border border-white/10 rounded-full transition-all -translate-x-1/2 -translate-y-1/2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-2 px-5 py-2 rounded-full font-bold text-[11px] transition-all duration-300",
                  isActive ? "text-pink-400" : "text-gray-400 hover:text-white"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white/10 rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon size={14} className={cn("z-10 relative", isActive ? "text-pink-400" : "text-gray-500")} />
                <span className="z-10 relative uppercase tracking-wider">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* ZONE 3: Mission Control (Right) */}
        <div className="flex items-center gap-4">
          
          {/* Component A: Status & Control Module (Hidden on small mobile) */}
          <div className="hidden md:flex items-center bg-black/40 border border-white/5 rounded-full h-10 overflow-hidden">
            <div className="flex items-center gap-2 bg-white/5 px-4 border-white/5 border-r h-full">
              <div className={cn(
                "rounded-full w-2 h-2",
                botStatus === 'RUNNING' ? "bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" : 
                botStatus === 'PAUSED' ? "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]" : "bg-red-500"
              )} />
              <span className="hidden xl:inline font-mono text-[9px] text-gray-400 uppercase tracking-widest">
                {activeStrategy ? activeStrategy.type : "NONE"}
              </span>
            </div>

            <div className="flex items-center gap-0.5 px-2">
              <ControlBtn active={botStatus === 'RUNNING'} onClick={() => setBotStatus('RUNNING')} icon={Play} activeColor="text-green-400" />
              <ControlBtn active={botStatus === 'PAUSED'} onClick={() => setBotStatus('PAUSED')} icon={Pause} activeColor="text-yellow-400" />
              <ControlBtn active={botStatus === 'STOPPED'} onClick={() => setBotStatus('STOPPED')} icon={Square} activeColor="text-red-400" />
            </div>
          </div>

          {/* Component B: Wallet Chip */}
          <div className="group relative flex items-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-full h-10 overflow-hidden transition-all cursor-pointer">
            {/* Real Sol Adapter injected as a hidden trigger */}
            <div className="z-20 absolute inset-0 overflow-hidden cursor-pointer">
               <ClientOnly>
                 <WalletMultiButton className="!bg-transparent !opacity-0 !shadow-none !p-0 !border-none !w-full !min-w-0 !h-full !text-transparent" />
               </ClientOnly>
            </div>

            <div className="flex items-center pr-2 h-full pointer-events-none">
              <div className={cn(
                "flex items-center px-3 rounded-full h-full font-black text-[9px] tracking-tighter transition-all",
                mode === 'PAPER' ? "bg-blue-500/20 text-blue-400" : "bg-pink-500/20 text-pink-400"
              )}>
                {mode}
              </div>
              
              <div className="px-3 font-mono">
                <span className="font-bold text-[11px] text-white">
                  ${(paperBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-center items-center bg-white/10 group-hover:bg-white/20 rounded-full w-7 h-7 overflow-hidden transition-colors">
                 <img src="/assets/wallet-connect.png" className="w-4 h-4 object-contain" alt="Wallet" />
              </div>
            </div>
          </div>

          {/* Settings / Mobile Toggle */}
          <div className="flex items-center gap-2">
            <Link href="/settings" className="hidden md:block">
              <button className="group/btn flex justify-center items-center rounded-full w-10 h-10 text-gray-500 hover:text-white transition-all">
                <Settings className="w-5 h-5 group-hover/btn:rotate-90 transition-transform duration-700 ease-in-out" />
              </button>
            </Link>

            {mode === 'PAPER' && (
              <button 
                onClick={async () => {
                  if (window.confirm("⚠️ RESET PAPER TRADING DATA?\n\nThis will wipe your simulation history and reset stats.\nStrategies will be stopped.\n\nReal wallet data is safe.")) {
                      await resetData();
                  }
                }}
                className="hidden md:flex justify-center items-center hover:bg-red-500/10 rounded-full w-10 h-10 text-red-700 hover:text-red-500 transition-all"
                title="Reset Paper Data"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}

            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden flex justify-center items-center w-10 h-10 text-gray-400 hover:text-white"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="xl:hidden top-16 right-0 left-0 z-40 fixed bg-black/95 backdrop-blur-xl p-6 border-white/10 border-b"
          >
            <nav className="flex flex-col gap-4 mb-8">
              {navItems.map((item) => (
                <Link 
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-4 p-3 rounded-xl font-bold text-sm transition-all",
                    pathname === item.href ? "bg-pink-500/10 text-pink-400 border border-pink-500/20" : "text-gray-400 hover:text-white bg-white/5 border border-white/5"
                  )}
                >
                  <item.icon size={18} />
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white/5 p-4 border border-white/5 rounded-xl">
                <span className="font-bold text-gray-400 text-xs uppercase tracking-widest">Engine Status</span>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "rounded-full w-2 h-2",
                    botStatus === 'RUNNING' ? "bg-green-500 animate-pulse" : "bg-red-500"
                  )} />
                  <span className="font-mono text-[10px] text-white uppercase">{activeStrategy?.type || 'NONE'}</span>
                </div>
              </div>

              <div className="gap-2 grid grid-cols-3">
                 <MobileControlBtn active={botStatus === 'RUNNING'} onClick={() => setBotStatus('RUNNING')} icon={Play} label="RUN" color="bg-green-500" />
                 <MobileControlBtn active={botStatus === 'PAUSED'} onClick={() => setBotStatus('PAUSED')} icon={Pause} label="PAUSE" color="bg-yellow-500" />
                 <MobileControlBtn active={botStatus === 'STOPPED'} onClick={() => setBotStatus('STOPPED')} icon={Square} label="STOP" color="bg-red-500" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ControlBtn({ active, onClick, icon: Icon, activeColor }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "p-2 rounded-full transition-all duration-300",
        active ? cn("bg-white/10", activeColor) : "text-gray-600 hover:text-gray-300"
      )}
    >
      <Icon size={12} fill={active ? "currentColor" : "none"} strokeWidth={active ? 3 : 2} />
    </button>
  );
}

function MobileControlBtn({ active, onClick, icon: Icon, label, color }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 p-3 border rounded-xl transition-all",
        active ? `${color} text-black border-transparent shadow-lg` : "bg-white/5 text-gray-500 border-white/5"
      )}
    >
      <Icon size={14} fill={active ? "black" : "none"} />
      <span className="font-black text-[9px]">{label}</span>
    </button>
  );
}
