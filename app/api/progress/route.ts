// app/api/progress/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import Progress from "@/models/Progress";

type ProgressBody = {
  startedAt?: string;
  finishedAt?: string | null;
  verdictCategory?: string | null;
  notes?: string | null;
};

export async function GET() {
  await Progress.sync();
  const rows = await Progress.findAll({ order: [["id", "DESC"]], limit: 50 });
  return NextResponse.json({ rows });
}

export async function POST(req: Request) {
  await Progress.sync();
  const body = (await req.json().catch(() => ({}))) as Partial<ProgressBody>;
  const rec = await Progress.create({
    startedAt: body.startedAt ? new Date(body.startedAt) : new Date(),
    finishedAt: body.finishedAt ? new Date(body.finishedAt) : null,
    verdictCategory: body.verdictCategory ?? null,
    notes: body.notes ?? null,
  });
  return NextResponse.json({ ok: true, id: rec.id });
}