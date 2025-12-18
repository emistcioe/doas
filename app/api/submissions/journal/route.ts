import { NextRequest, NextResponse } from "next/server";

import { API_BASE } from "@/lib/env";

const API_BASE_URL = API_BASE || "https://cdn.tcioe.edu.np";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const response = await fetch(
      `${API_BASE_URL}/api/v1/public/journal-mod/articles/submit/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      }
    );

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("journal submission failed", error);
    return NextResponse.json(
      { error: "Unable to submit journal article" },
      { status: 500 }
    );
  }
}
