import { getPublicApiUrl } from "@/lib/env";

export type QueryParams = Record<string, string | number | boolean | undefined>;

export function buildQuery(params?: QueryParams) {
  if (!params) return "";
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    usp.set(k, String(v));
  });
  const qs = usp.toString();
  return qs ? `?${qs}` : "";
}

export async function apiGet<T>(
  path: string,
  params?: QueryParams
): Promise<T> {
  const url = `${getPublicApiUrl(path)}${buildQuery(params)}`;

  try {
    const fetchOptions: RequestInit = {
      next: { revalidate: 60 },
      headers: { accept: "application/json" },
    };

    // Add timeout for build environments
    if (typeof window === "undefined") {
      // Server-side: add timeout to prevent build hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      fetchOptions.signal = controller.signal;

      try {
        const res = await fetch(url, fetchOptions);
        clearTimeout(timeoutId);

        // Log status and a truncated response body for debugging
        try {
          const clone = res.clone();
          const text = await clone.text().catch(() => "");
          const truncated =
            text.length > 2000 ? `${text.slice(0, 2000)}... (truncated)` : text;
        } catch (e) {
          /* ignore logging failures */
        }

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(
            `GET ${url} failed: ${res.status} ${res.statusText} ${text}`
          );
        }
        return (await res.json()) as T;
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } else {
      // Client-side: normal fetch

      const res = await fetch(url, fetchOptions);

      // Clone and log a truncated response body for debugging in the browser
      try {
        const clone = res.clone();
        const text = await clone.text().catch(() => "");
        const truncated =
          text.length > 2000 ? `${text.slice(0, 2000)}... (truncated)` : text;
        console.log(
          `[apiGet] (client) ${url} -> ${res.status} ${res.statusText}`
        );
      } catch (e) {
        /* ignore logging failures */
      }

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
          `GET ${url} failed: ${res.status} ${res.statusText} ${text}`
        );
      }
      return (await res.json()) as T;
    }
  } catch (error) {
    // Handle build-time failures gracefully
    if (typeof window === "undefined") {
      console.warn(`Build-time API call failed for ${url}:`, error);

      // Return appropriate empty structures based on common API response patterns
      if (
        path.includes("/events") ||
        path.includes("/staffs") ||
        path.includes("/programs") ||
        path.includes("/downloads") ||
        path.includes("/plans")
      ) {
        return { results: [], count: 0, next: null, previous: null } as T;
      }

      // For single entity endpoints like department details
      return {} as T;
    }
    throw error;
  }
}
