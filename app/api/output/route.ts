import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json(); // { html, summary }
  // DB wiring comes next step; for now just acknowledge
  return NextResponse.json({ ok: true, received: !!body?.html });
}
