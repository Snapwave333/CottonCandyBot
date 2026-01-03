import { Keypair } from '@solana/web3.js';
import { BurnerWallet, WalletType } from '@/types';
import { SECURITY_CONFIG } from '../security/securityConfig';
import { encryptKey } from '../security/encryption';

export class WalletFactory {
  /**
   * Spawns a new swarm of wallets, encrypted with the session password.
   */
  static async spawn(count: number, type: WalletType, sessionPassword: string): Promise<BurnerWallet[]> {
    // 1. Governance check
    if (count > SECURITY_CONFIG.MAX_SWARM_SIZE) {
      throw new Error(`Governance Violation: Swarm size ${count} exceeds limit of ${SECURITY_CONFIG.MAX_SWARM_SIZE}`);
    }

    const drones: BurnerWallet[] = [];

    for (let i = 0; i < count; i++) {
      const kp = Keypair.generate();
      
      // 2. Encryption mandatory
      const encryptedKey = await encryptKey(
        Buffer.from(kp.secretKey).toString('hex'),
        sessionPassword
      );

      drones.push({
        publicKey: kp.publicKey.toBase58(),
        encryptedKey: encryptedKey, // Forced encryption
        type,
        label: `${type.replace('_', ' ')} #${i + 1}`,
        balance: 0,
        isPaper: true, // Swarm bots always start in paper/sim mode for safety
      });
    }

    return drones;
  }

  static async createSoloVault(label: string, sessionPassword: string): Promise<BurnerWallet> {
    const kp = Keypair.generate();
    const encryptedKey = await encryptKey(
      Buffer.from(kp.secretKey).toString('hex'),
      sessionPassword
    );

    return {
      publicKey: kp.publicKey.toBase58(),
      encryptedKey,
      type: 'SOLO_VAULT' as any, // Adjusted for local type if needed
      label,
      balance: 0,
      isPaper: true,
    };
  }

  static getSafetyLimits() {
    return {
      maxWallets: SECURITY_CONFIG.MAX_SWARM_SIZE,
      gasGuard: 0.1, // SOL reserved per active wallet
    };
  }

  /**
   * Executes a Solana transaction with exponential backoff retry logic.
   * @param connection Solana Connection object
   * @param transaction Transaction object
   * @param signers Array of Signers
   * @param maxRetries Maximum number of retries (default 3)
   */
  static async sendTransactionWithRetry(
    connection: any, 
    transaction: any, 
    signers: any[], 
    maxRetries = 3
  ): Promise<string> {
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        const signature = await connection.sendTransaction(transaction, signers);
        await connection.confirmTransaction(signature, 'confirmed');
        return signature;
      } catch (error: any) {
        attempt++;
        if (attempt >= maxRetries) {
           throw new Error(`Transaction failed after ${maxRetries} attempts: ${error.message}`);
        }
        
        // Exponential backoff: 500ms, 1000ms, 2000ms...
        const delay = 500 * Math.pow(2, attempt - 1);
        console.warn(`Transaction failed (Attempt ${attempt}/${maxRetries}). Retrying in ${delay}ms...`, error);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error('Transaction failed unexpectedly.');
  }
}
