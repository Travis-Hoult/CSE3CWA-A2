// components/CourtroomGame.tsx
"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import CodingTaskPanel, { type VerdictTrigger } from "./CodingTaskPanel";
import { tasks as TASKS, type Task, type Category } from "@/lib/courtroom/tasks";

const MESSAGE_INTERVAL_MS = 28_000;
const CRITICAL_GRACE_MS = 60_000;

export default function CourtroomGame() {
  const [gameStarted, setGameStarted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(40 * 60);
  const [tick, setTick] = useState(0); // global 1s tick

  // alerts
  const [queue, setQueue] = useState<Task[]>(TASKS);
  const [stack, setStack] = useState<Task[]>([]);
  const top = stack.length ? stack[stack.length - 1] : null;

  const [criticalReviewOpen, setCriticalReviewOpen] = useState(false);

  // penalty (first unresolved critical)
  const [penaltyStartAt, setPenaltyStartAt] = useState<number | null>(null);
  const [penaltyTaskId, setPenaltyTaskId] = useState<string | null>(null);
  const [penaltyCategory, setPenaltyCategory] = useState<Category | null>(null);
  const [penaltyVerdict, setPenaltyVerdict] = useState<string | null>(null);

  // timers / flow guards
  const tickerRef = useRef<number | null>(null);
  const messageIntervalRef = useRef<number | null>(null);
  const verdictTimeoutRef = useRef<number | null>(null);
  const navigatingRef = useRef(false);

  // audio + run metadata
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startedAtRef = useRef<string | null>(null);

  function clearAllTimers() {
    if (tickerRef.current)          { window.clearInterval(tickerRef.current); tickerRef.current = null; }
    if (messageIntervalRef.current) { window.clearInterval(messageIntervalRef.current); messageIntervalRef.current = null; }
    if (verdictTimeoutRef.current)  { window.clearTimeout(verdictTimeoutRef.current); verdictTimeoutRef.current = null; }
  }
  function resetPenalty() {
    setPenaltyStartAt(null);
    setPenaltyTaskId(null);
    setPenaltyCategory(null);
    setPenaltyVerdict(null);
    if (verdictTimeoutRef.current) { window.clearTimeout(verdictTimeoutRef.current); verdictTimeoutRef.current = null; }
  }

  async function primeVerdictSound() {
    try {
      const a = audioRef.current;
      if (!a) return;
      a.muted = true;
      await a.play(); // user-gesture initiated (Start)
      a.pause();
      a.currentTime = 0;
      a.muted = false;
    } catch {}
  }

  // Centralized verdict: record run, play sound, wait 1s, navigate
  async function triggerVerdict(category?: Category | string | null, verdict?: string | null) {
    if (navigatingRef.current) return;
    navigatingRef.current = true;
    clearAllTimers();

    // store dynamic verdict for the verdict page
    try {
      sessionStorage.setItem(
        "verdict",
        JSON.stringify({
          taskId: penaltyTaskId,
          category: category ?? penaltyCategory ?? null,
          verdict: verdict ?? penaltyVerdict ?? "You ignored a critical issue.",
        })
      );
    } catch {}

    // record the run
    try {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startedAt: startedAtRef.current,
          finishedAt: new Date().toISOString(),
          verdictCategory: category ?? penaltyCategory ?? null,
          notes: "auto: verdict from game",
        }),
      });
    } catch { /* non-fatal */ }

    // play sound, then go to verdict after ~1s
    try {
      const a = audioRef.current;
      if (a) { a.currentTime = 0; await a.play().catch(() => {}); }
    } catch {}

    window.setTimeout(() => {
      window.location.replace("/courtroom/verdict");
    }, 1000);
  }

  const onVerdictFromTask: VerdictTrigger = (category, verdict) => {
    triggerVerdict(category as Category, verdict);
  };

  function surfaceNext() {
    if (queue.length === 0) return;
    const [next, ...rest] = queue;
    setQueue(rest);
    setStack((s) => [...s, next]);

    if (next.critical && !penaltyTaskId) {
      setPenaltyStartAt(Date.now());
      setPenaltyTaskId(next.id);
      setPenaltyCategory(next.category);
      setPenaltyVerdict(next.verdict ?? "You ignored a critical issue.");
      verdictTimeoutRef.current = window.setTimeout(() => {
        verdictTimeoutRef.current = null;
        triggerVerdict(); // uses stored penaltyCategory/penaltyVerdict
      }, CRITICAL_GRACE_MS);
    }
  }

  // Global 1s tick (drives everything)
  useEffect(() => {
    if (!gameStarted) return;
    tickerRef.current = window.setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
      setTick((t) => t + 1); // bump tick every second
    }, 1000);
    return () => {
      if (tickerRef.current) { window.clearInterval(tickerRef.current); tickerRef.current = null; }
    };
  }, [gameStarted]);

  // Surface alerts on an interval
  useEffect(() => {
    if (!gameStarted) return;
    messageIntervalRef.current = window.setInterval(() => {
      if (queue.length === 0) return;
      surfaceNext();
    }, MESSAGE_INTERVAL_MS);
    return () => {
      if (messageIntervalRef.current) { window.clearInterval(messageIntervalRef.current); messageIntervalRef.current = null; }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStarted, queue.length]);

  useEffect(() => { setCriticalReviewOpen(false); }, [top?.id]);
  useEffect(() => () => { clearAllTimers(); }, []);

  const mmss = useMemo(() => {
    const m = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
    const s = String(secondsLeft % 60).padStart(2, "0");
    return `${m}:${s}`;
  }, [secondsLeft]);

  // Critical countdown (derived from tick)
  const penaltySecondsLeft = useMemo(() => {
    if (penaltyStartAt == null) return null;
    const elapsed = Math.floor((Date.now() - penaltyStartAt) / 1000);
    const left = 60 - elapsed;
    return Math.max(0, Math.min(60, left));
  }, [penaltyStartAt, tick]);

  function popTop() { setStack((s) => s.slice(0, -1)); }
  function onFix() {
    if (top?.id && top.id === penaltyTaskId) resetPenalty();
    popTop();
  }
  function onSnooze() { if (top && !top.critical) { setQueue((q) => [...q, top]); popTop(); } }
  function onIgnoreNonCritical() { popTop(); }
  function onIgnoreCritical() { triggerVerdict(); }

  function startGame() {
    navigatingRef.current = false;
    setGameStarted(true);
    setSecondsLeft(40 * 60);
    setTick(0);
    setQueue(TASKS);
    setStack([]);
    setCriticalReviewOpen(false);
    resetPenalty();
    startedAtRef.current = new Date().toISOString(); // mark run start
    void primeVerdictSound();
  }

  const headerBadge: React.CSSProperties = {
    display: "inline-block",
    border: "2px solid #111",
    background: "#fff",
    color: "#111",
    borderRadius: 10,
    padding: "8px 12px",
    fontWeight: 800,
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 16,
        backgroundColor: "#f8f8f8",
        backgroundImage: "url('/images/courtroom-desk.png')",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center center",
        backgroundSize: "cover",
        display: "grid",
        gridTemplateRows: "auto 1fr",
        gap: 12,
      }}
      aria-label="Courtroom scenario"
    >
      {/* preload verdict sound */}
      <audio ref={audioRef} src="/sounds/verdict.mp3" preload="auto" aria-hidden="true" />

      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={headerBadge}>COURTROOM</div>
        <div
          aria-live="polite"
          style={{
            ...headerBadge,
            minWidth: 140,
            textAlign: "center",
            fontSize: 30,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          ⏱ {mmss}
        </div>
      </header>

      {/* Center the coding tasks panel on screen */}
      <div style={{ display: "grid", placeItems: "center" }}>
        <CodingTaskPanel gameStarted={gameStarted} nowTick={tick} onVerdict={onVerdictFromTask} />
      </div>

      {/* Start overlay */}
      {!gameStarted && (
        <section
          aria-label="Start game"
          style={{
            position: "fixed",
            left: 0, right: 0, top: 0, bottom: 0,
            display: "grid",
            placeItems: "center",
            background: "rgba(255,255,255,0.65)",
            zIndex: 15,
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.97)",
              border: "1px solid #ccc",
              borderRadius: 12,
              padding: 24,
              width: 360,
              textAlign: "center",
              boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Ready to start?</h2>
            <p style={{ margin: "8px 0 16px" }}>
              Press start to begin the 40:00 timer and receive messages.
            </p>
            <button
              onClick={startGame}
              style={{
                fontSize: 18,
                padding: "10px 16px",
                borderRadius: 8,
                border: "2px solid #111",
                background: "#111",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Start
            </button>
          </div>
        </section>
      )}

      {/* Centered Alert Modal (stack top) */}
      {gameStarted && top && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Incoming message"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.2)",
            display: "grid",
            placeItems: "center",
            padding: 16,
            zIndex: 20,
          }}
        >
          <div
            style={{
              background: "#fff",
              border: "1px solid #ccc",
              borderRadius: 12,
              padding: 20,
              width: "min(92vw, 560px)",
              boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontWeight: 900,
                letterSpacing: 1,
                color: top.critical ? "#b00000" : "#333",
                marginBottom: 8,
              }}
            >
              {top.critical ? "CRITICAL" : "NOTICE"}
            </div>

            <p style={{ marginTop: 0, marginBottom: 12 }}>{top.text}</p>

            {stack.length > 1 && (
              <div style={{ marginBottom: 10, color: "#666", fontSize: 13 }}>
                +{stack.length - 1} more alert{stack.length - 1 > 1 ? "s" : ""} queued
              </div>
            )}

            {top.critical ? (
              <>
                {!criticalReviewOpen ? (
                  <button
                    onClick={() => setCriticalReviewOpen(true)}
                    style={{
                      width: "100%",
                      maxWidth: 280,
                      margin: "0 auto",
                      display: "inline-block",
                      padding: "10px 14px",
                      borderRadius: 8,
                      border: "2px solid #b00000",
                      background: "#ffebeb",
                      color: "#b00000",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                    title="Open critical review"
                  >
                    Review critical ({penaltySecondsLeft ?? 60}s)
                  </button>
                ) : (
                  <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                    <button
                      onClick={onFix}
                      style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #111", background: "#fff" }}
                    >
                      Fix
                    </button>
                    <button
                      onClick={onIgnoreCritical}
                      style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #aaa", background: "#fff" }}
                    >
                      Ignore
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                <button
                  onClick={onFix}
                  style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #111", background: "#fff" }}
                >
                  Fix
                </button>
                <button
                  onClick={onSnooze}
                  style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #777", background: "#f5f5f5" }}
                >
                  Snooze
                </button>
                <button
                  onClick={onIgnoreNonCritical}
                  style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #aaa", background: "#fff" }}
                >
                  Ignore
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Save Output (unchanged) */}
      <div style={{ position: "fixed", bottom: 16, right: 16, zIndex: 10 }}>
        <button
          onClick={async () => {
            const summary = {
              secondsLeft,
              queueRemaining: queue.length,
              stackCount: stack.length,
              started: gameStarted,
              topId: top?.id ?? null,
              criticalCountdown: penaltyStartAt ? penaltySecondsLeft ?? 0 : null,
            };
            const html = `<!doctype html><html><head><meta charset="utf-8"><title>Snapshot</title></head>
<body style="font-family:system-ui;padding:16px">
<h1>Courtroom Snapshot</h1>
<pre>${JSON.stringify(summary, null, 2)}</pre>
</body></html>`;
            await fetch("/api/output", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ html, summary }),
            });
            alert("Saved!");
          }}
          style={{
            fontSize: 16,
            padding: "10px 14px",
            borderRadius: 8,
            border: "2px solid #111",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          Save Output
        </button>
      </div>
    </div>
  );
}
