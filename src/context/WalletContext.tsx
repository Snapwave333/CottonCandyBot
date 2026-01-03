'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, LAMPORTS_PER_SOL, SystemProgram, Transaction } from '@solana/web3.js';
import { useTradingStore } from '@/store/useTradingStore';

interface BotWallet {
  publicKey: string | null;
  balance: number;
  label: string;
  isPaper: boolean;
}

interface WalletContextType {
  botWallets: BotWallet[];
  refreshWallets: () => Promise<void>;
  transferToBot: (amount: number, targetAddress: string) => Promise<string>;
  transferToMain: (amount: number, botAddress: string) => Promise<string>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const { botWallets, syncWithBackend, initSocket, setLiveBalance } = useTradingStore();
  const [swarmCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Initial sync
    syncWithBackend();
    initSocket();
  }, [syncWithBackend, initSocket]);

  useEffect(() => {
    if (!publicKey) {
      setLiveBalance(0);
      return;
    }

    // Immediate fetch
    const fetchBalance = async () => {
      try {
        const bal = await connection.getBalance(publicKey);
        setLiveBalance(bal / LAMPORTS_PER_SOL);
      } catch (err) {
        console.warn('Failed to fetch balance (likely RPC rate limit):', err);
        // Do not crash, just keep previous balance or 0
      }
    };
    fetchBalance();

    // Listen for changes
    try {
      const subId = connection.onAccountChange(publicKey, (account) => {
        setLiveBalance(account.lamports / LAMPORTS_PER_SOL);
      }, 'confirmed');

      return () => {
        connection.removeAccountChangeListener(subId);
      };
    } catch (err) {
       console.warn('Failed to subscribe to account changes:', err);
    }
  }, [publicKey, connection, setLiveBalance]);

  const transferToBot = async (amount: number, targetAddress: string): Promise<string> => {
    if (!publicKey) throw new Error('Wallet not connected');
    
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: new PublicKey(targetAddress),
        lamports: amount * LAMPORTS_PER_SOL,
      })
    );

    const signature = await sendTransaction(transaction, connection);
      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
      });
    await syncWithBackend();
    return signature;
  };

  const transferToMain = async (amount: number, botAddress: string): Promise<string> => {
    // This calls the backend to initiate a transfer from the server-side wallet
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3021';
    try {
      const res = await fetch(`${API_URL}/api/wallet/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          botAddress,
          destination: publicKey?.toBase58(),
          amount: amount
        })
      });
      const data = await res.json();
      await syncWithBackend();
      return data.signature;
    } catch (e) {
      console.error('Withdrawal failed:', e);
      throw e;
    }
  };

  return (
    <WalletContext.Provider value={{
      botWallets,
      refreshWallets: syncWithBackend,
      transferToBot,
      transferToMain
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useCombinedWallets() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useCombinedWallets must be used within a WalletProvider');
  }
  return context;
}
