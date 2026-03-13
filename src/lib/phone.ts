/**
 * Phone number validation and parsing utilities for the admin whitelist upload.
 */

/**
 * Normalize a phone number to digits only.
 */
export function normalizePhone(phone: string): string {
  return (phone || "").replace(/\D/g, "");
}

/**
 * Check if a normalized phone string is valid (9-15 digits).
 */
export function isValidPhone(phone: string): boolean {
  const digits = normalizePhone(phone);
  return digits.length >= 9 && digits.length <= 15;
}

/**
 * Heuristic: does this entry look like a phone number?
 * Returns true if > 70% of non-whitespace chars are digits and no "@" present.
 */
export function looksLikePhone(entry: string): boolean {
  const stripped = entry.replace(/[\s\-\(\)\.]/g, "");
  if (stripped.length === 0) return false;
  if (entry.includes("@")) return false;
  const digitCount = (stripped.match(/\d/g) || []).length;
  const digitRatio = digitCount / stripped.length;
  return digitRatio > 0.7;
}

/**
 * Heuristic: does this entry look like an email?
 */
export function looksLikeEmail(entry: string): boolean {
  return entry.includes("@");
}

/**
 * Hash a phone number using SHA-256 (for preview purposes in admin UI).
 * The actual HMAC hashing happens server-side.
 */
export async function hashPhoneSha256(phone: string): Promise<string> {
  const normalized = normalizePhone(phone);
  const enc = new TextEncoder().encode(normalized);
  const digest = await crypto.subtle.digest("SHA-256", enc);
  const bytes = Array.from(new Uint8Array(digest));
  return bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
}














