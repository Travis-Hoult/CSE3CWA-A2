// app/api/options/route.ts
/**
 * Purpose: Provide scenario "options" for the Courtroom game.
 * Behavior:
 *   1) If no LAMBDA_URL → return BASE_OPTIONS as "local".
 *   2) If LAMBDA_URL is set → POST to Lambda, parse result safely → if OK use "lambda".
 *   3) If Lambda fails or payload invalid → return BASE_OPTIONS as "fallback".
 *
 * Provenance / Reuse notes:
 * - Lecture reuse: "API route patterns in Next.js App Router" + "using environment variables".
 * - Reuse: BASE_OPTIONS imported from lib/courtroom/options (local constant dataset).
 * - AI assist: Added strict typing (no `any`), a type guard for payload, and a short abortable timeout
 *   to keep the UI snappy; also added optional diagnostics to help demonstrate Lambda vs fallback paths.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { BASE_OPTIONS } from "@/lib/courtroom/options";

// Minimal shape of the Lambda response we care about
type LambdaPayload = {
  options?: unknown;
};

// Type guard: ensure payload.options is an array without using `any`
function isOptionArray(x: unknown): x is unknown[] {
  return Array.isArray(x);
}

export async function GET(request: Request) {
  const url = process.env.LAMBDA_URL?.trim();
  const diag = new URL(request.url).searchParams.get("diag") === "1";

  // Always no-cache (so "source: local|lambda|fallback" is immediately visible in demos)
  const baseHeaders = {
    "Cache-Control": "no-store",
    "Content-Type": "application/json",
  } as const;

  // 1) No Lambda configured → definitive local
  if (!url) {
    return NextResponse.json(
      {
        source: "local" as const,
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

  // 2) Try Lambda with a short timeout to avoid hanging the UI
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

    // Parse result safely, no `any`
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
    // Swallow and fall back below.
  } finally {
    clearTimeout(timer);
  }

  // 3) Fallback to built-in options if Lambda failed or payload invalid
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