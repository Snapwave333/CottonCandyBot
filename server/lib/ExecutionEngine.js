import { getDb } from './db.js';
import { PaperExecutionProvider } from './execution/PaperExecutionProvider.js';
import { RealExecutionProvider } from './execution/RealExecutionProvider.js';

export class ExecutionEngine {
  constructor(connection, io) {
    this.connection = connection;
    this.io = io;
    this.paperProvider = new PaperExecutionProvider(io);
    this.realProvider = new RealExecutionProvider(connection, io);
  }

  async executeTrade(strategy, quote) {
    const db = await getDb();
    const isPaper = db.data.settings.isPaperMode;

    if (isPaper) {
      return this.paperProvider.executeTrade(strategy, quote);
    } else {
      return this.realProvider.executeTrade(strategy, quote);
    }
  }
}
