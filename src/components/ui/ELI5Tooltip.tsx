"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ELI5TooltipProps {
  description: string;
  example?: string;
  children?: React.ReactNode;
}

export function ELI5Tooltip({ description, example, children }: ELI5TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top - 10, // 10px spacing above
        left: rect.left + rect.width / 2, // Center align
      });
      setIsVisible(true);
    }
  };

  return (
    <>
      <div 
        ref={triggerRef}
        className="inline-flex relative items-center gap-1 cursor-help"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
        <Info size={14} className="text-gray-400 group-hover:text-[var(--cotton-blue)] transition-colors" />
      </div>

      {isVisible && createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{ 
                top: coords.top, 
                left: coords.left,
                position: 'fixed',
                transform: 'translate(-50%, -100%)', // Center horizontally, move up by 100% of own height
                zIndex: 9999,
                pointerEvents: 'none'
            }}
          >
            <div className="bg-[#0B1026] shadow-[0_10px_30px_rgba(0,0,0,0.5)] p-4 border border-white/10 rounded-xl min-w-[200px] max-w-xs glass">
              <div className="space-y-2">
                <p className="font-medium text-gray-200 text-sm">{description}</p>
                {example && (
                  <div className="bg-white/5 p-2 border border-white/5 rounded text-[11px] text-gray-400 italic">
                    <span className="block opacity-50 not-italic uppercase tracking-tighter">Pro Tip:</span>
                    {example}
                  </div>
                )}
              </div>
              {/* Tooltip Arrow */}
              <div className="bottom-0 left-1/2 absolute border-white/10 border-r border-b w-2.5 h-2.5 rotate-45 -translate-x-1/2 translate-y-1/2 glass" />
            </div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
