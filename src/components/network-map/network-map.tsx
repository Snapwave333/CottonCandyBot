import { useRef, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTradingStore } from "@/store/useTradingStore";
import { useCombinedWallets } from '@/hooks/useCombinedWallets';
import { QueenNode } from "./nodes/queen-node";
import { CommanderNode } from "./nodes/commander-node";
import { SwarmCluster } from "./nodes/swarm-cluster";
import { HeadsUpDisplay } from "./hud/heads-up-display";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

interface NodePosition {
  id: string;
  x: number;
  y: number;
  type: 'COMMANDER' | 'SWARM';
  data?: any;
}

export function NetworkMap() {
    const { botWallets, createBotWallet, swarmConfig, organizeSwarm } = useTradingStore();
    const { mainWallet } = useCombinedWallets();
    const containerRef = useRef<HTMLDivElement>(null);

    // Calculate Map Dimensions (Mocked for generic container, can use useResizeObserver for precision)
    const CENTER_X = 400; // Relative center of map container
    const CENTER_Y = 300; 

    // --- ORBITAL LAYOUT ENGINE ---
    const layout = useMemo(() => {
        const nodes: NodePosition[] = [];
        const safeWallets = Array.isArray(botWallets) ? botWallets : [];
        
        // 1. Identify Commanders and Swarms
        const commanders = safeWallets.filter(w => (w.balance || 0) / LAMPORTS_PER_SOL >= 5);
        const swarms = safeWallets.filter(w => (w.balance || 0) / LAMPORTS_PER_SOL < 5);

        // 2. Position Commanders (Inner Orbit)
        const C_RADIUS = 220;
        commanders.forEach((w, i) => {
            const angle = (i / commanders.length) * 2 * Math.PI;
            nodes.push({
                id: w.publicKey,
                x: Math.cos(angle) * C_RADIUS,
                y: Math.sin(angle) * C_RADIUS,
                type: 'COMMANDER',
                data: { ...w, balance: (w.balance || 0) / LAMPORTS_PER_SOL }
            });
        });

        // 3. Position Swarm Clusters (Outer Clouds)
        // Group by pseudo-clusters (Mock strategy grouping)
        const clusters = [
            { id: 'cluster-alpha', label: 'Sniper Squad', count: swarms.filter((_, i) => i % 2 === 0).length },
            { id: 'cluster-beta', label: 'DCA Drones', count: swarms.filter((_, i) => i % 2 !== 0).length },
        ].filter(c => c.count > 0);

        const S_RADIUS = 380;
        clusters.forEach((c, i) => {
             // Offset angle to not overlap with commanders too perfectly
             const angle = ((i / clusters.length) * 2 * Math.PI) + (Math.PI / 4);
             nodes.push({
                 id: c.id,
                 x: Math.cos(angle) * S_RADIUS,
                 y: Math.sin(angle) * S_RADIUS,
                 type: 'SWARM',
                 data: c
             });
        });

        return nodes;
    }, [botWallets]);

    const safeWallets = Array.isArray(botWallets) ? botWallets : [];
    const totalBalance = (mainWallet?.balance || 0) + safeWallets.reduce((acc, w) => acc + ((w.balance || 0) / LAMPORTS_PER_SOL), 0);

    return (
        <div className="group relative bg-black/20 backdrop-blur-sm border border-white/5 rounded-3xl w-full h-[800px] overflow-hidden select-none" ref={containerRef}>
            
            {/* Background Grid Lines (Tactical Map Effect) */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <svg width="100%" height="100%">
                    <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                        <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                    
                    {/* Connection Lines from Center to Nodes */}
                    <g className="translate-x-[50%] translate-y-[50%]">
                        {layout.map((node) => (
                            <motion.line 
                                key={`link-${node.id}`}
                                x1={0} y1={0} x2={node.x} y2={node.y}
                                stroke={node.type === 'COMMANDER' ? 'rgba(59,130,246,0.2)' : 'rgba(236,72,153,0.2)'}
                                strokeWidth="1"
                                strokeDasharray={node.type === 'SWARM' ? "5,5" : "0"}
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 1.5, ease: "easeInOut" }}
                            />
                        ))}
                    </g>
                </svg>
            </div>

            {/* --- NODES LAYER --- */}
            {/* Centered Group using CSS Transform to 50% 50% */}
            <div className="top-1/2 left-1/2 absolute flex justify-center items-center w-0 h-0 -translate-x-1/2 -translate-y-1/2">
                
                {/* 1. THE QUEEN */}
                <QueenNode balance={mainWallet?.balance || 0} />

                {/* 2. ORBITAL NODES */}
                <AnimatePresence>
                    {layout.map((node, i) => (
                        <div key={node.id} className="top-0 left-0 absolute w-0 h-0">
                            {node.type === 'COMMANDER' ? (
                                <CommanderNode 
                                    data={node.data} 
                                    x={node.x} 
                                    y={node.y} 
                                    delay={i} 
                                />
                            ) : (
                                <SwarmCluster 
                                    count={node.data.count} 
                                    x={node.x} 
                                    y={node.y} 
                                    label={node.data.label} 
                                />
                            )}
                        </div>
                    ))}
                </AnimatePresence>
            </div>

            {/* --- HUD OVERLAY --- */}
            <HeadsUpDisplay 
                stats={{ 
                    totalSol: totalBalance, 
                    activeNodes: (Array.isArray(botWallets) ? botWallets.length : 0) + 1
                }}
                onAutoSort={() => organizeSwarm()}
                actions={{
                    onDeploy: () => {
                         const password = window.prompt("Enter session password:");
                         if (password) createBotWallet(password);
                    },
                    onPanic: () => console.log("PANIC!")
                }}
            />
        </div>
    );
}
