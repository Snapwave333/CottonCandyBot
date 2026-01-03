import { JSONFilePreset } from 'lowdb/node';

const defaultData = {
  strategies: [],
  wallets: [],
  logs: [],
  settings: {
    defaultPaperBalanceUSD: 100,
    isPaperMode: true
  }
};

let dbInstance = null;

/**
 * Returns a singleton instance of the LowDB database.
 * Initialization happens only once.
 */
export const getDb = async () => {
  if (!dbInstance) {
    console.log(`[DB DEBUG] CWD: ${process.cwd()}`);
    dbInstance = await JSONFilePreset('db.json', defaultData);
    console.log(`[DB DEBUG] Loaded DB with strategies: ${dbInstance.data.strategies.length}`);
  }
  return dbInstance;
};
