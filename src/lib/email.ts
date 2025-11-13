export function isValidEmail(email: string): string | null {
  const e = email.trim().toLowerCase();
  // Basic RFC 5322-like regex, good enough for UI validation
  const re =
    /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i;
  return re.test(e) ? e : null;
}

export function parseEmailsFromText(text: string): string[] {
  const raw = text
    .split(/\r?\n|,|;/g)
    .map((s) => s.trim())
    .filter(Boolean);
  return raw.map((s) => s.toLowerCase());
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const [name, tld] = domain.split(".", 2);
  const mask = (s: string) => (s.length <= 2 ? s[0] + "*" : s[0] + "*".repeat(Math.max(1, s.length - 2)) + s[s.length - 1]);
  const maskedLocal = mask(local);
  const maskedDomain = name ? mask(name) + (tld ? "." + tld : "") : domain;
  return `${maskedLocal}@${maskedDomain}`;
}

export async function hashEmailSha256(email: string): Promise<string> {
  const normalized = email.trim().toLowerCase();
  const enc = new TextEncoder().encode(normalized);
  const digest = await crypto.subtle.digest("SHA-256", enc);
  const bytes = Array.from(new Uint8Array(digest));
  return bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
}


