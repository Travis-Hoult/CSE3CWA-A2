// app/api/options/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { BASE_OPTIONS } from "@/lib/courtroom/options";

export async function GET() {
  const url = process.env.LAMBDA_URL;
  if (!url) return NextResponse.json({ source: "local", options: BASE_OPTIONS });

  try {
    const r = await fetch(url, { method: "POST", body: JSON.stringify({ n: 3 }) });
    const data = await r.json().catch(() => ({}));
    return NextResponse.json({ source: "lambda", options: data.options ?? BASE_OPTIONS });
  } catch {
    return NextResponse.json({ source: "fallback", options: BASE_OPTIONS });
  }
}
