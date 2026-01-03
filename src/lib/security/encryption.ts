/**
 * Web Crypto API based AES-GCM Encryption
 * Provides high-performance, non-extractable key security in-browser.
 */

const encoder = new TextEncoder();
const decoder = new TextDecoder();

async function getEncryptionKey(password: string): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password) as any,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('cotton-candy-salt') as any, // In production, unique salt per user is better
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptKey(secretKey: string, password: string): Promise<string> {
  const cryptoKey = await getEncryptionKey(password);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    encoder.encode(secretKey) as any // Cast to any to bypass SharedArrayBuffer issues in some TS envs
  );

  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);

  return btoa(String.fromCharCode(...Array.from(combined)));
}

export async function decryptKey(cipherText: string, password: string): Promise<string> {
  const cryptoKey = await getEncryptionKey(password);
  const binaryString = atob(cipherText);
  const combined = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    combined[i] = binaryString.charCodeAt(i);
  }

  const iv = combined.slice(0, 12);
  const encrypted = combined.slice(12);

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    encrypted as any
  );

  return decoder.decode(decrypted);
}
