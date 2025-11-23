const env: Record<string, string | undefined> =
  typeof process !== "undefined" && typeof process.env !== "undefined"
    ? process.env
    : ({} as Record<string, string | undefined>);

export const USE_PROXY =
  (env.NEXT_PUBLIC_USE_PROXY || "").toLowerCase() === "true";

export const API_BASE = env.NEXT_PUBLIC_API_BASE || "https://cdn.tcioe.edu.np";
export const API_PUBLIC_PREFIX =
  env.NEXT_PUBLIC_API_PUBLIC_PREFIX || "/api/v1/public/department-mod";
export const API_NOTICE_PUBLIC_PREFIX =
  env.NEXT_PUBLIC_API_NOTICE_PUBLIC_PREFIX || "/api/v1/public/notice-mod";
export const API_WEBSITE_PUBLIC_PREFIX =
  env.NEXT_PUBLIC_API_WEBSITE_PUBLIC_PREFIX || "/api/v1/public/website-mod";
export const API_RESEARCH_PUBLIC_PREFIX =
  env.NEXT_PUBLIC_API_RESEARCH_PUBLIC_PREFIX || "/api/v1/public/research-mod";
export const API_PROJECT_PUBLIC_PREFIX =
  env.NEXT_PUBLIC_API_PROJECT_PUBLIC_PREFIX || "/api/v1/public/project-mod";
export const API_JOURNAL_PUBLIC_PREFIX =
  env.NEXT_PUBLIC_API_JOURNAL_PUBLIC_PREFIX || "/api/v1/public/journal-mod";
export const SCHEDULE_API_BASE =
  env.NEXT_PUBLIC_SCHEDULE_API_BASE ||
  "https://schedule-backend.tcioe.edu.np/api";

export const DEPARTMENT_CODE = (
  env.NEXT_PUBLIC_DEPARTMENT || "doece"
).toLowerCase();

// Enable verbose API URL logging by setting DEBUG_API=true or NEXT_PUBLIC_DEBUG_API=true
export const DEBUG_API =
  (env.DEBUG_API || env.NEXT_PUBLIC_DEBUG_API || "").toLowerCase() === "true";

export function getPublicApiUrl(path: string) {
  // When using Next.js route proxy, prepend /api/proxy
  if (USE_PROXY) return `/api/proxy${path.startsWith("/") ? "" : "/"}${path}`;
  const base = API_BASE.replace(/\/$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  const url = `${base}${suffix}`;
  if (DEBUG_API) {
    try {
    } catch (e) {
      /* ignore */
    }
  }
  return `${base}${suffix}`;
}
