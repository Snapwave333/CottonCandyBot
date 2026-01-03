"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="z-[100] fixed inset-0 flex justify-center items-center bg-black overflow-hidden"
        >
          <div className="relative">
            {/* Elegant Fizz Background Effect */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: [0.8, 1.5, 1.2],
                opacity: [0, 0.3, 0.15],
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -inset-20 bg-gradient-to-br from-pink-500/20 to-cyan-500/20 blur-[80px] rounded-full"
            />
            
            <motion.div
              initial={{ scale: 0.7, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ 
                delay: 0.2,
                duration: 1,
                type: "spring",
                stiffness: 80,
                damping: 15
              }}
              className="relative flex flex-col items-center gap-8"
            >
              <div className="relative w-40 md:w-56 h-40 md:h-56">
                <motion.img
                  src="/assets/branding/logo.png"
                  alt="CottonCandyBot Logo"
                  className="drop-shadow-[0_0_30px_rgba(236,72,153,0.4)] w-full h-full object-contain"
                  animate={{
                    y: [0, -12, 0],
                    rotate: [0, 3, -3, 0],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                {/* Elegant Fizz particles */}
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 40, x: 0 }}
                    animate={{ 
                      opacity: [0, 1, 0],
                      y: [-40, -180 - Math.random() * 100],
                      x: [(Math.random() - 0.5) * 40, (Math.random() - 0.5) * 120],
                      scale: [0, Math.random() * 1.5 + 0.5, 0]
                    }}
                    transition={{
                      duration: 2 + Math.random() * 2,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                    className="bottom-10 left-1/2 absolute bg-gradient-to-t from-pink-400 to-cyan-400 blur-[0.5px] rounded-full w-1.5 h-1.5 pointer-events-none"
                  />
                ))}
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="flex flex-col items-center text-center"
              >
                <div className="flex items-baseline gap-2">
                  <span className="font-black text-white text-4xl md:text-6xl italic uppercase tracking-tighter">
                    Cotton Candy
                  </span>
                  <span className="font-black text-pink-500 text-4xl md:text-6xl italic uppercase tracking-tighter">
                    Bot
                  </span>
                </div>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 1.2, duration: 1 }}
                  className="bg-gradient-to-r from-transparent via-pink-500/50 to-transparent mt-4 mb-3 w-64 md:w-96 h-px"
                />
                <p className="font-mono text-[10px] text-gray-500 md:text-xs uppercase tracking-[0.4em]">
                  Precision <span className="text-pink-500/50">•</span> Speed <span className="text-pink-500/50">•</span> Sweetness
                </p>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
