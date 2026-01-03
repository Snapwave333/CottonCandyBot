import React from 'react';
import { cn } from "@/lib/utils";
import { Zap, Shield, TrendingUp, AlertTriangle } from "lucide-react";

interface StrategyCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE';
  tags: string[];
  accentColor: string; // Hex or Tailwind class prefix for colors (e.g. "purple")
  onClick: () => void;
  isSelected?: boolean;
}

export const StrategyCard = React.memo(function StrategyCard({
  title,
  description,
  icon,
  riskLevel,
  tags,
  accentColor,
  onClick,
  isSelected
}: StrategyCardProps) {
  
  // Dynamic color mapping based on risk/type if not fully provided
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'HIGH': return 'bg-red-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'LOW': return 'bg-blue-500';
      case 'SAFE': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getBorderColor = (level: string) => {
    switch (level) {
      case 'HIGH': return 'border-red-500/50 group-hover:border-red-500';
      case 'MEDIUM': return 'border-yellow-500/50 group-hover:border-yellow-500';
      case 'LOW': return 'border-blue-500/50 group-hover:border-blue-500';
      case 'SAFE': return 'border-green-500/50 group-hover:border-green-500';
      default: return 'border-white/10';
    }
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex flex-col justify-between p-5 rounded-2xl w-full h-full text-left transition-all duration-300",
        // Heavy Glassmorphism
        "bg-white/5 backdrop-blur-xl border",
        getBorderColor(riskLevel),
        "hover:-translate-y-1 hover:shadow-xl",
        isSelected && "ring-2 ring-white ring-offset-2 ring-offset-black"
      )}
    >
      {/* Background gradient hint */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-tr opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity",
        riskLevel === 'HIGH' ? "from-red-500 to-transparent" :
        riskLevel === 'SAFE' ? "from-green-500 to-transparent" :
        "from-blue-500 to-transparent"
      )} />

      <div className="z-10 relative flex flex-col gap-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className={cn(
            "bg-black/30 backdrop-blur-md p-3 border border-white/10 rounded-xl",
            "group-hover:scale-110 transition-transform duration-300"
          )}>
            {icon}
          </div>
          <div className="flex flex-col items-end gap-1">
             <div className="flex gap-1 h-1.5">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className={cn(
                    "rounded-full w-3 h-full transition-all", 
                    // Risk Meter Logic
                    riskLevel === 'HIGH' ? (i <= 4 ? "bg-red-500" : "bg-red-900/30") :
                    riskLevel === 'MEDIUM' ? (i <= 3 ? "bg-yellow-500" : "bg-yellow-900/30") :
                    riskLevel === 'LOW' ? (i <= 2 ? "bg-blue-500" : "bg-blue-900/30") :
                    (i <= 1 ? "bg-green-500" : "bg-green-900/30")
                  )} />
                ))}
             </div>
             <span className={cn(
               "font-bold text-[10px] uppercase tracking-widest",
               riskLevel === 'HIGH' ? "text-red-400" :
               riskLevel === 'MEDIUM' ? "text-yellow-400" :
               riskLevel === 'LOW' ? "text-blue-400" : "text-green-400"
             )}>
               {riskLevel} RISK
             </span>
          </div>
        </div>

        {/* Content */}
        <div>
          <h4 className="mb-1 font-bold text-white group-hover:text-[var(--cotton-blue)] text-lg transition-colors">
            {title}
          </h4>
          <p className="min-h-[40px] font-medium text-gray-400 text-xs leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      {/* Footer / Tags */}
      <div className="z-10 relative flex flex-wrap gap-2 mt-4 pt-4 border-white/5 border-t">
        {tags.map(tag => (
           <span key={tag} className="bg-white/5 px-2 py-1 rounded text-[10px] text-gray-300 uppercase tracking-tight">
             {tag}
           </span>
        ))}
      </div>
    </button>
  );
});
