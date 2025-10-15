// app/api/output/route.ts
// -----------------------------------------------------------------------------
// Provenance & Academic Integrity Notes
// - Pattern: Next.js App Router API route handlers (GET/POST), as taught in lectures
//   (topic: “Server Routes / API Routes in App Router”) and adapted from course demos.
// - Reuse: Reuses the project’s Sequelize model `Output` (models/Output.ts) and the
//   standard “sync → query → respond” flow used elsewhere (e.g., /api/health).
// - AI Assist: Used to structure explanatory comments, add lightweight types for clarity,
//   and improve readability without altering behavior.
// -----------------------------------------------------------------------------
//
// What this route does
// - GET  /api/output  → returns latest 50 saved “Output” records (id, html, summary, timestamps).
// - POST /api/output  → validates `html` in the JSON body, inserts a new Output row (html + summary),
//                        and returns the new id.
// Notes
// - We call `Output.sync()` inside each handler to keep setup simple for the assignment.
//   (In production, you’d typically run migrations once at startup.)
// - Responses are explicitly JSON and the route is force-dynamic so results are never cached.
// -----------------------------------------------------------------------------

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import Output from "@/models/Output";

// Minimal request body shape (kept intentionally light for the assignment)
type OutputBody = { html: string; summary?: unknown };

// GET /api/output
// Returns the newest 50 output rows (for quick verification and marking evidence)
export async function GET() {
  await Output.sync(); // simple ensure-table-exists approach for the assignment
  const rows = await Output.findAll({ order: [["id", "DESC"]], limit: 50 });
  return NextResponse.json({ rows });
}

// POST /api/output
// Persists a new output document (HTML snapshot + optional summary JSON)
export async function POST(req: Request) {
  await Output.sync();

  // Parse JSON safely; if parsing fails, we fall back to empty object
  const body = (await req.json().catch(() => ({}))) as Partial<OutputBody>;

  // Basic validation: html is required (assignment spec)
  if (!body.html || typeof body.html !== "string") {
    return NextResponse.json(
      { error: "html (string) is required" },
      { status: 400 }
    );
  }

  // Create a record; summary can be any JSON-serializable shape (stored as JSON)
  const rec = await Output.create({
    html: body.html,
    summary: body.summary ?? null,
  });

  // Respond with the new id so tests/markers can immediately verify via GET
  return NextResponse.json({ ok: true, id: rec.id });
}