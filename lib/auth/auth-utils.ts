// Utility function to hash values consistently using Web Crypto API (Edge compatible)
export async function hashValue(value: string): Promise<string> {
  // Encode as UTF-8
  const msgBuffer = new TextEncoder().encode(value);
  
  // Hash the message
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  
  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

// Synchronous version for backward compatibility
// Not cryptographically strong, but sufficient for basic ID hashing
export function hashValueSync(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    const char = value.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Convert to hex string with fixed length
  const hashHex = (hash >>> 0).toString(16).padStart(8, '0');
  
  // Add a salt/prefix to make it more unique
  return `edge${hashHex}${value.length.toString(16)}`;
} 