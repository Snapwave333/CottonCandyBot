const CACHE = {
  data: [],
  lastFetch: 0,
  TTL: 60000 // 60 Seconds
};

// Fallback list of major tokens if CoinGecko is busy
const FALLBACK_TOKENS = [
    'So11111111111111111111111111111111111111112', // SOL
    'JUPyiwrYJFskUPiHa7hkeR8VUtkPHCLkh5FZnPfryoo', // JUP
    'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', // BONK
    'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', // WIF
    '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYkW2hr', // POPCAT
    'CloudNy1LmqPPoMtS8B9Qn6pYj9p6Yg8q9j3Q6hW1jg',  // CLOUD
];

export async function getTop200Tokens() {
  if (Date.now() - CACHE.lastFetch < CACHE.TTL && CACHE.data.length > 0) {
    return CACHE.data;
  }

  // STRATEGY 1: Primary - CoinGecko Top 200 (Discovery)
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=solana-ecosystem&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h"
    );
    
    if (response.ok) {
        const data = await response.json();
        CACHE.data = data;
        CACHE.lastFetch = Date.now();
        console.log(`Updated Market Data (CoinGecko): ${data.length} tokens`);
        return data;
    } else {
        console.warn(`CoinGecko Rate Limit/Error (${response.status}). Switching to Backup...`);
    }
  } catch (e) {
    console.warn("CoinGecko unreachable. Switching to Backup...");
  }

  // STRATEGY 2: Backup - DexScreener (Reliability)
  // If CoinGecko fails, we fetch live data for our "Major List".
  // This ensures the bot always has *something* real to trade.
  try {
      const mints = FALLBACK_TOKENS.join(',');
      const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${mints}`);
      
      if (res.ok) {
          const data = await res.json();
          if (data && data.pairs) {
            const uniqueTokens = new Map();
            data.pairs.forEach(pair => {
                const symbol = pair.baseToken.symbol;
                if (pair.quoteToken.symbol === 'SOL' || pair.quoteToken.symbol === 'USDC') {
                    if (!uniqueTokens.has(symbol) || uniqueTokens.get(symbol).liquidity.usd < pair.liquidity.usd) {
                        uniqueTokens.set(symbol, pair);
                    }
                }
            });

            CACHE.data = Array.from(uniqueTokens.values()).map((pair, index) => ({
                id: pair.baseToken.address,
                symbol: pair.baseToken.symbol.toLowerCase(),
                current_price: parseFloat(pair.priceUsd),
                price_change_percentage_24h: pair.priceChange.h24,
                total_volume: pair.volume.h24,
                market_cap_rank: index + 1
            }));
            
            CACHE.lastFetch = Date.now();
            console.log(`Updated Market Data (DexScreener Backup): ${CACHE.data.length} tokens`);
            return CACHE.data;
          }
      }
  } catch (e) {
      console.error("Backup Data Source Failed:", e.message);
  }

  return CACHE.data || [];
}

export async function fetchTokenPrice(mint) {
    if (!mint) return null;

    // Check cache first
    const cached = CACHE.data.find(t => t.id === mint || t.symbol.toUpperCase() === mint.toUpperCase());
    if (cached) return cached.current_price;

    try {
        const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${mint}`);
        if (res.ok) {
            const data = await res.json();
            if (data && data.pairs && data.pairs.length > 0) {
                // Find best pair (SOL or USDC)
                const pair = data.pairs.find(p => p.quoteToken.symbol === 'SOL' || p.quoteToken.symbol === 'USDC') || data.pairs[0];
                return parseFloat(pair.priceUsd);
            }
        }
    } catch (e) {
        console.error(`Fetch Price Error for ${mint}:`, e.message);
    }
    return 0;
}
