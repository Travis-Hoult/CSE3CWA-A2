"use client";
import { useParams, useRouter } from "next/navigation";
import { getOption } from "@/lib/courtroom/options";

export default function OptionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id ?? "";
  const opt = getOption(id);

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f8f8f8", padding: 16 }}>
      <div style={{ width: "min(92vw, 680px)", background: "#fff", border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
        {!opt ? (
          <>
            <h1 style={{ marginTop: 0 }}>Option not found</h1>
            <button onClick={() => router.push("/courtroom")} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #111", background: "#fff" }}>
              Back to Courtroom
            </button>
          </>
        ) : (
          <>
            <h1 style={{ marginTop: 0 }}>{opt.title}</h1>
            <p><strong>Category:</strong> {opt.verdictCategory}</p>
            <p>{opt.text}</p>

            <h3>Reusable JSON</h3>
            <pre style={{ background: "#f5f5f5", padding: 8, borderRadius: 8, overflow: "auto" }}>
{JSON.stringify(opt, null, 2)}
            </pre>

            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button
                onClick={async () => {
                  try { await navigator.clipboard.writeText(JSON.stringify(opt)); alert("Copied!"); }
                  catch { alert("Copy failed—select the JSON and copy manually."); }
                }}
                style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #777", background: "#f5f5f5", cursor: "pointer" }}
              >
                Copy JSON
              </button>

              {/* Save full scenario (with bias) */}
              <button
                onClick={() => {
                  try { localStorage.setItem("cwa.selectedScenario", JSON.stringify(opt)); } catch {}
                  router.push("/courtroom");
                }}
                style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #111", background: "#111", color: "#fff", cursor: "pointer" }}
              >
                Use this scenario
              </button>

              <button
                onClick={() => router.push("/courtroom")}
                style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #111", background: "#fff", cursor: "pointer" }}
              >
                Back to Courtroom
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
