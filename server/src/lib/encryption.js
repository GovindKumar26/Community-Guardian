import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';

/**
 * Get encryption key from environment
 * Falls back to generating a deterministic key for development
 */
function getKey() {
    const envKey = process.env.ENCRYPTION_KEY;
    if (envKey && envKey.length === 64) {
        return Buffer.from(envKey, 'hex');
    }
    // Development fallback — warn and use a derived key
    if (process.env.NODE_ENV === 'production') {
        throw new Error('ENCRYPTION_KEY must be set in production (64 hex characters)');
    }
    console.warn('⚠ Using derived encryption key — set ENCRYPTION_KEY in .env for production');
    return crypto.scryptSync('community-guardian-dev-key', 'salt', 32);
}

/**
 * Encrypt text using AES-256-CBC
 * @param {string} text - Plain text to encrypt
 * @returns {{ encryptedContent: string, iv: string }}
 */
export function encrypt(text) {
    const key = getKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return {
        encryptedContent: encrypted,
        iv: iv.toString('hex')
    };
}

/**
 * Decrypt text using AES-256-CBC
 * @param {string} encryptedContent - Hex-encoded encrypted text
 * @param {string} ivHex - Hex-encoded initialization vector
 * @returns {string} Decrypted plain text
 */
export function decrypt(encryptedContent, ivHex) {
    const key = getKey();
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

    let decrypted = decipher.update(encryptedContent, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}
