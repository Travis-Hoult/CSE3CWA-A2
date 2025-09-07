// app/api/progress/[id]/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import Progress from "@/models/Progress";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  await Progress.sync();
  const row = await Progress.findByPk(Number(params.id));
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ row });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await Progress.sync();
  const row = await Progress.findByPk(Number(params.id));
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await req.json().catch(() => ({}));
  await row.update({
    finishedAt: body.finishedAt ? new Date(body.finishedAt) : row.get("finishedAt"),
    verdictCategory: body.verdictCategory ?? row.get("verdictCategory"),
    notes: body.notes ?? row.get("notes"),
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await Progress.sync();
  const row = await Progress.findByPk(Number(params.id));
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await row.destroy();
  return NextResponse.json({ ok: true });
}
