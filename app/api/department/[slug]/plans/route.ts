import { NextRequest } from "next/server";
import { API_BASE, API_PUBLIC_PREFIX } from "@/lib/env";

export const dynamic = "force-dynamic";

function buildQuery(params: URLSearchParams) {
  const usp = new URLSearchParams();
  for (const [k, v] of params.entries()) {
    if (v != null && v !== "") usp.set(k, v);
  }
  const qs = usp.toString();
  return qs ? `?${qs}` : "";
}

async function proxy(url: string) {
  const res = await fetch(url, {
    headers: { accept: "application/json" },
    cache: "no-store",
  });
  console.log(
    `[department/plans proxy] ${url} -> ${res.status} ${res.statusText}`
  );
  try {
    const text = await res
      .clone()
      .text()
      .catch(() => "");
    const truncated =
      text.length > 2000 ? `${text.slice(0, 2000)}... (truncated)` : text;
  } catch (e) {
    /* ignore */
  }
  if (!res.ok) return res;
  return res;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const url = new URL(req.url);
  const qs = buildQuery(url.searchParams);

  // First try public endpoint if available
  const publicUrl = `${API_BASE.replace(
    /\/$/,
    ""
  )}${API_PUBLIC_PREFIX}/departments/${slug}/plans${qs}`;

  let res = await proxy(publicUrl);
  if (res && res.ok) {
    const body = await res.text();
    const ct = res.headers.get("content-type") || "application/json";
    return new Response(body, {
      status: res.status,
      statusText: res.statusText,
      headers: { "content-type": ct },
    });
  }

  // Fallback: use CMS endpoint and filter by department name
  const deptUrl = `${API_BASE.replace(
    /\/$/,
    ""
  )}${API_PUBLIC_PREFIX}/departments/${slug}`;

  const deptRes = await fetch(deptUrl, {
    headers: { accept: "application/json" },
    cache: "no-store",
  });
  if (!deptRes.ok) {
    const text = await deptRes.text().catch(() => "");
    return new Response(text || "Failed to load department", {
      status: deptRes.status,
    });
  }
  const dept = await deptRes.json().catch(() => null as any);
  const deptName: string | undefined = dept?.name;

  const cmsUrl = `${API_BASE.replace(
    /\/$/,
    ""
  )}/api/v1/cms/department-mod/department-plans-policies${qs}`;
  c;
  const cmsRes = await fetch(cmsUrl, {
    headers: { accept: "application/json" },
    cache: "no-store",
  });
  console.log(
    `[department/plans] ${cmsUrl} -> ${cmsRes.status} ${cmsRes.statusText}`
  );
  if (!cmsRes.ok) {
    const text = await cmsRes.text().catch(() => "");
    return new Response(text || "Failed to load plans", {
      status: cmsRes.status,
    });
  }
  const cmsBody = await cmsRes.json();
  // Shape into Paginated<DepartmentPlan>
  const items = Array.isArray(cmsBody?.results) ? cmsBody.results : [];
  const filtered = deptName
    ? items.filter((it: any) => it?.department?.name === deptName)
    : items;
  const mapped = filtered.map((it: any) => ({
    uuid: String(it?.id ?? it?.uuid ?? ""),
    title: String(it?.title ?? ""),
    description: String(it?.description ?? ""),
    file: String(it?.file ?? ""),
  }));
  const result = {
    count: mapped.length,
    next: null,
    previous: null,
    results: mapped,
  };
  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
