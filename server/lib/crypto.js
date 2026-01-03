import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const SALT_LENGTH = 32;

/**
 * Validates the secret key meets security requirements
 * @param {string} secretKey - The master secret key to validate
 * @throws {Error} If key is invalid
 */
export const validateSecretKey = (secretKey) => {
  if (!secretKey || typeof secretKey !== 'string') {
    throw new Error('SECRET_KEY is required and must be a string');
  }
  if (secretKey.length < 32) {
    throw new Error('SECRET_KEY must be at least 32 characters long');
  }
};

/**
 * Encrypts sensitive data using AES-256-GCM with unique salt per encryption
 * @param {string} text - The plaintext to encrypt
 * @param {string} secretKey - The master secret key (from .env)
 * @returns {string} - Encrypted string in format salt:iv:authTag:encryptedText
 */
export const encrypt = (text, secretKey) => {
  validateSecretKey(secretKey);

  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = crypto.scryptSync(secretKey, salt, 32);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');

  return `${salt.toString('hex')}:${iv.toString('hex')}:${authTag}:${encrypted}`;
};

/**
 * Decrypts data encrypted with encrypt()
 * @param {string} encryptedData - The encrypted data string
 * @param {string} secretKey - The master secret key
 * @returns {string} - Decrypted plaintext
 */
export const decrypt = (encryptedData, secretKey) => {
  validateSecretKey(secretKey);

  const parts = encryptedData.split(':');

  if (parts.length === 3) {
    const [ivHex, authTagHex, encryptedText] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const key = crypto.scryptSync(secretKey, 'salt', 32);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  if (parts.length === 4) {
    const [saltHex, ivHex, authTagHex, encryptedText] = parts;
    const salt = Buffer.from(saltHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const key = crypto.scryptSync(secretKey, salt, 32);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  throw new Error('Invalid encrypted data format');
};
