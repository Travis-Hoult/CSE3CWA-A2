// app/api/progress/[id]/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import Progress from "@/models/Progress";

// GET /api/progress/:id
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  await Progress.sync();
  const row = await Progress.findByPk(Number(id));
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ row });
}

// PUT /api/progress/:id
export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  await Progress.sync();
  const row = await Progress.findByPk(Number(id));
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  type Body = {
    finishedAt?: string | null;
    verdictCategory?: string | null;
    notes?: string | null;
  };

  const body: Body = await req.json().catch(() => ({} as Body));

  const updates: {
    finishedAt?: Date | null;
    verdictCategory?: string | null;
    notes?: string | null;
  } = {};

  if ("finishedAt" in body) {
    updates.finishedAt =
      typeof body.finishedAt === "string" ? new Date(body.finishedAt) : null;
  }
  if ("verdictCategory" in body) {
    updates.verdictCategory =
      typeof body.verdictCategory === "string" ? body.verdictCategory : null;
  }
  if ("notes" in body) {
    updates.notes = typeof body.notes === "string" ? body.notes : null;
  }

  await row.update(updates);
  return NextResponse.json({ ok: true });
}

// DELETE /api/progress/:id
export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  await Progress.sync();
  const row = await Progress.findByPk(Number(id));
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await row.destroy();
  return NextResponse.json({ ok: true });
}