import React from 'react';
import { cn } from "@/lib/utils";
import { Radar, Activity } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  className?: string;
  icon?: React.ReactNode;
}

export function EmptyState({ 
  title = "Waiting for Signal...", 
  description = "Scanning market data streams", 
  className,
  icon
}: EmptyStateProps) {
  return (
    <div className={cn("relative flex flex-col justify-center items-center rounded-lg w-full h-full overflow-hidden", className)}>
      {/* Background Grid - Faint */}
      <div className="absolute inset-0 opacity-[0.03]" 
           style={{ 
             backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', 
             backgroundSize: '20px 20px' 
           }} 
      />
      
      {/* Radar Pulse Animation */}
      <div className="relative flex justify-center items-center mb-3 text-[var(--cotton-blue)]">
        <div className="absolute bg-[var(--cotton-blue)] opacity-10 rounded-full w-24 h-24 animate-ping" />
        <div className="absolute bg-[var(--cotton-blue)] opacity-20 rounded-full w-16 h-16 animate-pulse" />
        <div className="z-10 bg-black/20 backdrop-blur-sm p-3 border border-white/10 rounded-full ring-1 ring-white/5">
           {icon || <Activity size={24} className="opacity-80" />}
        </div>
      </div>

      <div className="z-10 flex flex-col items-center space-y-1 text-center">
        <span className="font-bold text-white/60 text-xs uppercase tracking-widest animate-pulse">
            {title}
        </span>
        <span className="max-w-[180px] font-mono text-[10px] text-white/30 truncate">
            {description}
        </span>
      </div>
    </div>
  );
}
