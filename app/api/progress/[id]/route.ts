// app/api/progress/[id]/route.ts
// -----------------------------------------------------------------------------
// Provenance & Academic Integrity Notes
// - Pattern: Based on lecture examples for dynamic App Router routes
//   (/api/resource/[id]) handling GET/PUT/DELETE with Sequelize.
// - Reuse: Mirrors structure used elsewhere in this project (e.g. Output id route).
// - AI Assist: Helped write explanatory comments and tighten input narrowing;
//   endpoint behaviour follows the lecture materials and prior code patterns.
// -----------------------------------------------------------------------------
//
// Purpose:
// Item-level CRUD for a single Progress row:
//   • GET    /api/progress/:id  -> read one
//   • PUT    /api/progress/:id  -> update selected fields (finishedAt, verdictCategory, notes)
//   • DELETE /api/progress/:id  -> delete the record
//
// Notes:
// - `Progress.sync()` remains here for dev/demo convenience so the table exists
//   without a separate migration step. In larger apps, move sync/migrations out.
// - Body parsing is defensive: unknown/malformed JSON becomes an empty object.
// - Narrow updates only for the fields we allow to change.
// -----------------------------------------------------------------------------

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import Progress from "@/models/Progress";

// -----------------------------------------------------------------------------
// GET /api/progress/:id
// Returns a single Progress record by primary key.
// -----------------------------------------------------------------------------
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  await Progress.sync();
  const row = await Progress.findByPk(Number(id));
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ row });
}

// -----------------------------------------------------------------------------
// PUT /api/progress/:id
// Updates whitelisted fields. Each field is optional; if omitted, it is not
// modified. Dates are accepted as ISO strings; null clears the value.
// -----------------------------------------------------------------------------
export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  await Progress.sync();
  const row = await Progress.findByPk(Number(id));
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  type Body = {
    finishedAt?: string | null;
    verdictCategory?: string | null;
    notes?: string | null;
  };

  // Safe parse: on failure, treat as empty object (lecture pattern: resilient APIs)
  const body: Body = await req.json().catch(() => ({} as Body));

  // Build a minimal update object only with provided keys.
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

// -----------------------------------------------------------------------------
// DELETE /api/progress/:id
// Removes the record permanently.
// -----------------------------------------------------------------------------
export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  await Progress.sync();
  const row = await Progress.findByPk(Number(id));
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await row.destroy();
  return NextResponse.json({ ok: true });
}