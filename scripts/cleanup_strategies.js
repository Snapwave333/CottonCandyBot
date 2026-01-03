const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../server/db.json');

try {
    const rawData = fs.readFileSync(dbPath, 'utf8');
    const db = JSON.parse(rawData);

    if (!db.strategies) {
        console.log('No strategies found in db.json');
        process.exit(0);
    }

    const initialCount = db.strategies.length;
    
    // Filter out broken strategies
    db.strategies = db.strategies.filter(s => {
        const isSniperOrDca = ['SNIPER', 'DCA'].includes(s.type);
        const hasNoTarget = !s.config.targetToken || s.config.targetToken.trim() === '';
        
        if (isSniperOrDca && hasNoTarget) {
            console.log(`🗑️ Deleting Broken Strategy: ${s.id} (${s.type}) - Missing Target Token`);
            return false;
        }
        return true;
    });

    const deletedCount = initialCount - db.strategies.length;

    if (deletedCount > 0) {
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
        console.log(`\n✅ Cleanup Complete! Removed ${deletedCount} broken strategies.`);
    } else {
        console.log('\n✨ No broken strategies found. Database is clean.');
    }

} catch (err) {
    console.error('❌ Error cleaning database:', err);
}
