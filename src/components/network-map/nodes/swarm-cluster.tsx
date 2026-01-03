import { motion } from "framer-motion";
import { Grid, Hexagon } from "lucide-react";

export function SwarmCluster({ count, x, y, label }: { count: number, x: number, y: number, label: string }) {
  return (
    <motion.div
        className="absolute flex flex-col items-center pointer-events-auto"
        initial={{ x: 0, y: 0, opacity: 0 }}
        animate={{ x, y, opacity: 1 }}
        transition={{ duration: 1, type: "spring" }}
        whileHover={{ scale: 1.1 }}
    >
        {/* Cloud Container */}
        <div className="relative flex justify-center items-center w-28 h-28">
            {/* Spinning Rings */}
            <div className="absolute inset-0 border border-[var(--cotton-pink)]/20 border-t-transparent rounded-full animate-spin-slow [animation-duration:8s]" />
            <div className="absolute inset-4 border border-[var(--cotton-pink)]/40 border-b-transparent rounded-full animate-reverse-spin [animation-duration:12s]" />
            
            {/* Core */}
            <div className="group flex justify-center items-center bg-[var(--cotton-pink)]/10 hover:bg-[var(--cotton-pink)]/20 shadow-[0_0_20px_rgba(236,72,153,0.2)] backdrop-blur-xl border border-[var(--cotton-pink)]/50 rounded-full w-16 h-16 transition-colors">
                <div className="text-center">
                    <Grid size={18} className="mx-auto mb-1 text-[var(--cotton-pink)] animate-pulse" />
                    <span className="block font-bold text-white text-lg leading-none">{count}</span>
                    <span className="font-bold text-[8px] text-[var(--cotton-pink)] uppercase tracking-wider">Drones</span>
                </div>
            </div>

            {/* Orbiting particles (Pure CSS or small divs) */}
            {[...Array(3)].map((_, i) => (
                <div key={i} className="absolute bg-[var(--cotton-pink)] rounded-full w-1.5 h-1.5 animate-ping" 
                     style={{ 
                         top: `${50 + 40 * Math.sin(i * 2)}%`, 
                         left: `${50 + 40 * Math.cos(i * 2)}%`,
                         animationDelay: `${i * 0.5}s`,
                         opacity: 0.6
                     }} 
                />
            ))}
        </div>
        
        {/* Label */}
        <div className="bg-black/50 backdrop-blur mt-2 px-3 py-1 border border-white/10 border-l-[var(--cotton-pink)] border-l-2 rounded-full font-mono text-[10px] text-gray-300">
            CLUSTER: {label}
        </div>
    </motion.div>
  );
}
