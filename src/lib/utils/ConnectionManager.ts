/**
 * ConnectionManager: Handles RPC rotation and failure recovery.
 */
import { Connection, ConnectionConfig } from '@solana/web3.js';

export class ConnectionManager {
  private endpoints: string[];
  private currentIndex: number = 0;
  private config: ConnectionConfig;

  constructor(endpoints: string[], config?: ConnectionConfig) {
    this.endpoints = endpoints.length > 0 ? endpoints : ['https://api.mainnet-beta.solana.com'];
    this.config = config || { commitment: 'confirmed' };
  }

  get currentConnection(): Connection {
    return new Connection(this.endpoints[this.currentIndex], this.config);
  }

  rotate(): string {
    this.currentIndex = (this.currentIndex + 1) % this.endpoints.length;
    return this.endpoints[this.currentIndex];
  }

  async executeWithRetry<T>(operation: (connection: Connection) => Promise<T>, retries: number = 3): Promise<T> {
    let lastError: any;

    for (let i = 0; i <= retries; i++) {
      try {
        return await operation(this.currentConnection);
      } catch (error: any) {
        lastError = error;
        // Rotate on 429 (Too Many Requests) or 5xx/timeout errors
        if (error.status === 429 || error.message?.includes('429') || i < retries) {
          console.warn(`RPC Error on ${this.endpoints[this.currentIndex]}. Rotating...`);
          this.rotate();
        } else {
          throw error;
        }
      }
    }

    throw lastError;
  }
}
