import { cn } from '@/lib/utils';

interface CyberSwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id?: string;
  label?: string;
}

export function CyberSwitch({ checked, onCheckedChange, id, label }: CyberSwitchProps) {
  return (
    <div 
      className="group flex justify-between items-center gap-4 bg-white/5 hover:bg-white/10 p-4 border border-white/5 rounded-xl transition-colors cursor-pointer"
      onClick={() => onCheckedChange(!checked)}
    >
      {label && <label htmlFor={id} className="font-medium text-gray-300 group-hover:text-white text-sm transition-colors cursor-pointer select-none">{label}</label>}
      
      <div
        className={cn(
          "relative flex items-center bg-black/50 px-1 border border-white/20 w-[44px] h-[24px] transition-colors",
          checked ? "bg-[var(--cotton-blue)]/20 border-[var(--cotton-blue)]" : ""
        )}
      >
        <div 
          className={cn(
            "bg-gray-500 shadow-sm w-[18px] h-[18px] transition-all duration-300",
            checked ? "translate-x-[20px] bg-[var(--cotton-blue)] shadow-[0_0_10px_var(--cotton-blue)]" : "translate-x-0"
          )}
        />
      </div>
    </div>
  );
}
