
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const API_URL = 'http://localhost:3021/api/settings/reset';
const DB_PATH = path.join(__dirname, '../db.json');

async function testReset() {
  console.log('--- Testing Reset Functionality ---');

  // 1. Read current DB state
  console.log('Reading db.json...');
  let db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  
  // Create some dummy data if empty to prove reset works
  if (db.stats.totalTrades === 0) {
      console.log('Adding dummy data to stats for testing...');
      db.stats.totalTrades = 50;
      fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
      // Reload
      db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  }

  console.log(`Current Total Trades: ${db.stats.totalTrades}`);
  console.log(`Current Portfolio History Length: ${db.portfolioHistory.length}`);
  console.log(`Current isPaperMode: ${db.settings.isPaperMode}`);

  if (!db.settings.isPaperMode) {
    console.log('❌ isPaperMode is FALSE. Reset should fail or be blocked. Exiting test.');
    return;
  }

  // 2. Call Reset API
  console.log('Calling /api/settings/reset...');
  try {
    const response = await fetch(API_URL, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    });
    const result = await response.json();
    console.log('API Response:', result);
  } catch (error) {
    console.error('❌ API Call Failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
        console.log('Server is likely not running on port 3020.');
    }
    return;
  }

  // 3. Wait a moment for rewrite
  console.log('Waiting for engine to process...');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 4. Check DB again
  console.log('Reading db.json again...');
  const newDb = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  
  console.log(`New Total Trades: ${newDb.stats.totalTrades}`);
  console.log(`New Portfolio History Length: ${newDb.portfolioHistory.length}`);

  if (newDb.stats.totalTrades === 0 && newDb.portfolioHistory.length === 0) {
      console.log('✅ Reset Successful: Data wiped.');
  } else {
      console.log('❌ Reset FAILED: Data persisted.');
  }
}

testReset();
