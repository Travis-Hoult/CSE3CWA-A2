// components/OptionsButton.tsx
// -----------------------------------------------------------------------------
// Provenance & Academic Integrity Notes
// - Source pattern: Client-side modal + fetch pattern mirrors lectures on
//   React useState/useEffect, conditional portals, and App Router API routes.
// - Reuse:
//   • Uses the existing /api/options contract and the Option type from
//     "@/lib/courtroom/options" to keep UI/data shapes consistent.
//   • Persists the selected scenario under "cwa.selectedScenario" in localStorage,
//     which is the same key read elsewhere in the app (e.g., CourtroomGame).
// - AI Assist: Commenting/annotation only — no functional changes were made.
//   Clarified error handling, provenance, and a11y notes in comments.
// - External references: Next.js client components + createPortal usage as
//   discussed in class and in the official React/Next.js docs.
// -----------------------------------------------------------------------------
//
// What this component does
// - Renders a “Generate Options” button that, when clicked, fetches options
//   from /api/options (local list, Lambda, or fallback) and shows a modal.
// - Lets the user “Use Scenario”, which saves the chosen scenario JSON to
//   localStorage so other parts of the app can read/reflect it.
//
// Key interaction points
// - load(): fetches options with no-store caching and opens the modal.
// - selectScenario(): stores selection in localStorage and notifies parent via
//   onSelected (so the parent can refresh its scenario preview).
// - Modal uses createPortal to render at document.body level for proper z-index.
//
// Accessibility notes
// - Modal has role="dialog" and aria-modal="true". Clicking the backdrop closes
//   the dialog; clicks inside are stopped from propagating.
// - Buttons and links have clear labels; inline styles keep text readable.
//
// Dark mode / theming
// - The modal container includes ".options-modal" so other components can
//   enforce black-on-white text locally if needed (see CourtroomGame’s <style>).
// -----------------------------------------------------------------------------

"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Option } from "@/lib/courtroom/options";

type Payload = { source: "local" | "lambda" | "fallback"; options: Option[] };

export default function OptionsButton({
  label = "Generate Options",
  onSelected,
}: {
  label?: string;
  onSelected?: (opt: Option) => void;
}) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<Payload | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  async function load() {
    setErr(null);
    try {
      const r = await fetch("/api/options", { cache: "no-store" });
      const json: Payload = await r.json();
      setData(json);
      setOpen(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to load options";
      setErr(msg);
      setOpen(true);
    }
  }

  function selectScenario(opt: Option) {
    try {
      localStorage.setItem("cwa.selectedScenario", JSON.stringify(opt));
    } catch {}
    if (onSelected) onSelected(opt);
    setOpen(false);
  }

  const modal = open && (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Options"
      onClick={() => setOpen(false)}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "grid",
        placeItems: "center",
        padding: 16,
        zIndex: 10_000,
      }}
    >
      <div
        className="options-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(92vw, 680px)",
          background: "#fff",
          border: "1px solid #ddd",
          borderRadius: 16,
          padding: 16,
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
          // Force all text inside the modal to render black, regardless of theme
          color: "#000",
        }}
      >
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
          <h2 style={{ margin: 0 }}>Choose Your Scenario</h2>
          {data?.source && <small style={{ color: "#666" }}>source: {data.source}</small>}
        </header>

        {err && <p style={{ color: "#b00000" }}>{err}</p>}

        {!err && data && (
          <div style={{ display: "grid", gap: 12 }}>
            {data.options.map((o) => (
              <div key={o.id} style={{ border: "1px solid #e5e5e5", borderRadius: 12, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <div style={{ fontWeight: 800, fontSize: 18 }}>{o.title}</div>
                  <span style={{ fontSize: 12, border: "1px solid #111", borderRadius: 999, padding: "2px 8px" }}>
                    {o.verdictCategory}
                  </span>
                </div>
                <p style={{ margin: "8px 0 10px" }}>{o.text}</p>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  <li>Favours: <strong>{o.bias?.categories?.join(", ") || o.verdictCategory}</strong></li>
                  <li>Alert cadence: <strong>~{Math.round((o.bias?.messageIntervalMs ?? 28_000)/1000)}s</strong></li>
                  <li>Critical grace: <strong>{Math.round((o.bias?.criticalGraceMs ?? 60_000)/1000)}s</strong></li>
                </ul>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                  <button
                    onClick={() => selectScenario(o)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "2px solid #444",
                      background: "#ccc",
                      color: "#000",
                      cursor: "pointer",
                    }}
                  >
                    Use Scenario
                  </button>

                  <a
                    href={`/courtroom/option/${o.id}`}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "1px solid #111",
                      background: "#fff",
                      // ensure link text is black even if global theme flips links
                      color: "#000",
                    }}
                  >
                    Open Page
                  </a>

                  <button
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(JSON.stringify(o, null, 2));
                        alert("Copied!");
                      } catch {
                        alert("Copy failed—please copy manually.");
                      }
                    }}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "1px solid #777",
                      background: "#f5f5f5",
                      cursor: "pointer",
                    }}
                  >
                    Copy JSON
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 14, textAlign: "right" }}>
          <button
            onClick={() => setOpen(false)}
            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #aaa", background: "#fff", cursor: "pointer" }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={load}
        style={{
          fontSize: 16,
          padding: "10px 14px",
          borderRadius: 8,
          border: "2px solid #111",
          background: "#fff",
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </button>

      {mounted && modal && createPortal(modal, document.body)}
    </>
  );
}