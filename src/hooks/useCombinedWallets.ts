import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useTradingStore } from '@/store/useTradingStore';

export function useCombinedWallets() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const { botWallets } = useTradingStore();
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    let subscriptionId: number;

    const fetchBalance = async () => {
      if (publicKey) {
        try {
          const bal = await connection.getBalance(publicKey);
          setBalance(bal / LAMPORTS_PER_SOL);
        } catch (e) {
          console.error("Failed to fetch balance", e);
        }
      } else {
        setBalance(0);
      }
    };

    fetchBalance();

    if (publicKey) {
      subscriptionId = connection.onAccountChange(publicKey, (accountInfo) => {
        setBalance(accountInfo.lamports / LAMPORTS_PER_SOL);
      });
    }

    return () => {
      if (subscriptionId) {
        connection.removeAccountChangeListener(subscriptionId);
      }
    };
  }, [publicKey, connection]);

  const mainWallet = {
    publicKey: publicKey?.toBase58() || null,
    balance: balance,
    label: 'Main Wallet (Queen)',
    isConnected: !!publicKey
  };

  return {
    mainWallet,
    botWallets,
    // Helper to get total balance including bots
    totalBalance: balance + botWallets.reduce((acc: number, w: any) => acc + ((w.balance || 0) / LAMPORTS_PER_SOL), 0)
  };
}
