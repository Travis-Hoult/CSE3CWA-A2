// app/api/tasks/route.ts
import { NextResponse } from "next/server";
import { tasks } from "../../../lib/courtroom/tasks";

export async function GET() {
  return NextResponse.json({ tasks });
}
