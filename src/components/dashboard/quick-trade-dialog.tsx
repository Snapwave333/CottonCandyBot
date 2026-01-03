'use client';

import { useState, useEffect } from 'react';
import { useTickerStore } from '@/store/useTickerStore';
import { useTradingStore } from '@/store/useTradingStore';
import { TokenImage } from '@/components/ui/token-image';
import { X, Zap, ArrowRight, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function QuickTradeDialog() {
  const { selectedItem, actions: tickerActions } = useTickerStore();
  const { addStrategy } = useTradingStore();
  const [amount, setAmount] = useState(0.1);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (selectedItem) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [selectedItem]);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => tickerActions.setSelectedItem(null), 300); // clear after anim
  };

  const handleSnipe = () => {
    if (!selectedItem) return;

    addStrategy({
      id: crypto.randomUUID(),
      type: 'SNIPER',
      status: 'RUNNING',
      config: {
        targetToken: selectedItem.symbol.toUpperCase(), 
        amountInSol: amount
      },
      logs: [],
      createdAt: Date.now()
    });
    handleClose();
  };

  if (!isOpen || !selectedItem) return null;

  return (
    <AnimatePresence>
      <div className="z-[100] fixed inset-0 flex justify-center items-center bg-black/60 backdrop-blur-sm p-4">
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-black/90 shadow-[0_0_50px_rgba(236,72,153,0.1)] border border-[var(--cotton-pink)]/30 rounded-2xl w-full max-w-md overflow-hidden"
        >
            {/* Header */}
            <div className="relative flex justify-between items-start bg-gradient-to-b from-[var(--cotton-pink)]/10 to-transparent p-6 h-24">
                <div className="flex items-center gap-4">
                     <TokenImage src={selectedItem.image} alt={selectedItem.symbol} size={48} className="shadow-lg border-[var(--cotton-pink)]/50 border-2 rounded-full" />
                     <div>
                        <h2 className="font-bold text-white text-2xl tracking-tight">{selectedItem.symbol.toUpperCase()}</h2>
                        <div className="font-mono text-[var(--cotton-pink)] text-sm">${selectedItem.price}</div>
                     </div>
                </div>
                <button onClick={handleClose} className="text-gray-400 hover:text-white transition-colors">
                    <X size={20} />
                </button>
            </div>

            {/* Body */}
            <div className="space-y-6 p-6">
                
                <div className="space-y-2">
                    <label className="font-mono text-gray-400 text-xs uppercase">Amount (SOL)</label>
                    <div className="group relative">
                        <DollarSign size={16} className="top-1/2 left-3 absolute text-gray-500 group-focus-within:text-[var(--cotton-pink)] transition-colors -translate-y-1/2" />
                        <input 
                            type="number" 
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            className="bg-white/5 py-3 pr-4 pl-10 border border-white/10 focus:border-[var(--cotton-pink)] rounded-xl focus:outline-none w-full font-mono text-white transition-colors"
                        />
                    </div>
                </div>

                <div className="bg-[var(--cotton-pink)]/5 p-4 border border-[var(--cotton-pink)]/20 rounded-xl">
                    <div className="flex items-center gap-2 mb-1 font-bold text-[var(--cotton-pink)] text-sm">
                        <Zap size={14} />
                        <span>Ready to Snipe?</span>
                    </div>
                    <p className="text-gray-400 text-xs leading-relaxed">
                        This will spawn a new <strong>Sniper Strategy</strong> targeting 
                        <span className="mx-1 font-mono text-white">{selectedItem.symbol.toUpperCase()}</span> 
                        for <strong>{amount} SOL</strong>.
                    </p>
                </div>

                <button 
                    onClick={handleSnipe}
                    className="group flex justify-center items-center gap-2 bg-[var(--cotton-pink)] hover:bg-[var(--cotton-pink)]/90 py-4 rounded-xl w-full font-bold text-black transition-all"
                >
                    <span>Confirm Snipe</span>
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </button>
            </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
