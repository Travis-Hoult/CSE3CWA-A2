// app/api/health/route.ts
/**
 * Purpose: Simple health check that also verifies DB connectivity.
 *
 * Provenance / Reuse notes:
 * - Lecture pattern: “Health endpoint + DB ping” (Wk 5/6 demos).
 * - Reuse: Calls the shared Sequelize instance from lib/db.ts (single-connection module).
 * - AI assist: Added elapsedMs timing + robust error serialization (unknown → string).
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { sequelize } from "@/lib/db"; // named import from our shared Sequelize singleton

export async function GET() {
  const start = Date.now();
  try {
    // Verify DB credentials + connection (works for SQLite and Postgres)
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