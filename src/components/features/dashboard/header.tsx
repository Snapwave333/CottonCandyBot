"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useTradingStore } from "@/store/useTradingStore";
import { cn } from "@/lib/utils";
import { 
  Activity, 
  Settings, 
  Wallet, 
  Menu, 
  Terminal, 
  LineChart, 
  ShieldCheck,
  Bot
} from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const { mode, setMode, paperBalance } = useTradingStore();

  return (
    <header className="top-0 right-0 left-0 z-50 fixed flex justify-between items-center bg-[rgba(11,16,38,0.8)] backdrop-blur-md px-4 md:px-6 border-[var(--glass-border)] border-b h-16">
      
      {/* Left: Logo & Nav */}
      <div className="flex items-center gap-6">
        <Link href="/" className="group flex items-center gap-2">
          <div className="flex justify-center items-center bg-gradient-to-br from-[var(--cotton-pink)] to-[var(--cotton-blue)] shadow-[0_0_15px_rgba(169,222,249,0.3)] group-hover:shadow-[0_0_25px_rgba(255,153,200,0.5)] rounded-lg w-8 h-8 transition-all duration-300">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <span className="hidden md:block bg-clip-text bg-gradient-to-r from-[var(--cotton-blue)] to-[var(--cotton-pink)] font-bold text-transparent text-lg">
            Cotton Candy Bot
          </span>
        </Link>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link 
            href="/" 
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md font-medium text-sm transition-colors",
              pathname === "/" ? "bg-[var(--glass)] text-[var(--cotton-blue)]" : "text-gray-400 hover:text-white"
            )}
          >
            <Terminal size={16} />
            Terminal
          </Link>
          <Link 
            href="/strategies" 
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md font-medium text-sm transition-colors",
              pathname === "/strategies" ? "bg-[var(--glass)] text-[var(--cotton-pink)]" : "text-gray-400 hover:text-white"
            )}
          >
            <Activity size={16} />
            Strategies
          </Link>
          <Link 
            href="/wallet-lab" 
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md font-medium text-sm transition-colors",
              pathname === "/wallet-lab" ? "bg-[var(--glass)] text-[var(--cotton-blue)]" : "text-gray-400 hover:text-white"
            )}
          >
            <Wallet size={16} />
            Wallet Lab
          </Link>
        </nav>
      </div>

      {/* Center: Mode Toggles (Mobile Hidden ideally, or compact) */}
      <div className="hidden md:flex items-center bg-[rgba(0,0,0,0.3)] p-1 border border-[var(--glass-border)] rounded-full">
        <button
          onClick={() => setMode('PAPER')}
          className={cn(
            "px-4 py-1.5 rounded-full font-bold text-xs transition-all duration-300",
            mode === 'PAPER' 
              ? "bg-[var(--cotton-blue)] text-black shadow-[0_0_10px_rgba(169,222,249,0.4)]" 
              : "text-gray-400 hover:text-white"
          )}
        >
          PAPER
        </button>
        <button
          onClick={() => setMode('LIVE')}
          className={cn(
            "px-4 py-1.5 rounded-full font-bold text-xs transition-all duration-300",
            mode === 'LIVE' 
              ? "bg-[var(--cotton-pink)] text-black shadow-[0_0_10px_rgba(255,153,200,0.4)]" 
              : "text-gray-400 hover:text-white"
          )}
        >
          LIVE
        </button>
      </div>

      {/* Right: Wallet & Settings */}
      <div className="flex items-center gap-4">
        {mode === 'PAPER' && (
           <div className="hidden md:flex flex-col items-end mr-2">
             <span className="text-[10px] text-gray-400 uppercase tracking-wider">Paper Balance</span>
             <span className="font-mono font-bold text-[var(--cotton-blue)] text-sm">
               ${paperBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
             </span>
           </div>
        )}
        
        <WalletMultiButton className="!bg-[var(--glass)] hover:!bg-[rgba(255,255,255,0.1)] !px-4 !border !border-[var(--glass-border)] !rounded-lg !h-9 !font-sans !text-sm transition-all" />
        
        <button className="hover:bg-[var(--glass)] p-2 rounded-lg text-gray-400 hover:text-[var(--cotton-blue)] transition-colors">
          <Settings size={20} />
        </button>
        
        {/* Mobile Menu Toggle */}
        <button className="md:hidden p-2 text-gray-400">
            <Menu size={24} />
        </button>
      </div>
    </header>
  );
}
