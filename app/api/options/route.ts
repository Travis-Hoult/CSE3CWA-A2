// app/api/options/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { BASE_OPTIONS } from "@/lib/courtroom/options";

type LambdaPayload = {
  options?: unknown;
};

// Type guard: ensure payload.options is an array
function isOptionArray(x: unknown): x is unknown[] {
  return Array.isArray(x);
}

export async function GET(request: Request) {
  const url = process.env.LAMBDA_URL?.trim();
  const diag = new URL(request.url).searchParams.get("diag") === "1";

  // Always no-cache for clarity during demos
  const baseHeaders = {
    "Cache-Control": "no-store",
    "Content-Type": "application/json",
  } as const;

  // If no env var, it's definitively "local"
  if (!url) {
    return NextResponse.json(
      {
        source: "local",
        options: BASE_OPTIONS,
        ...(diag && {
          diagnostics: {
            lambdaEnvPresent: false,
            usedUrl: null as string | null,
            fetchOk: null as boolean | null,
            status: null as number | null,
          },
        }),
      },
      { headers: baseHeaders }
    );
  }

  // Try Lambda with a short timeout
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);

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
    status = r.status;

    // Safely parse JSON without `any`
    let data: LambdaPayload | null = null;
    try {
      data = (await r.json()) as LambdaPayload;
    } catch {
      data = null;
    }

    const options = data && isOptionArray(data.options) ? (data.options as unknown[]) : null;

    if (r.ok && options) {
      fetchOk = true;
      return new NextResponse(
        JSON.stringify({
          source: "lambda" as const,
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
    // swallow — fall back below
  } finally {
    clearTimeout(timer);
  }

  // Fallback
  return new NextResponse(
    JSON.stringify({
      source: "fallback" as const,
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