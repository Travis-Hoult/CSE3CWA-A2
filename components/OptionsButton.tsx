// components/OptionsButton.tsx
"use client";
import { useState } from "react";
import type { Option } from "@/lib/courtroom/options";

type Payload = { source: "local" | "lambda" | "fallback"; options: Option[] };

export default function OptionsButton() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<Payload | null>(null);

  async function load() {
    const r = await fetch("/api/options");
    const json: Payload = await r.json();
    setData(json);
    setOpen(true);
  }

  return (
    <>
      <button
        onClick={load}
        style={{ fontSize: 16, marginLeft: 8, padding: "10px 14px", borderRadius: 8, border: "2px solid #111", background: "#fff", cursor: "pointer" }}
      >
        Generate Options
      </button>

      {open && data && (
        <div role="dialog" aria-modal="true" aria-label="Options"
             style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", display: "grid", placeItems: "center", padding: 16, zIndex: 50 }}
             onClick={() => setOpen(false)}>
          <div style={{ background: "#fff", border: "1px solid #ccc", borderRadius: 12, padding: 16, width: "min(92vw, 560px)" }}
               onClick={(e) => e.stopPropagation()}>
            <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <strong>Generated Options</strong>
              <small style={{ color: "#666" }}>source: {data.source}</small>
            </header>

            <div style={{ display: "grid", gap: 10 }}>
              {data.options.map(o => (
                <div key={o.id} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <div style={{ fontWeight: 700 }}>{o.title}</div>
                    <span style={{ fontSize: 12, border: "1px solid #333", borderRadius: 6, padding: "2px 6px" }}>{o.verdictCategory}</span>
                  </div>
                  <p style={{ margin: "6px 0" }}>{o.text}</p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <a href={`/courtroom/option/${o.id}`} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #111", background: "#fff" }}>
                      Open Page
                    </a>
                    <button onClick={() => navigator.clipboard.writeText(JSON.stringify(o))}
                            style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #777", background: "#f5f5f5", cursor: "pointer" }}>
                      Copy JSON
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 12, textAlign: "right" }}>
              <button onClick={() => setOpen(false)} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #aaa", background: "#fff" }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
