// app/api/output/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import Output from "@/models/Output";

type OutputBody = { html: string; summary?: unknown };

export async function GET() {
  await Output.sync();
  const rows = await Output.findAll({ order: [["id", "DESC"]], limit: 50 });
  return NextResponse.json({ rows });
}

export async function POST(req: Request) {
  await Output.sync();
  const body = (await req.json().catch(() => ({}))) as Partial<OutputBody>;
  if (!body.html || typeof body.html !== "string") {
    return NextResponse.json({ error: "html (string) is required" }, { status: 400 });
  }
  const rec = await Output.create({ html: body.html, summary: body.summary ?? null });
  return NextResponse.json({ ok: true, id: rec.id });
}