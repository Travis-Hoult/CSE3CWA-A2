// components/CodingTaskPanel.tsx
"use client";
import { useEffect, useMemo, useRef, useState } from "react";

export type VerdictTrigger = (category: string, verdict: string) => void;

const STAGE_META: Array<{ category: string; verdict: string }> = [
  { category: "accessibility",  verdict: "Charged under Disability Act for missing alt text." },
  { category: "security-input", verdict: "Negligence → data breach via input validation flaw." },
  { category: "auth",           verdict: "Business failure: essential feature missed under deadline." },
];

export default function CodingTaskPanel({
  gameStarted,
  nowTick,             // ⟵ increments once per second from the parent
  onVerdict,
  onWin,               // ⟵ NEW: parent can stop main timer when tasks are done
  onRestart,           // ⟵ NEW: optional parent-controlled restart
}: {
  gameStarted: boolean;
  nowTick: number;
  onVerdict: VerdictTrigger;
  onWin?: () => void;
  onRestart?: () => void;
}) {
  // which stage (0..2). when it reaches 3, all done.
  const [step, setStep] = useState(0);

  // when the current step’s 60s window began
  const [stepStartAt, setStepStartAt] = useState<number | null>(null);

  // ensure we only fire verdict once per task timeout
  const firedRef = useRef(false);

  // reset & start the per-task window whenever Start is pressed or step changes
  useEffect(() => {
    if (!gameStarted || step >= 3) {
      setStepStartAt(null);
      firedRef.current = false;
      return;
    }
    setStepStartAt(Date.now());
    firedRef.current = false;
  }, [gameStarted, step]);

  // remaining seconds (0..60), derived from the parent’s tick
  const remain = useMemo(() => {
    if (!gameStarted || step >= 3 || stepStartAt == null) return 60;
    const elapsed = Math.floor((Date.now() - stepStartAt) / 1000);
    const left = 60 - elapsed;
    return Math.max(0, Math.min(60, left));
  }, [nowTick, gameStarted, step, stepStartAt]);

  // trigger dynamic verdict when time runs out
  useEffect(() => {
    if (!gameStarted || step >= 3) return;
    if (remain === 0 && !firedRef.current) {
      firedRef.current = true;
      const meta = STAGE_META[step] ?? STAGE_META[STAGE_META.length - 1];
      onVerdict(meta.category, meta.verdict);
    }
  }, [remain, gameStarted, step, onVerdict]);

  // When all stages complete → notify parent to stop the game timer
  const allDone = step >= 3;
  const notifiedWin = useRef(false);
  useEffect(() => {
    if (allDone && !notifiedWin.current) {
      notifiedWin.current = true;
      onWin?.();
    }
    if (!allDone) {
      notifiedWin.current = false;
    }
  }, [allDone, onWin]);

  // ── Stage checks ───────────────────────────────────────────────────────────
  // Stage 1: Add alt to #img1
  const [html, setHtml] = useState(`<img id="img1" src="/images/example.png">`);
  const s1Passed = useMemo(() => {
    try {
      const doc = new DOMParser().parseFromString(html, "text/html");
      const el = doc.querySelector("#img1");
      return !!(el && el.getAttribute("alt"));
    } catch { return false; }
  }, [html]);

  // Stage 2: non-empty username/password
  const [u, setU] = useState(""); const [p, setP] = useState("");
  const s2Passed = u.trim().length > 0 && p.trim().length > 0;

  // Stage 3: CSV numbers 0..20 inclusive
  const [nums, setNums] = useState("");
  const s3Passed = useMemo(() => {
    const parts = nums.split(",").map(s => s.trim()).filter(Boolean);
    if (parts.length !== 21) return false;
    for (let i = 0; i <= 20; i++) if (String(i) !== parts[i]) return false;
    return true;
  }, [nums]);

  // ── styles ─────────────────────────────────────────────────────────────────
  const card: React.CSSProperties = {
    background: "rgba(255,255,255,0.98)",
    border: "1px solid #ccc",
    borderRadius: 12,
    padding: 20,
    width: "min(92vw, 560px)",
    boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
    display: "grid",
    gap: 12,
  };

  const timerBadge: React.CSSProperties = {
    alignSelf: "center",
    justifySelf: "center",
    border: "2px solid #111",
    borderRadius: 10,
    padding: "6px 10px",
    fontWeight: 800,
    fontVariantNumeric: "tabular-nums",
  };

  return (
    <aside aria-label="Coding tasks" style={card}>
      <header style={{ display: "grid", gap: 6, justifyItems: "center" }}>
        <h2 style={{ margin: 0 }}>Coding Tasks</h2>
        {!allDone && (
          <>
            <small style={{ color: "#555" }}>
              {gameStarted ? `Task ${step + 1} of 3` : "Press Start to begin"}
            </small>
            {gameStarted && (
              <div style={timerBadge}>
                ⏳ Task time: {String(Math.floor(remain / 60)).padStart(2,"0")}:{String(remain % 60).padStart(2,"0")}
              </div>
            )}
          </>
        )}
      </header>

      {/* Completed -> WIN SCREEN */}
      {allDone && (
        <section aria-live="polite" style={{ textAlign: "center" }}>
          <strong style={{ color: "green" }}>✓ All stages complete — You win!</strong>
          <p style={{ marginTop: 8 }}>Nice! You finished all coding tasks before the deadline.</p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <button
              onClick={() => {
                if (onRestart) onRestart();
                // local reset so the panel is ready if parent restarts the game
                setStep(0);
                setHtml(`<img id="img1" src="/images/example.png">`);
                setU(""); setP("");
                setNums("");
              }}
              style={{ padding: "8px 12px", borderRadius: 8, border: "2px solid #111", background: "#111", color: "#fff", cursor: "pointer" }}
            >
              PLAY AGAIN
            </button>
            <button
              onClick={() => { window.location.assign("/"); }}
              style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #111", background: "#fff", cursor: "pointer" }}
            >
              QUIT
            </button>
          </div>
        </section>
      )}

      {/* Stage 1 */}
      {!allDone && step === 0 && (
        <section>
          <strong>Stage 1 — Accessibility</strong>
          <p style={{ margin: "6px 0" }}>
            Add an <code>alt</code> attribute to <code>#img1</code>.
          </p>
          <textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            rows={4}
            style={{ width: "100%", fontFamily: "monospace" }}
            aria-label="HTML editor for Stage 1"
            disabled={!gameStarted}
          />
          <div aria-live="polite" style={{ marginTop: 6, fontWeight: 700, color: s1Passed ? "green" : "#b00000" }}>
            {s1Passed ? "✓ Alt present" : "✗ Alt missing"}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button
              onClick={() => setHtml(`<img id="img1" src="/images/example.png">`)}
              style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #aaa", background: "#fff", cursor: "pointer" }}
              disabled={!gameStarted}
            >
              Reset
            </button>
            <button
              disabled={!gameStarted || !s1Passed}
              onClick={() => setStep(1)}
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                border: "2px solid #111",
                background: gameStarted && s1Passed ? "#111" : "#eee",
                color: gameStarted && s1Passed ? "#fff" : "#999",
                cursor: gameStarted && s1Passed ? "pointer" : "not-allowed",
                fontWeight: 700,
                marginLeft: "auto",
              }}
            >
              Next task →
            </button>
          </div>
        </section>
      )}

      {/* Stage 2 */}
      {!allDone && step === 1 && (
        <section>
          <strong>Stage 2 — Input Validation</strong>
          <p style={{ margin: "6px 0" }}>
            Ensure username and password are <em>not empty</em>.
          </p>
          <div style={{ display: "grid", gap: 8 }}>
            <input placeholder="username" value={u} onChange={(e) => setU(e.target.value)} aria-label="Username" disabled={!gameStarted} />
            <input placeholder="password" type="password" value={p} onChange={(e) => setP(e.target.value)} aria-label="Password" disabled={!gameStarted} />
          </div>
          <div aria-live="polite" style={{ marginTop: 6, fontWeight: 700, color: s2Passed ? "green" : "#b00000" }}>
            {s2Passed ? "✓ Valid (non-empty)" : "✗ Empty values not allowed"}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button
              onClick={() => { setU(""); setP(""); }}
              style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #aaa", background: "#fff", cursor: "pointer" }}
              disabled={!gameStarted}
            >
              Reset
            </button>
            <button
              disabled={!gameStarted || !s2Passed}
              onClick={() => setStep(2)}
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                border: "2px solid #111",
                background: gameStarted && s2Passed ? "#111" : "#eee",
                color: gameStarted && s2Passed ? "#fff" : "#999",
                cursor: gameStarted && s2Passed ? "pointer" : "not-allowed",
                fontWeight: 700,
                marginLeft: "auto",
              }}
            >
              Next task →
            </button>
          </div>
        </section>
      )}

      {/* Stage 3 */}
      {!allDone && step === 2 && (
        <section>
          <strong>Stage 3 — Transform</strong>
          <p style={{ margin: "6px 0" }}>
            Enter numbers <code>0..20</code> as CSV (e.g., <code>0,1,2,...,20</code>).
          </p>
          <textarea
            value={nums}
            onChange={(e) => setNums(e.target.value)}
            rows={3}
            style={{ width: "100%", fontFamily: "monospace" }}
            aria-label="CSV input for Stage 3"
            disabled={!gameStarted}
          />
          <div aria-live="polite" style={{ marginTop: 6, fontWeight: 700, color: s3Passed ? "green" : "#b00000" }}>
            {s3Passed ? "✓ Sequence correct" : "✗ Not exactly 0..20"}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button
              onClick={() => setNums("")}
              style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #aaa", background: "#fff", cursor: "pointer" }}
              disabled={!gameStarted}
            >
              Reset
            </button>
            <button
              disabled={!gameStarted || !s3Passed}
              onClick={() => setStep(3)}
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                border: "2px solid #111",
                background: gameStarted && s3Passed ? "#111" : "#eee",
                color: gameStarted && s3Passed ? "#fff" : "#999",
                cursor: gameStarted && s3Passed ? "pointer" : "not-allowed",
                fontWeight: 700,
                marginLeft: "auto",
              }}
            >
              Finish ✓
            </button>
          </div>
        </section>
      )}
    </aside>
  );
}