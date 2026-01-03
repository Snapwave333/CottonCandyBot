'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, ArrowUp, ArrowDown } from 'lucide-react';
import { useTickerStore } from '@/store/useTickerStore';
import { useHybridTicker, TickerItem } from '@/hooks/useHybridTicker';
import { TokenImage } from '@/components/ui/token-image';

export function NewsTicker() {
  useHybridTicker(); // Initialize fetcher
  const tickerData = useTickerStore(state => state.tickerData);

  // Duplicate list for infinite scroll effect
  const displayItems = [...tickerData, ...tickerData];

  return (
    <div className="bottom-0 left-0 z-50 fixed flex items-center bg-black/80 backdrop-blur-md border-white/10 border-t w-full h-8 overflow-hidden">
        {/* Label */}
        <div className="z-10 flex items-center bg-[var(--cotton-pink)]/20 px-3 border-white/10 border-r h-full whitespace-nowrap pointer-events-none">
            <Zap className="mr-2 w-3 h-3 text-[var(--cotton-pink)] animate-pulse" />
            <span className="font-bold text-[10px] text-[var(--cotton-pink)] uppercase tracking-wider">Live Feed</span>
        </div>

        {/* Marquee Container */}
        <div className="relative flex flex-1 items-center overflow-hidden cursor-pointer">
            <motion.div 
                className="flex items-center gap-12 min-w-full whitespace-nowrap"
                animate={{ x: "-50%" }}
                transition={{ 
                    repeat: Infinity, 
                    ease: "linear", 
                    duration: Math.max(30, tickerData.length * 0.8) 
                }}
                whileHover={{ animationPlayState: "paused" }}
            >
                {displayItems.map((item, index) => (
                    <TickerItemCard key={`${item.id}-${index}`} item={item} />
                ))}
            </motion.div>
        </div>
    </div>
  );
}

const TickerItemCard = React.memo(({ item }: { readonly item: TickerItem }) => {
    const { actions } = useTickerStore();
    if (!item) return null;
    const isUp = (item.change24h || 0) >= 0;
    
    return (
        <button 
            onClick={() => actions.setSelectedItem(item)}
            className="group flex items-center gap-3 hover:bg-white/5 px-2 py-1 rounded font-mono text-[10px] transition-colors"
        >
            <TokenImage 
              src={item.image} 
              alt={item.symbol} 
              className="grayscale-[0.5] group-hover:grayscale-0 border border-white/10 rounded-full w-4 h-4 transition-all"
              size={16}
            />
            <span className="font-bold text-white/90 group-hover:text-[var(--cotton-pink)] transition-colors">{item.symbol}</span>
            <span className={isUp ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                ${item.price}
            </span>
            <div className={`flex items-center gap-0.5 ${isUp ? 'text-green-500' : 'text-red-500'}`}>
                {isUp ? <ArrowUp size={8} /> : <ArrowDown size={8} /> }
                <span>{Math.abs(item.change24h).toFixed(1)}%</span>
            </div>
        </button>
    );
});
TickerItemCard.displayName = 'TickerItemCard';
