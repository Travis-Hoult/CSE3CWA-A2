// app/about/page.tsx
"use client";

export default function AboutPage() {
  const box = {
    border: "1px solid #ddd",
    borderRadius: 12,
    padding: 12,
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
    background: "#fff",
  } as const;

  return (
    <main style={{ minHeight: "100vh", padding: 16, display: "grid", gap: 24 }}>
      <section style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ margin: "0 0 8px" }}>About This Project</h1>
        <p style={{ marginTop: 0 }}>
          This page includes the recorded presentations for Assessment 1 and Assessment 2.
        </p>

        <div style={{ ...box, marginTop: 16 }}>
          <h2 style={{ margin: "0 0 8px" }}>Assessment 1 Presentation</h2>
          <video
            controls
            preload="metadata"
            style={{ width: "100%", borderRadius: 8, background: "#000" }}
          >
            <source src="/videos/a1.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        <div style={{ ...box, marginTop: 24 }}>
          <h2 style={{ margin: "0 0 8px" }}>Assessment 2 Presentation</h2>
          <video
            controls
            preload="metadata"
            style={{ width: "100%", borderRadius: 8, background: "#000" }}
          >
            <source src="/videos/a2.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </section>
    </main>
  );
}