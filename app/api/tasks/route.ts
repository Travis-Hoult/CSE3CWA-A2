// app/api/tasks/route.ts
// -----------------------------------------------------------------------------
// Provenance & Academic Integrity Notes
// - Source pattern: Simple read-only API route as shown in lectures (returning
//   in-memory data). Mirrors earlier examples of `GET` handlers in Next.js App
//   Router.
// - Reuse: Serves the same `tasks` array used by the game UI (imported from
//   lib/courtroom/tasks). This demonstrates code reuse between API and client.
// - AI Assist: Only for adding these comments and clarifying intent. No logic
//   changes have been made.
// -----------------------------------------------------------------------------
//
// Purpose:
// Expose the static list of courtroom tasks as a JSON endpoint so external tools
// (tests, JMeter, Lighthouse fetches, or other clients) can retrieve the same
// data the UI consumes.
//
// Route:
//   GET /api/tasks  -> { tasks: [...] }
//
// Notes:
// - Keeping this read-only and simple aligns with the minimal API examples from
//   the lectures. Any authoring/mutation of tasks remains in source code.
// -----------------------------------------------------------------------------

import { NextResponse } from "next/server";
import { tasks } from "../../../lib/courtroom/tasks";

export async function GET() {
  return NextResponse.json({ tasks });
}