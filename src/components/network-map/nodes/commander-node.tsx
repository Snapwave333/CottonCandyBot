import { motion } from "framer-motion";
import { Shield, Zap } from "lucide-react";

export function CommanderNode({ data, x, y, delay = 0 }: { data: any, x: number, y: number, delay?: number }) {
  return (
    <motion.div
        className="absolute flex justify-center items-center w-24 h-24 pointer-events-auto"
        initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
        animate={{ x, y, opacity: 1, scale: 1 }}
        transition={{ type: "spring", damping: 12, stiffness: 100, delay: delay * 0.1 }}
    >
        <motion.div 
            className="group relative flex flex-col justify-center items-center bg-black/40 shadow-[0_0_15px_rgba(59,130,246,0.2)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] backdrop-blur-md border border-[var(--cotton-blue)]/50 hover:border-[var(--cotton-blue)] rounded-xl w-full h-full transition-all cursor-grab active:cursor-grabbing"
            whileHover={{ scale: 1.15, zIndex: 50 }}
            drag
            dragMomentum={false}
        >
            <div className="-top-2 -right-2 absolute bg-blue-900 px-1 border border-blue-400 rounded font-bold text-[8px] text-blue-200">
                SOLO
            </div>
            
            <Shield size={20} className="mb-2 text-[var(--cotton-blue)] group-hover:animate-pulse" />
            
            <div className="text-center">
                <div className="font-mono text-[9px] text-gray-400">{(data.publicKey || data.pubkey || '????').slice(0, 4)}...</div>
                <div className="font-bold text-white group-hover:text-blue-200 text-xs">{data.balance.toFixed(2)} SOL</div>
            </div>

            {/* Health Bar */}
            <div className="bottom-2 absolute bg-gray-800 rounded-full w-16 h-1 overflow-hidden">
                <div className="bg-[var(--cotton-blue)] w-[80%] h-full" />
            </div>
        </motion.div>
    </motion.div>
  );
}
