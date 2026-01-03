import { motion } from "framer-motion";
import { Crown, Wallet } from "lucide-react";

export function QueenNode({ balance, onInteract }: { balance: number, onInteract?: () => void }) {
  return (
    <motion.div
      layoutId="queen-node"
      className="group z-30 relative flex justify-center items-center w-32 h-32 cursor-pointer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      onTap={onInteract}
      drag
      dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
    >
      {/* Hexagon Shape - CSS Clip Path or SVG */}
      <div className="absolute inset-0 group-hover:bg-yellow-500/30 bg-gradient-to-br from-yellow-500/20 to-orange-600/20 shadow-[0_0_30px_rgba(234,179,8,0.3)] backdrop-blur-xl border-2 border-yellow-500/50 group-hover:border-yellow-400 transition-colors animate-pulse-slow [clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)]" />
      
      {/* Inner Rotating Ring */}
      <div className="absolute inset-2 border border-yellow-500/30 border-dashed rounded-full animate-spin-slow [animation-duration:10s]" />
      
      <div className="z-10 flex flex-col items-center text-yellow-100">
        <Crown size={24} className="drop-shadow-[0_0_10px_rgba(250,204,21,0.8)] mb-1 text-yellow-400" />
        <span className="opacity-80 font-bold text-[10px] uppercase tracking-widest">Main</span>
        <span className="shadow-black drop-shadow-md font-mono font-bold text-sm">{balance.toFixed(2)} SOL</span>
      </div>

      {/* Connection Anchor Points (Visual Only) */}
      <div className="absolute -inset-4 border border-yellow-500/10 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500" />
    </motion.div>
  );
}
