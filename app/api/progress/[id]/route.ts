// app/api/progress/[id]/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import Progress from "@/models/Progress";

function getId(req: NextRequest): number | null {
  const pathname = new URL(req.url).pathname;
  const last = pathname.split("/").pop() ?? "";
  const n = Number(last);
  return Number.isNaN(n) ? null : n;
}

export async function GET(req: NextRequest) {
  try {
    const id = getId(req);
    if (id == null) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    await Progress.sync();
    const row = await Progress.findByPk(id);
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ row });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "GET failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const id = getId(req);
    if (id == null) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    await Progress.sync();
    const row = await Progress.findByPk(id);
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = (await req.json().catch(() => ({}))) as Partial<{
      finishedAt: string;
      verdictCategory: string | null;
      notes: string | null;
    }>;

    await row.update({
      finishedAt: body.finishedAt ? new Date(body.finishedAt) : (row.get("finishedAt") as Date | null),
      verdictCategory: body.verdictCategory ?? (row.get("verdictCategory") as string | null),
      notes: body.notes ?? (row.get("notes") as string | null),
    });

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "PUT failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = getId(req);
    if (id == null) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    await Progress.sync();
    const row = await Progress.findByPk(id);
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await row.destroy();
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "DELETE failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}