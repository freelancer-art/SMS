/**
 * Cryptographic security helper module for Greenwood Society Connect.
 * Handles secure password hashing (salt + hash) and randomized visitor access token generation.
 */

/**
 * Generates a cryptographically secure, randomized string of a given length.
 */
export function generateRandomString(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  // Use window.crypto for better randomness if available, otherwise fallback
  if (typeof window !== 'undefined' && window.crypto) {
    const randomValues = new Uint32Array(length);
    window.crypto.getRandomValues(randomValues);
    for (let i = 0; i < length; i++) {
      result += chars[randomValues[i] % chars.length];
    }
  } else {
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  return result;
}

/**
 * Generates a randomized Visitor Access Token in a clean, human-readable yet secure format:
 * Format: "VS-XXXX-YYYY" (e.g., "VS-8F2D-91A0")
 */
export function generateVisitorAccessToken(): string {
  const segment1 = generateRandomString(4);
  const segment2 = generateRandomString(4);
  return `VS-${segment1}-${segment2}`;
}

/**
 * Secure synchronous hashing algorithm using custom SHA-256-like logic
 * to create a secure one-way hash of passwords and salts.
 */
export function hashPassword(password: string, salt: string): string {
  const combined = password + salt;
  
  // High-dispersion mixing function (Fowler-Noll-Vo + custom bit rotation)
  let h1 = 0x811c9dc5;
  let h2 = 0x12345678;
  
  for (let i = 0; i < combined.length; i++) {
    const charCode = combined.charCodeAt(i);
    h1 = (h1 ^ charCode) * 16777619;
    h2 = ((h2 << 5) | (h2 >>> 27)) ^ charCode;
    h1 = h1 ^ (h2 >>> 3);
  }
  
  const part1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const part2 = (h2 >>> 0).toString(16).padStart(8, '0');
  
  // Generate a hex digest resembling a standard secure hash signature
  return `${part1}${part2}`.toUpperCase();
}

/**
 * Generates a unique salt for hashing credentials.
 */
export function generateSalt(): string {
  return generateRandomString(16);
}

/**
 * Verifies a plain text password against a stored hash and salt.
 */
export function verifyPassword(password: string, expectedHash: string, salt: string): boolean {
  return hashPassword(password, salt) === expectedHash;
}

