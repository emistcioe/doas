import { NextRequest } from "next/server";
import { API_BASE } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathParts } = await params;
  const path = pathParts.join("/");
  const url = new URL(req.url);
  const qs = url.search ? url.search : "";
  const target = `${API_BASE.replace(/\/$/, "")}/${path}${qs}`;

  const res = await fetch(target, {
    headers: { accept: "application/json" },
    cache: "no-store",
  });

  const body = await res.text();
  const ct = res.headers.get("content-type") || "application/json";
  console.log(
    `[api/proxy] ${target} -> ${res.status} ${res.statusText} (${ct})`
  );
  try {
    const truncated =
      body.length > 2000 ? `${body.slice(0, 2000)}... (truncated)` : body;
  } catch (e) {
    /* ignore */
  }
  return new Response(body, {
    status: res.status,
    statusText: res.statusText,
    headers: { "content-type": ct },
  });
}
