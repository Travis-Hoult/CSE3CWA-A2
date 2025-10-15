// app/api/progress/route.ts
// -----------------------------------------------------------------------------
// Provenance & Academic Integrity Notes
// - Pattern: Based on lecture examples for “CRUD API Routes with App Router”
//   (GET collection + POST create) and Sequelize usage shown in class.
// - Reuse: Mirrors the structure already used in /api/output (list + create).
// - AI Assist: Helped draft explanatory comments and clarify the date parsing
//   for POST, but the CRUD shape and logic follow the lecture materials.
// -----------------------------------------------------------------------------
//
// Purpose:
// Collection-level CRUD endpoints for the Progress table (list + create).
//   • GET  /api/progress  -> return recent progress rows (ordered by id DESC)
//   • POST /api/progress  -> create a new progress record
//
// Model fields saved here (see models/Progress.ts):
//   - startedAt       (Date)    : when the run began (defaults to now)
//   - finishedAt      (Date|null)
//   - verdictCategory (string|null)
//   - notes           (string|null)
//
// Notes:
// - `Progress.sync()` is kept here for simplicity so tables exist during dev
//   and in Docker. In larger apps you’d move sync/migrations elsewhere.
// - Input is parsed defensively: malformed JSON → {} without throwing.
// -----------------------------------------------------------------------------

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import Progress from "@/models/Progress";

// Narrow body shape for safer parsing; all fields optional on POST.
type ProgressBody = {
  startedAt?: string;
  finishedAt?: string | null;
  verdictCategory?: string | null;
  notes?: string | null;
};

// -----------------------------------------------------------------------------
// GET /api/progress
// Returns up to 50 most-recent progress records.
// -----------------------------------------------------------------------------
export async function GET() {
  await Progress.sync(); // ensure table exists (lecture: dev-friendly sync)
  const rows = await Progress.findAll({ order: [["id", "DESC"]], limit: 50 });
  return NextResponse.json({ rows });
}

// -----------------------------------------------------------------------------
// POST /api/progress
// Creates a new progress record. Dates are accepted as ISO-8601 strings.
// If startedAt is missing, defaults to "now". finishedAt is nullable.
// -----------------------------------------------------------------------------
export async function POST(req: Request) {
  await Progress.sync();

  // Safe parse: on failure, treat as empty object (lecture: resilient APIs)
  const body = (await req.json().catch(() => ({}))) as Partial<ProgressBody>;

  const rec = await Progress.create({
    // If client supplies startedAt, use it; otherwise default to Date.now()
    startedAt: body.startedAt ? new Date(body.startedAt) : new Date(),
    // Allow null (run not finished yet) or a valid date
    finishedAt: body.finishedAt ? new Date(body.finishedAt) : null,
    verdictCategory: body.verdictCategory ?? null,
    notes: body.notes ?? null,
  });

  return NextResponse.json({ ok: true, id: rec.id });
}