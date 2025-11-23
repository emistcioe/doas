import { NextRequest } from "next/server";

import { API_BASE, API_WEBSITE_PUBLIC_PREFIX } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const search = req.nextUrl.search || "";
  const target = `${API_BASE.replace(/\/$/, "")}${API_WEBSITE_PUBLIC_PREFIX}/global-events${search}`;

  const res = await fetch(target, {
    headers: { accept: "application/json" },
    cache: "no-store",
  });

  const body = await res.text();
  const ct = res.headers.get("content-type") || "application/json";
  return new Response(body, {
    status: res.status,
    statusText: res.statusText,
    headers: { "content-type": ct },
  });
}
