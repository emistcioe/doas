import { NextRequest } from "next/server";

import { API_BASE, API_PUBLIC_PREFIX } from "@/lib/env";

export const dynamic = "force-dynamic";

function buildTarget(pathParts: string[], search: string) {
  const baseUrl = API_BASE.replace(/\/$/, "");
  const prefix = API_PUBLIC_PREFIX.startsWith("/")
    ? API_PUBLIC_PREFIX
    : `/${API_PUBLIC_PREFIX}`;
  const suffix = pathParts.join("/");
  return `${baseUrl}${prefix}/departments/${suffix}${search}`;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { path?: string[] } }
) {
  // `params` can be an unresolved value in some Next.js runtimes — await it
  // before accessing its properties to avoid the runtime error.
  // See: https://nextjs.org/docs/messages/sync-dynamic-apis
  // We also log the target and response for debugging.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resolvedParams = (await (params as any)) as { path?: string[] };
  const pathParts = resolvedParams?.path || [];

  if (pathParts.length === 0) {
    return new Response(
      JSON.stringify({
        error: "Path missing",
        hint: "/api/department/{slug}/...",
      }),
      { status: 400, headers: { "content-type": "application/json" } }
    );
  }

  const target = buildTarget(pathParts, req.nextUrl.search);

  try {
    const res = await fetch(target, {
      headers: { accept: "application/json" },
      cache: "no-store",
    });
    const body = await res.text();
    const ct = res.headers.get("content-type") || "application/json";

    // Log a truncated response body for debugging (avoid extremely large logs)
    try {
      const truncated =
        body.length > 2000 ? `${body.slice(0, 2000)}... (truncated)` : body;
    } catch (e) {
      /* ignore logging errors */
    }

    return new Response(body, {
      status: res.status,
      statusText: res.statusText,
      headers: { "content-type": ct },
    });
  } catch (error) {
    console.error("Department proxy failed", { target, error });
    return new Response(
      JSON.stringify({ error: "Department proxy failed", target }),
      { status: 502, headers: { "content-type": "application/json" } }
    );
  }
}
