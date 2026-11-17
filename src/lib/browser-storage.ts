// Storage can be disabled by the browser. Cleanup must never prevent sign-out.
export function removeStoredKeys(area: "localStorage" | "sessionStorage", matches: (key: string) => boolean) {
  if (typeof window === "undefined") return;
  try {
    const storage = window[area];
    const keys: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && matches(key)) keys.push(key);
    }
    for (const key of keys) {
      try { storage.removeItem(key); } catch { /* Continue with other keys and provider logout. */ }
    }
  } catch { /* The browser denies access; do not read or reuse old data. */ }
}
