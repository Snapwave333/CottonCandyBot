'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SecurityContextType {
  isLocked: boolean;
  unlock: (password: string) => boolean;
  lock: () => void;
  sessionPassword: string | null;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export function SecurityProvider({ children }: { children: React.ReactNode }) {
  const [isLocked, setIsLocked] = useState(false);
  const [sessionPassword, setSessionPassword] = useState<string | null>('cotton-candy-default');

  const unlock = (password: string) => {
    // Simple validation for session start
    if (password.length < 4) return false;
    setSessionPassword(password);
    setIsLocked(false);
    return true;
  };

  const lock = () => {
    setSessionPassword(null);
    setIsLocked(true);
  };

  // Auto-lock on idle or page hide (Safety) - DISABLED by user request
  useEffect(() => {
    // Disabled
  }, []);

  return (
    <SecurityContext.Provider value={{ isLocked, unlock, lock, sessionPassword }}>
      {isLocked ? (
        <div className="z-[9999] fixed inset-0 flex flex-col justify-center items-center bg-black/90 backdrop-blur-xl">
          <div className="space-y-6 text-center">
            <div className="flex justify-center items-center shadow-[0_0_20px_rgba(236,72,153,0.3)] mx-auto border border-pink-500/50 rounded-full w-16 h-16 animate-pulse">
              <span className="text-2xl">🔒</span>
            </div>
            <div className="space-y-2">
              <h2 className="font-bold text-white text-2xl tracking-tighter">Vault Encrypted</h2>
              <p className="text-gray-400 text-sm">Enter your session password to unlock the Swarm.</p>
            </div>
            <input
              type="password"
              placeholder="Session Password"
              className="bg-white/5 px-4 py-3 border border-white/10 focus:border-pink-500 rounded-lg focus:outline-none w-64 text-white text-center transition-colors"
              onKeyDown={(e) => {
                if (e.key === 'Enter') unlock((e.target as HTMLInputElement).value);
              }}
              autoFocus
            />
            <div className="pt-4 text-[10px] text-gray-500 uppercase tracking-widest">
              Cotton Candy AES-256 Protected
            </div>
          </div>
        </div>
      ) : (
        children
      )}
    </SecurityContext.Provider>
  );
}

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) throw new Error('useSecurity must be used within SecurityProvider');
  return context;
};
