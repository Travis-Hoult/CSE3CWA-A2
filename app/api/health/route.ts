// app/api/health/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import sequelize from "@/lib/db";

export async function GET() {
  const start = Date.now();
  let db: "ok" | "down" | "skip" = "skip";

  try {
    // Try DB ping with a short timeout
    await Promise.race([
      sequelize.authenticate(),
      new Promise((_, rej) => setTimeout(() => rej(new Error("db-timeout")), 1000)),
    ]);
    db = "ok";
  } catch {
    db = "down";
  }

  const body = { ok: true, ts: Date.now(), db, durMs: Date.now() - start };
  const status = db === "down" ? 503 : 200;

  return new NextResponse(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
