// app/api/output/[id]/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import Output from "@/models/Output";

// small type guard
function asJsonObjectOrNull(v: unknown): object | null | undefined {
  if (v === undefined) return undefined; // don't change
  if (v === null) return null;           // set to NULL
  if (typeof v === "object") return v as object; // JSON object/array is fine for DataTypes.JSON
  // for primitives (string/number/boolean), either wrap or null — we’ll choose null
  return null;
}

// GET /api/output/:id
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  await Output.sync();
  const row = await Output.findByPk(Number(id));
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ row });
}

// PUT /api/output/:id
export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  await Output.sync();
  const row = await Output.findByPk(Number(id));
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = (await req.json().catch(() => ({}))) as {
    html?: string;
    summary?: unknown;
  };

  // Validate/narrow the fields
  const nextHtml =
    typeof body.html === "string" ? body.html : (row.get("html") as string);

  // Coerce summary to object | null | undefined to satisfy Sequelize types
  const incomingSummary = asJsonObjectOrNull(body.summary);
  const nextSummary =
    incomingSummary === undefined
      ? (row.get("summary") as object | null)
      : incomingSummary;

  await row.update({
    html: nextHtml,
    summary: nextSummary, // <- now typed as object | null
  });

  return NextResponse.json({ ok: true });
}

// DELETE /api/output/:id
export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  await Output.sync();
  const row = await Output.findByPk(Number(id));
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await row.destroy();
  return NextResponse.json({ ok: true });
}