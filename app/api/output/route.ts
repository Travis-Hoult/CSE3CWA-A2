import { NextResponse } from "next/server";
import { Output, ensureSynced } from "../../../models/Output";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    await ensureSynced();
    const body = await req.json();
    if (!body?.html) {
      return NextResponse.json({ ok: false, error: "Missing html" }, { status: 400 });
    }
    const rec = await Output.create({
      content: body.html,
      summary: JSON.stringify(body.summary ?? {}),
    });
    return NextResponse.json({ ok: true, id: rec.id });
  } catch (e) {
    console.error("POST /api/output failed:", e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await ensureSynced();
    const last = await Output.findOne({ order: [["createdAt", "DESC"]] });
    return NextResponse.json({ latest: last });
  } catch (e) {
    console.error("GET /api/output failed:", e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
