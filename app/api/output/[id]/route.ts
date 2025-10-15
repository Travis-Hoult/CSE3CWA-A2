// app/api/output/[id]/route.ts
// -----------------------------------------------------------------------------
// Provenance & Academic Integrity Notes
// - Pattern: Based directly on the “Dynamic Route Handlers” and “CRUD API Routes”
//   examples from lectures (Next.js App Router section).
// - Reuse: Follows the same Sequelize model pattern from /api/output route.
// - AI Assist: Helped refactor the TypeScript params typing (Next.js 15+ uses
//   async `params`), and added the type guard `asJsonObjectOrNull()` for safety
//   when coercing JSON input into DataTypes.JSON fields.
// -----------------------------------------------------------------------------
//
// Purpose:
// Provide record-level CRUD (GET, PUT, DELETE) for the Output table.
// - GET: Fetch single record by :id.
// - PUT: Update the HTML and/or summary fields for the given id.
// - DELETE: Remove a record by id.
//
// TypeScript Goals:
// - Ensure “summary” accepts object | null, not arbitrary primitives.
// - Aligns with Sequelize JSON column typing and prevents invalid DB writes.
// -----------------------------------------------------------------------------

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import Output from "@/models/Output";

/**
 * Helper: Normalize unknown incoming JSON to an object or null.
 * - `undefined` → leave field unchanged
 * - `null` → store as NULL
 * - object/array → accepted as-is (valid JSON)
 * - primitives (string/number/boolean) → coerced to null
 *
 * This guard helps avoid runtime DB type mismatches
 * when receiving flexible JSON from clients (lecture: “Validating API Input”).
 */
function asJsonObjectOrNull(v: unknown): object | null | undefined {
  if (v === undefined) return undefined; // don't change field
  if (v === null) return null;           // explicit null → set to NULL
  if (typeof v === "object") return v as object; // objects/arrays allowed
  return null; // fallback for primitives
}

// -----------------------------------------------------------------------------
// GET /api/output/:id
// -----------------------------------------------------------------------------
// Returns a single Output record if found, otherwise 404.
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  await Output.sync(); // ensure table exists
  const row = await Output.findByPk(Number(id));

  if (!row)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ row });
}

// -----------------------------------------------------------------------------
// PUT /api/output/:id
// -----------------------------------------------------------------------------
// Updates HTML and/or summary for a record.
// If fields are omitted, keeps the existing values unchanged.
export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  await Output.sync();
  const row = await Output.findByPk(Number(id));

  if (!row)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Parse the JSON safely; fallback to {} if malformed
  const body = (await req.json().catch(() => ({}))) as {
    html?: string;
    summary?: unknown;
  };

  // Determine new HTML (or keep old one)
  const nextHtml =
    typeof body.html === "string" ? body.html : (row.get("html") as string);

  // Determine new summary (or keep existing)
  const incomingSummary = asJsonObjectOrNull(body.summary);
  const nextSummary =
    incomingSummary === undefined
      ? (row.get("summary") as object | null)
      : incomingSummary;

  await row.update({
    html: nextHtml,
    summary: nextSummary,
  });

  return NextResponse.json({ ok: true });
}

// -----------------------------------------------------------------------------
// DELETE /api/output/:id
// -----------------------------------------------------------------------------
// Deletes a single Output record by id.
export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  await Output.sync();
  const row = await Output.findByPk(Number(id));

  if (!row)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  await row.destroy();
  return NextResponse.json({ ok: true });
}