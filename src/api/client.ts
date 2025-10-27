export interface RequestOptions extends RequestInit {
  authToken?: string | null;
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export async function apiGet<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const headers = new Headers(options.headers || {});
  headers.set("Accept", "application/json");
  if (options.authToken) {
    headers.set("Authorization", `Bearer ${options.authToken}`);
  }

  const res = await fetch(url, {
    method: "GET",
    ...options,
    headers,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GET ${path} failed: ${res.status} ${res.statusText}${text ? ` - ${text}` : ""}`);
  }
  return res.json() as Promise<T>;
}


