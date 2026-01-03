'use client';

import { useState, useEffect } from 'react';
import { useTickerStore } from '@/store/useTickerStore';
import { useTradingStore } from '@/store/useTradingStore';

// 1. HARDCODED FALLBACK (Guarantees the ticker never looks broken)
// Using real CoinGecko image URLs
const FALLBACK_TICKER = [
  { symbol: "SOL", price: "145.20", change24h: 4.5, id: "solana", image: "https://assets.coingecko.com/coins/images/4128/large/solana.png" },
  { symbol: "BONK", price: "0.000024", change24h: -2.1, id: "bonk", image: "https://assets.coingecko.com/coins/images/28600/large/bonk.png" },
  { symbol: "WIF", price: "3.40", change24h: 12.4, id: "dogwifhat", image: "https://assets.coingecko.com/coins/images/33587/large/dogwifhat.png" },
  { symbol: "JUP", price: "1.20", change24h: 1.2, id: "jupiter-exchange-solana", image: "https://assets.coingecko.com/coins/images/34188/large/jup.png" },
  { symbol: "POPCAT", price: "0.45", change24h: 8.9, id: "popcat", image: "https://assets.coingecko.com/coins/images/33719/large/popcat.png" },
  { symbol: "BOME", price: "0.012", change24h: -5.4, id: "book-of-meme", image: "https://assets.coingecko.com/coins/images/36109/large/bome.png" },
  { symbol: "MEW", price: "0.004", change24h: 15.2, id: "cat-in-a-dogs-world", image: "https://assets.coingecko.com/coins/images/36423/large/mew.png" },
  { symbol: "PYTH", price: "0.45", change24h: 0.5, id: "pyth-network", image: "https://assets.coingecko.com/coins/images/31924/large/pyth.png" },
];

export interface TickerItem {
  symbol: string;
  price: string;
  change24h: number;
  id: string;
  image: string;
}

export const useHybridTicker = () => {
  const [loading, setLoading] = useState(true);
  const { apiKey } = useTradingStore();

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        console.log("Fetching Ticker Data (Expanding to 250 assets)...");
        
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3021';
        // Fetch top 250 Solana ecosystem tokens via Backend Proxy
        const response = await fetch(`${API_URL}/api/market/ticker`, {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });

        if (!response.ok) {
          throw new Error(`Rate Limit or API Error: ${response.status}`);
        }

        const data = await response.json();

        // Transform Data with Icons (Using Proxy to bypass ORB/Hotlink protection)
        const formattedData = data.map((coin: any) => ({
          symbol: coin.symbol.toUpperCase(),
          price: coin.current_price < 1 
            ? coin.current_price.toFixed(6) 
            : coin.current_price.toFixed(2),
          change24h: coin.price_change_percentage_24h || 0,
          id: coin.id,
          image: coin.image // Pass raw URL, let TokenImage handle proxying
        }));

        if (formattedData.length > 0) {
          useTickerStore.getState().actions.setTickerData(formattedData);
        }
        
      } catch (error) {
        console.warn("Ticker API failed, using fallback with real assets:", error);
         // Ensure fallback is also pushed to store if fetch fails and store is empty
         if (useTickerStore.getState().tickerData.length === 0) {
             const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3021';
             // Also proxy fallback images - WAIT, let TokenImage do it.
             const proxiedFallback = FALLBACK_TICKER.map(item => ({
                 ...item,
                 // image: `${API_URL}/api/proxy/image?url=${encodeURIComponent(item.image)}`
                 image: item.image
             }));
            useTickerStore.getState().actions.setTickerData(proxiedFallback);
         }
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 60000);
    return () => clearInterval(interval);
  }, []);

  return { loading };
};
