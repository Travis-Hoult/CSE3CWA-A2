// app/api/options/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { BASE_OPTIONS } from "@/lib/courtroom/options";

export async function GET(request: Request) {
  const url = process.env.LAMBDA_URL?.trim();
  const diag = new URL(request.url).searchParams.get("diag") === "1";

  // Always no-cache for clarity during demos
  const baseHeaders = {
    "Cache-Control": "no-store",
    "Content-Type": "application/json",
  };

  // If no env var, it's definitively "local"
  if (!url) {
    return NextResponse.json(
      {
        source: "local",
        options: BASE_OPTIONS,
        ...(diag && {
          diagnostics: {
            lambdaEnvPresent: false,
            usedUrl: null,
            fetchOk: null,
            status: null,
          },
        }),
      },
      { headers: baseHeaders }
    );
  }

  // Try Lambda with a short timeout
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 4000);

  let fetchOk = false;
  let status: number | null = null;
  try {
    const r = await fetch(url, {
      method: "POST",
      body: JSON.stringify({ n: 3 }),
      signal: controller.signal,
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    clearTimeout(t);
    status = r.status;
    const data = await r.json().catch(() => ({} as any));
    const options = Array.isArray(data?.options) ? data.options : null;

    if (r.ok && options) {
      fetchOk = true;
      return new NextResponse(
        JSON.stringify({
          source: "lambda",
          options,
          ...(diag && {
            diagnostics: {
              lambdaEnvPresent: true,
              usedUrl: url,
              fetchOk: true,
              status,
            },
          }),
        }),
        { headers: { ...baseHeaders, "x-options-source": "lambda" } }
      );
    }
  } catch {
    clearTimeout(t);
  }

  // Fallback
  return new NextResponse(
    JSON.stringify({
      source: "fallback",
      options: BASE_OPTIONS,
      ...(diag && {
        diagnostics: {
          lambdaEnvPresent: true,
          usedUrl: url,
          fetchOk,
          status,
        },
      }),
    }),
    { headers: { ...baseHeaders, "x-options-source": "fallback" } }
  );
}
