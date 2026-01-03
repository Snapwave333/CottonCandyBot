
const fs = require('fs');
const path = require('path');

const dbPath = path.join(process.cwd(), 'db.json');

try {
    const data = fs.readFileSync(dbPath, 'utf8');
    const db = JSON.parse(data);

    // Clean strategies (removes the "mock-looking" positions)
    db.strategies = [];
    
    // Clean history (fresh start for the chart)
    db.portfolioHistory = [];
    
    // Reset stats
    db.stats = {
        totalTrades: 0,
        winRate: 0,
        realizedPnL: 0,
        bestTrade: null,
        worstTrade: null
    };

    // Ensure wallets are clean if needed, but let's keep them if they hold balance settings
    // If there are "paper" wallets with positions, clear those positions
    if (db.wallets) {
        db.wallets.forEach(w => {
            if (w.isPaper) {
                w.positions = []; // Clear manual paper positions
                w.balance = db.settings ? db.settings.defaultPaperBalanceUSD : 100; // Reset balance
            }
        });
    }

    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    console.log('Database cleaned successfully.');

} catch (err) {
    console.error('Error cleaning database:', err);
}
