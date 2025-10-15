// app/api/health/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { sequelize } from "@/lib/db"; // <-- named import

export async function GET() {
  const start = Date.now();
  try {
    await sequelize.authenticate();
    return NextResponse.json({
      ok: true,
      db: "up",
      elapsedMs: Date.now() - start,
    });
  } catch (e: unknown) {
    return NextResponse.json(
      {
        ok: false,
        db: "down",
        error: e instanceof Error ? e.message : String(e),
      },
      { status: 500 }
    );
  }
}