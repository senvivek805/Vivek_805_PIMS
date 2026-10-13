// ============================================
// CSRF Token Helper
// ============================================

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

let cachedToken: string | null = null;
let lastFetch = 0;
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

// ============================================
// GET CSRF TOKEN
// ============================================

export async function getCsrfToken(force = false): Promise<string> {
  const now = Date.now();

  if (!force && cachedToken && now - lastFetch < CACHE_DURATION) {
    return cachedToken;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/auth/csrf/?format=json`, {
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`CSRF fetch failed: ${res.status}`);
    }

    const data = await res.json();
    cachedToken = data.csrfToken;
    lastFetch = now;

    return cachedToken!;
  } catch (err: any) {
    console.error("🔴 CSRF fetch error:", err);
    throw new Error("CSRF token fetch failed: " + (err.message || ""));
  }
}

// ============================================
// CLEAR CACHE
// ============================================

export function clearCsrfCache() {
  cachedToken = null;
  lastFetch = 0;
}

// ============================================
// FETCH WITH CSRF
// ============================================

export async function fetchWithCsrf<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const method = (options.method || "GET").toUpperCase();
  const needsCsrf = ["POST", "PUT", "PATCH", "DELETE"].includes(method);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (needsCsrf) {
    const token = await getCsrfToken();
    headers["X-CSRFToken"] = token;
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.detail ||
        JSON.stringify(errorData) ||
        `HTTP ${res.status}: ${res.statusText}`
    );
  }

  if (res.status === 204) {
    return {} as T;
  }

  return res.json();
}