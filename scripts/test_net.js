
async function testFetch() {
    console.log("Testing Connectivity...");
    
    const urls = [
        'https://token.jup.ag/strict',
        'https://api.dexscreener.com/latest/dex/tokens/So11111111111111111111111111111111111111112',
        'https://api.coingecko.com/api/v3/ping'
    ];

    for (const url of urls) {
        console.log(`\nFetching ${url}...`);
        try {
            const start = Date.now();
            const res = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'application/json'
                }
            });
            console.log(`Status: ${res.status} ${res.statusText}`);
            console.log(`Time: ${Date.now() - start}ms`);
            if (res.ok) {
                const text = await res.text();
                console.log(`Body Sample: ${text.slice(0, 100)}...`);
            } else {
                console.log('Response not OK');
            }
        } catch (e) {
            console.error(`FAILED: ${e.message}`);
            if (e.cause) console.error('Cause:', e.cause);
        }
    }
}

testFetch();
