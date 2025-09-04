import { NextResponse } from "next/server";

export async function GET() {
  const tasks = [
    { id: "t1", text: "Boss: Are you done with Sprint 1?", critical: false },
    { id: "t2", text: "Fix alt on <img id='img1'> (accessibility)", critical: true },
    { id: "t3", text: "Fix input validation on login form (security)", critical: true },
  ];
  return NextResponse.json({ tasks });
}
