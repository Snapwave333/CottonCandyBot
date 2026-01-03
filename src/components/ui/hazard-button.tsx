import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, Loader2 } from "lucide-react";

interface HazardButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onAction: () => void;
  label?: string;
  icon?: React.ReactNode;
  holdDuration?: number; // ms, default 1500
}

export function HazardButton({ 
  onAction, 
  label = "Danger Action", 
  icon, 
  holdDuration = 1500,
  className,
  ...props 
}: HazardButtonProps) {
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const startHold = () => {
    if (props.disabled) return;
    setIsHolding(true);
    startTimeRef.current = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - (startTimeRef.current || 0);
      const newProgress = Math.min((elapsed / holdDuration) * 100, 100);
      setProgress(newProgress);
      
      if (newProgress < 100) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Complete
        onAction();
        resetHold();
      }
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const resetHold = () => {
    setIsHolding(false);
    setProgress(0);
    startTimeRef.current = null;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  return (
    <button
      onMouseDown={startHold}
      onMouseUp={resetHold}
      onMouseLeave={resetHold}
      onTouchStart={startHold}
      onTouchEnd={resetHold}
      className={cn(
        "relative flex justify-center items-center gap-2 overflow-hidden transition-all select-none",
        // Hazard Stripes Background
        "bg-[repeating-linear-gradient(45deg,rgba(0,0,0,0)_0px,rgba(0,0,0,0)_10px,rgba(239,68,68,0.1)_10px,rgba(239,68,68,0.1)_20px)]",
        "bg-black/40 hover:bg-black/60 border border-red-500/20 hover:border-red-500/50",
        "text-red-400 font-bold text-xs uppercase tracking-wider",
        "active:scale-95",
        className
      )}
      {...props}
    >
      {/* Progress Fill */}
      <div 
        className="top-0 left-0 absolute bg-red-500/20 h-full transition-all duration-75 ease-linear"
        style={{ width: `${progress}%` }}
      />
      
      {/* Content */}
      <div className="z-10 relative flex items-center gap-2">
         {isHolding && progress < 100 ? (
           <span className="animate-pulse">HOLD TO CONFIRM...</span>
         ) : (
           <>
             {icon || <AlertTriangle size={16} />}
             {label}
           </>
         )}
      </div>
    </button>
  );
}
