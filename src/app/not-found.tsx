import Link from 'next/link';
import { Home, Ghost } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NotFound() {
  return (
    <div className="relative flex flex-col justify-center items-center bg-black min-h-screen overflow-hidden text-white">
      {/* Ambient Background Effects */}
      <div className="top-1/4 left-1/4 absolute bg-[var(--cotton-pink)] opacity-20 blur-[120px] rounded-full w-96 h-96 animate-pulse pointer-events-none" />
      <div className="right-1/4 bottom-1/4 absolute bg-[var(--cotton-blue)] opacity-20 blur-[120px] rounded-full w-96 h-96 animate-pulse delay-700 pointer-events-none" />

      <div className="z-10 relative flex flex-col items-center gap-6 shadow-2xl backdrop-blur-xl p-12 border border-[var(--glass-border)] rounded-2xl max-w-md text-center glass">
        
        {/* Animated Icon */}
        <div className="bg-white/5 shadow-lg p-6 rounded-full ring-[var(--glass-border)] ring-1 animate-bounce">
          <Ghost size={64} className="opacity-90 text-[var(--cotton-pink)]" />
        </div>

        <div className="space-y-2">
          <h1 className="bg-clip-text bg-gradient-to-r from-[var(--cotton-pink)] to-[var(--cotton-blue)] font-black text-transparent text-8xl tracking-tighter select-none">
            404
          </h1>
          <h2 className="font-bold text-white text-2xl">Lost in the Void</h2>
          <p className="text-gray-400">
            The page you're looking for has dissolved like cotton candy in the rain.
          </p>
        </div>

        <Link 
          href="/" 
          className={cn(
            "group flex items-center gap-2 bg-gradient-to-r from-[var(--cotton-pink)] to-[var(--cotton-blue)]",
            "px-6 py-3 rounded-xl font-bold text-white shadow-lg",
            "hover:opacity-90 transition-all hover:scale-105 active:scale-95",
            "hover:shadow-[0_0_20px_rgba(255,153,200,0.4)]"
          )}
        >
          <Home size={18} />
          <span>Return to Command</span>
        </Link>
      </div>

      <div className="bottom-8 absolute px-4 py-2 rounded-full text-gray-600 text-xs text-center glass">
        ERR_SWEET_NOT_FOUND • SYSTEM ID: COTTON-CANDY-TERMINAL
      </div>
    </div>
  );
}
