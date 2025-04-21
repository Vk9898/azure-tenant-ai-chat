//  lib/auth/auth-utils.ts
import { createHash, webcrypto } from "crypto";

/**
 * Convert an ArrayBuffer to a hex string.
 */
const buf2hex = (buffer: ArrayBuffer): string =>
  [...new Uint8Array(buffer)].map(b => b.toString(16).padStart(2, "0")).join("");

/**
 * Asynchronous SHA‑256 hash that works in Edge runtime **and** Node.
 */
export async function hashValue(value: string): Promise<string> {
  if (webcrypto?.subtle) {
    const data = new TextEncoder().encode(value);
    const digest = await webcrypto.subtle.digest("SHA-256", data);
    return buf2hex(digest);
  }
  // Fallback for older Node runtimes
  return createHash("sha256").update(value).digest("hex");
}

/**
 * Fast synchronous hash (DJB2‑style).
 * **Not cryptographically secure** — use only for non‑security identifiers.
 */
export function hashValueSync(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0; // Convert to 32‑bit int
  }
  const hex = (hash >>> 0).toString(16).padStart(8, "0");
  return `edge${hex}${value.length.toString(16)}`;
} 