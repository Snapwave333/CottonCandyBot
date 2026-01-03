import { VersionedTransaction, LAMPORTS_PER_SOL, Keypair, TransactionMessage } from '@solana/web3.js';
import { createJitoTipInstruction } from '../server/lib/jito.js';

async function verifyLogic() {
  console.log('--- Verifying Transaction Logic ---');
  
  const keypair = Keypair.generate();
  const tipAmount = 10000;
  const blockhash = '7v9vW1pXP6Xk8qXvU6qL8Z8vU6qL8Z8vU6qL8Z8vU6qL'; // Mock blockhash
  
  try {
    const tipInstruction = createJitoTipInstruction(keypair.publicKey, tipAmount);
    
    // This is the logic we fixed
    const messageV0 = new TransactionMessage({
      payerKey: keypair.publicKey,
      recentBlockhash: blockhash,
      instructions: [tipInstruction],
    }).compileToV0Message();

    const tipTransaction = new VersionedTransaction(messageV0);
    tipTransaction.sign([keypair]);
    
    console.log('✅ Transaction compilation and signing successful');
    console.log('Bundle serialization test:');
    const serialized = Buffer.from(tipTransaction.serialize()).toString('base64');
    console.log(`- Serialized length: ${serialized.length}`);
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  }
}

verifyLogic();
