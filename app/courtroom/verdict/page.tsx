// app/courtroom/verdict/page.tsx
"use client";
import { useEffect, useState } from "react";

type V = { taskId?: string|null; category?: string|null; verdict?: string|null };

export default function Verdict() {
  const [v, setV] = useState<V | null>(null);
  useEffect(() => {
    try { const raw = sessionStorage.getItem("verdict"); if (raw) setV(JSON.parse(raw)); } catch {}
  }, []);

  const line = v?.verdict ?? "You ignored a critical issue.";

  return (
    <main
      aria-label="Courtroom verdict"
      style={{
        position: "relative",
        minHeight: "100vh",
        backgroundColor: "#000",
        backgroundImage: "url('/images/jail-cell.png')",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center center",
        backgroundSize: "cover",
      }}
    >
      <div
        style={{
          position: "absolute", left: 0, right: 0, bottom: 0,
          background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.65) 40%, rgba(0,0,0,0.9) 100%)",
          padding: "24px 16px", minHeight: "30vh", display: "flex", alignItems: "flex-end",
        }}
      >
        <div style={{ width: "100%", maxWidth: 720, margin: "0 auto", color: "#fff", textAlign: "center" }}>
          <h1 style={{ margin: "0 0 8px", fontSize: 32 }}>Courtroom Verdict</h1>
          <p style={{ margin: "0 0 16px", lineHeight: 1.5 }}>{line}</p>
          <a
            href="/courtroom"
            role="button"
            style={{
              display: "inline-block", marginTop: 8, padding: "10px 16px",
              borderRadius: 10, border: "2px solid #111", background: "#fff",
              color: "#111", fontWeight: 800, textDecoration: "none", cursor: "pointer",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            }}
          >
            PLAY AGAIN
          </a>
        </div>
      </div>
    </main>
  );
}
