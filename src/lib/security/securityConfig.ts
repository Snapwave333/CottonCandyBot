export const SECURITY_CONFIG = {
  MAX_SWARM_SIZE: 20,
  MAX_DAILY_GAS_SPEND_SOL: 1,
  EMERGENCY_HALT: false,
  SESSION_TIMEOUT_MS: 30 * 60 * 1000, // 30 minutes
  ENCRYPTION_ALGO: 'AES-GCM',
};

export const sanitizeSymbol = (symbol: string): string => {
  return symbol.replaceAll(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase();
};
