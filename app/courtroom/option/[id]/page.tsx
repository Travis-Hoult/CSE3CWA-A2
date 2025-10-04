// app/courtroom/option/[id]/page.tsx
import { getOption } from "@/lib/courtroom/options";

export default function OptionPage({ params }: { params: { id: string } }) {
  const opt = getOption(params.id);

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f8f8f8", padding: 16 }}>
      <div style={{ width: "min(92vw, 680px)", background: "#fff", border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
        {!opt ? (
          <>
            <h1 style={{ marginTop: 0 }}>Option not found</h1>
            <a href="/courtroom" style={{ textDecoration: "underline" }}>Back to Courtroom</a>
          </>
        ) : (
          <>
            <h1 style={{ marginTop: 0 }}>{opt.title}</h1>
            <p><strong>Category:</strong> {opt.verdictCategory}</p>
            <p>{opt.text}</p>
            <h3>Reusable JSON</h3>
            <pre style={{ background: "#f5f5f5", padding: 8, borderRadius: 8, overflow: "auto" }}>{JSON.stringify(opt, null, 2)}</pre>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button onClick={() => navigator.clipboard.writeText(JSON.stringify(opt))}
                      style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #777", background: "#f5f5f5", cursor: "pointer" }}>
                Copy JSON
              </button>
              <a href="/courtroom" style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #111", background: "#fff" }}>
                Back to Courtroom
              </a>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
