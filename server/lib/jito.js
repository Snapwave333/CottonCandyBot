import { 
  PublicKey, 
  SystemProgram, 
  TransactionInstruction 
} from '@solana/web3.js';

// Jito Tip Accounts (Mainnet)
const JITO_TIP_ACCOUNTS = [
  '964neVhyZvA9zLp7bs6vTNo1U9e77u6fUtE1u99oP2fK',
  'HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gRe',
  'ADaHwwjs9Rn3L24AyvC9LkB66465gvCqW15nsh9Cjk8p',
  'ADuUk8vYUMS9SyeZ7yJCpD84LdskMvWvJ3WvQvXvYv',
  '6SuAnUra9Gtj99VAnM3CisN2W4J3NGeA6vE5rE3P7P'
];

/**
 * Creates a Jito Tip instruction
 * @param {PublicKey} payer - The public key of the tip payer
 * @param {number} tipAmountLamports - Amount of SOL to tip in lamports
 * @returns {TransactionInstruction}
 */
export const createJitoTipInstruction = (payer, tipAmountLamports) => {
  const randomTipAccount = new PublicKey(
    JITO_TIP_ACCOUNTS[Math.floor(Math.random() * JITO_TIP_ACCOUNTS.length)]
  );

  return SystemProgram.transfer({
    fromPubkey: payer,
    toPubkey: randomTipAccount,
    lamports: tipAmountLamports
  });
};

/**
 * Jito Endpoints for Mainnet
 */
export const JITO_ENDPOINTS = {
  mainnet: 'https://mainnet.block-engine.jito.wtf/api/v1/bundles',
  amsterdam: 'https://amsterdam.mainnet.block-engine.jito.wtf/api/v1/bundles',
  frankfurt: 'https://frankfurt.mainnet.block-engine.jito.wtf/api/v1/bundles',
  newyork: 'https://ny.mainnet.block-engine.jito.wtf/api/v1/bundles',
  tokyo: 'https://tokyo.mainnet.block-engine.jito.wtf/api/v1/bundles'
};
