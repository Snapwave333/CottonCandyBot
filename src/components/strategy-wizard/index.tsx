import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { X, ChevronRight, Check } from "lucide-react";
import { LiveTerminal } from "./live-terminal";
import { StepTrigger, StepSafety, StepExecution, StepExit } from "./steps";

// Animation variants could go here if using Framer, but sticking to Tailwind transitions for now

export function StrategyWizardModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({
      trigger: '',
      verifyMint: true,
      requireLpBurn: true,
      rejectBundles: false,
      freezeCheck: true,
      slippage: 1.0,
      priority: 'standard',
      useJito: false,
      stopLoss: 30,
      takeProfit: 100 // Default 2x (100% gain)
  });

  const updateConfig = useCallback((key: string, value: any) => {
      setConfig(prev => ({ ...prev, [key]: value }));
  }, []);

  if (!isOpen) return null;

  return (
    <div className="z-50 fixed inset-0 flex justify-center items-center p-4 sm:p-8">
        {/* Backdrop (Glassy) */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in duration-300 fade-in"
          onClick={onClose}
        />

        {/* Modal Container */}
        <div className="relative flex bg-black/40 shadow-[0_0_50px_-10px_rgba(236,72,153,0.3)] backdrop-blur-2xl border border-white/10 rounded-3xl w-full max-w-5xl h-[600px] overflow-hidden animate-in duration-300 zoom-in-95">
            
            {/* The Neon Rim - Animated Border via pseudo or utility */}
            <div className="absolute inset-0 opacity-50 border border-transparent rounded-3xl pointer-events-none [background:linear-gradient(45deg,rgba(236,72,153,0.3),rgba(99,102,241,0.3))_border-box] [mask:linear-gradient(#fff_0_0)_padding-box,linear-gradient(#fff_0_0)] [-webkit-mask-composite:xor]" />

            {/* Left Content Area (70%) */}
            <div className="z-10 relative flex flex-col w-[70%]">
                {/* Header covering full width of left panel */}
                <div className="flex justify-between items-center px-8 border-white/5 border-b h-20">
                    <h2 className="flex items-center gap-3 font-bold text-white text-xl uppercase tracking-tight">
                        <span className="bg-[var(--cotton-pink)] shadow-[0_0_15px_var(--cotton-pink)] rounded-full w-2 h-8" />
                        Strategy Configurator
                    </h2>
                    
                    {/* Progress Tracker */}
                    <div className="flex items-center gap-2">
                        {[1,2,3,4].map(s => (
                            <div key={s} className={cn(
                                "rounded-full w-8 h-1 transition-all duration-500",
                                step >= s ? "bg-[var(--cotton-pink)] shadow-[0_0_10px_var(--cotton-pink)]" : "bg-white/10"
                            )} />
                        ))}
                    </div>
                </div>

                {/* Step Content */}
                <div className="flex-1 p-8 overflow-y-auto">
                    {step === 1 && <StepTrigger value={config.trigger} onChange={v => updateConfig('trigger', v)} />}
                    {step === 2 && <StepSafety config={config} onChange={updateConfig} />}
                    {step === 3 && <StepExecution config={config} onChange={updateConfig} />}
                    {step === 4 && <StepExit config={config} onChange={updateConfig} />}
                </div>

                {/* Footer Controls */}
                <div className="flex justify-between items-center bg-black/20 px-8 border-white/5 border-t h-20">
                    <button 
                        onClick={step === 1 ? onClose : () => setStep(s => s - 1)}
                        className="font-bold text-gray-500 hover:text-white text-sm uppercase transition-colors"
                    >
                        {step === 1 ? 'Cancel' : 'Back'}
                    </button>

                    <button 
                        onClick={() => step < 4 ? setStep(s => s + 1) : onClose()}
                        disabled={step === 1 && !config.trigger}
                        className={cn(
                            "flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm uppercase transition-all",
                            step === 1 && !config.trigger 
                                ? "bg-white/5 text-gray-600 cursor-not-allowed"
                                : "bg-[var(--cotton-pink)] text-black hover:bg-white hover:shadow-[0_0_20px_white]"
                        )}
                    >
                        {step === 4 ? 'Deploy Strategy' : 'Continue'}
                        {step === 4 ? <Check size={16} /> : <ChevronRight size={16} />}
                    </button>
                </div>
            </div>

            {/* Right Sidebar (Live Terminal) (30%) */}
            <div className="z-10 relative w-[30%]">
                <LiveTerminal config={config} />
            </div>

            {/* Close Button Absolute */}
            <button 
                onClick={onClose}
                className="top-4 right-4 z-50 absolute bg-black/20 hover:bg-red-500/20 p-2 rounded-lg text-gray-500 hover:text-white transition-colors"
            >
                <X size={20} />
            </button>
        </div>
    </div>
  );
}
