import { API_HOST_BASE_URL } from "./constants";

export async function apiFetch<T>(
    path: string,
    opts: RequestInit = {}
  ): Promise<T> {
    const res = await fetch(
      `${API_HOST_BASE_URL}${path}`,
      {
        credentials: "include",          // sends cookies automatically
        headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
        ...opts,
      }
    );
  
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || res.statusText);
    }
    return res.json();
  }
  