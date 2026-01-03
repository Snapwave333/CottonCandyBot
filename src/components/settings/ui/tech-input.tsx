import React, { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface TechInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  saved?: boolean;
}

export const TechInput = React.forwardRef<HTMLInputElement, TechInputProps>(
  ({ className, label, saved, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="block mb-2 font-bold text-[10px] text-[var(--cotton-blue)] uppercase tracking-widest">{label}</label>}
        <div className="group relative">
            <input
            ref={ref}
            className={cn(
                "bg-black/40 px-4 py-3 border border-white/10 rounded-lg outline-none w-full text-white placeholder:text-gray-600 text-sm transition-all",
                "focus:border-[var(--cotton-blue)] focus:shadow-[0_0_15px_-5px_var(--cotton-blue)] focus:bg-black/60",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                className
            )}
            {...props}
            />
            {saved && (
                <div className="top-1/2 right-3 absolute flex items-center gap-1 slide-in-from-left-2 text-green-400 -translate-y-1/2 animate-in fade-in">
                    <Check size={14} />
                    <span className="text-[10px] uppercase">Saved</span>
                </div>
            )}
        </div>
      </div>
    );
  }
);
TechInput.displayName = "TechInput";
