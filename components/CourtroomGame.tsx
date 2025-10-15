// components/CourtroomGame.tsx
// -----------------------------------------------------------------------------
// Provenance & Academic Integrity Notes
// - Source pattern: Overall game loop (global countdown, periodic alerts,
//   penalty/critical timing) follows the lecture material on React timers,
//   derived state via useMemo, and effect cleanup for intervals/timeouts.
// - Reuse:
//   • Button + badge visual styles, aria labeling, and modal markup mirror the
//     conventions already used across the app (consistency of UX and a11y).
//   • “Save Output” button reuses the same API contract exposed by /api/output.
// - AI Assist: Helped annotate the file, tighten comments, and ensure timers
//   are cleared robustly (idempotent clearAllTimers) and that the verdict and
//   navigation path are centralized (triggerVerdict). Logic is unchanged.
// - External references: Using Next.js App Router patterns for server actions
//   and client components (per official Next.js docs covered in class).
// -----------------------------------------------------------------------------
//
// What this component does
// - Owns the “Courtroom” gameplay shell: global 40:00 timer, alert queue,
//   critical penalty window, start overlay, and scenario options.
// - Coordinates with CodingTaskPanel via:
//     • nowTick (1s global tick)
//     • onVerdict (ending the run if a task times out)
//     • onWin (stops timer when all coding tasks are completed)
// - Records outcome to /api/progress and routes to /courtroom/verdict.
// - “Save Output” persists a runtime snapshot to /api/output.
//
// Key interaction points
// - refreshScenarioPreview() reads selected scenario (set by OptionsButton) and
//   displays a badge with cadence/grace/favoured categories.
// - startGame() applies bias timings, primes audio, clears state, and starts
//   the surfaceNext loop which pushes alerts at the chosen cadence.
// - triggerVerdict() centralizes: save verdict → play sound → navigate.
// - Penalty flow: first surfaced critical sets a timeout = criticalGraceMs;
//   if not handled within that window, triggerVerdict() fires.
//
// Accessibility notes
// - aria-label on main container and dialogs; aria-live on timer badge.
// - Start overlay is focusable, with Escape support to close without starting.
// -----------------------------------------------------------------------------

"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import CodingTaskPanel, { type VerdictTrigger } from "./CodingTaskPanel";
import {
  tasks as TASKS,
  type Task,
  type Category,
} from "@/lib/courtroom/tasks";
import OptionsButton from "./OptionsButton";

// Default timings (can be overridden by selected scenario bias)
const DEFAULT_MESSAGE_INTERVAL_MS = 28_000;
const DEFAULT_CRITICAL_GRACE_MS = 60_000;

type ScenarioBias = {
  categories?: Category[];
  messageIntervalMs?: number;
  criticalGraceMs?: number;
};

export default function CourtroomGame() {
  const [gameStarted, setGameStarted] = useState(false);
  const [showStartOverlay, setShowStartOverlay] = useState(true); // start box on first load
  const [secondsLeft, setSecondsLeft] = useState(40 * 60);
  const [tick, setTick] = useState(0); // global 1s tick

  // Timings that can change per scenario (Lambda-provided bias)
  const [messageIntervalMs, setMessageIntervalMs] = useState(
    DEFAULT_MESSAGE_INTERVAL_MS
  );
  const [criticalGraceMs, setCriticalGraceMs] = useState(
    DEFAULT_CRITICAL_GRACE_MS
  );

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

  // ---- Scenario preview (visible before start and as a header badge) ----
  const [scenarioTitle, setScenarioTitle] = useState<string | null>(null);
  const [scenarioMeta, setScenarioMeta] = useState<string | null>(null);

  function refreshScenarioPreview() {
    try {
      const raw = localStorage.getItem("cwa.selectedScenario");
      if (!raw) {
        setScenarioTitle(null);
        setScenarioMeta(null);
        return;
      }
      const s = JSON.parse(raw) as {
        title?: string;
        verdictCategory?: string;
        bias?: {
          categories?: string[];
          messageIntervalMs?: number;
          criticalGraceMs?: number;
        };
      };
      setScenarioTitle(s.title || s.verdictCategory || "Custom scenario");
      const cadence = Math.round(
        (s.bias?.messageIntervalMs ?? DEFAULT_MESSAGE_INTERVAL_MS) / 1000
      );
      const grace = Math.round(
        (s.bias?.criticalGraceMs ?? DEFAULT_CRITICAL_GRACE_MS) / 1000
      );
      const fav =
        s.bias?.categories && s.bias.categories.length
          ? s.bias.categories.join(", ")
          : s.verdictCategory ?? "mixed";
      setScenarioMeta(
        `Favours: ${fav} · cadence ~${cadence}s · grace ${grace}s`
      );
    } catch {
      setScenarioTitle(null);
      setScenarioMeta(null);
    }
  }
  useEffect(() => {
    refreshScenarioPreview();
  }, []);

  // Allow ESC to close the start box (without starting the game)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!gameStarted && showStartOverlay && e.key === "Escape") {
        setShowStartOverlay(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [gameStarted, showStartOverlay]);

  function clearAllTimers() {
    if (tickerRef.current) {
      window.clearInterval(tickerRef.current);
      tickerRef.current = null;
    }
    if (messageIntervalRef.current) {
      window.clearInterval(messageIntervalRef.current);
      messageIntervalRef.current = null;
    }
    if (verdictTimeoutRef.current) {
      window.clearTimeout(verdictTimeoutRef.current);
      verdictTimeoutRef.current = null;
    }
  }
  function resetPenalty() {
    setPenaltyStartAt(null);
    setPenaltyTaskId(null);
    setPenaltyCategory(null);
    setPenaltyVerdict(null);
    if (verdictTimeoutRef.current) {
      window.clearTimeout(verdictTimeoutRef.current);
      verdictTimeoutRef.current = null;
    }
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
  async function triggerVerdict(
    category?: Category | string | null,
    verdict?: string | null
  ) {
    if (navigatingRef.current) return;
    navigatingRef.current = true;
    clearAllTimers();

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
    } catch {}

    try {
      const a = audioRef.current;
      if (a) {
        a.currentTime = 0;
        await a.play().catch(() => {});
      }
    } catch {}

    window.setTimeout(() => {
      window.location.replace("/courtroom/verdict");
    }, 1000);
  }

  const onVerdictFromTask: VerdictTrigger = (category, verdict) => {
    triggerVerdict(category as Category, verdict);
  };

  // Helper: bias queue by favored categories; bring one favored critical early if available
  function buildQueueForScenario(all: Task[], favored?: Category[]) {
    if (!favored || favored.length === 0) return all;
    const inFav = all.filter((t) => favored.includes(t.category));
    const other = all.filter((t) => !favored.includes(t.category));
    const earlyC = inFav.find((t) => t.critical);
    const restFav = inFav.filter((t) => t !== earlyC);
    return [...(earlyC ? [earlyC] : []), ...restFav, ...other];
  }

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
      }, criticalGraceMs);
    }
  }

  // Global 1s tick
  useEffect(() => {
    if (!gameStarted) return;
    tickerRef.current = window.setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
      setTick((t) => t + 1);
    }, 1000);
    return () => {
      if (tickerRef.current) {
        window.clearInterval(tickerRef.current);
        tickerRef.current = null;
      }
    };
  }, [gameStarted]);

  // Surface alerts on an interval (scenario-adjustable cadence)
  useEffect(() => {
    if (!gameStarted) return;
    if (messageIntervalRef.current) {
      window.clearInterval(messageIntervalRef.current);
      messageIntervalRef.current = null;
    }
    messageIntervalRef.current = window.setInterval(() => {
      if (queue.length === 0) return;
      surfaceNext();
    }, messageIntervalMs);
    return () => {
      if (messageIntervalRef.current) {
        window.clearInterval(messageIntervalRef.current);
        messageIntervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStarted, queue.length, messageIntervalMs]);

  useEffect(() => {
    setCriticalReviewOpen(false);
  }, [top?.id]);
  useEffect(
    () => () => {
      clearAllTimers();
    },
    []
  );

  const mmss = useMemo(() => {
    const m = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
    const s = String(secondsLeft % 60).padStart(2, "0");
    return `${m}:${s}`;
  }, [secondsLeft]);

  // Critical countdown (derived from tick)
  const penaltySecondsLeft = useMemo(() => {
    if (penaltyStartAt == null) return null;
    const elapsed = Math.floor((Date.now() - penaltyStartAt) / 1000);
    const left = Math.floor(criticalGraceMs / 1000) - elapsed;
    const cap = Math.floor(criticalGraceMs / 1000);
    return Math.max(0, Math.min(cap, left));
  }, [penaltyStartAt, tick, criticalGraceMs]);

  function popTop() {
    setStack((s) => s.slice(0, -1));
  }
  function onFix() {
    if (top?.id && top.id === penaltyTaskId) resetPenalty();
    popTop();
  }
  function onSnooze() {
    if (top && !top.critical) {
      setQueue((q) => [...q, top]);
      popTop();
    }
  }
  function onIgnoreNonCritical() {
    popTop();
  }
  function onIgnoreCritical() {
    triggerVerdict();
  }

  function startGame() {
    navigatingRef.current = false;
    setGameStarted(true);
    setShowStartOverlay(false); // hide the box when starting
    setSecondsLeft(40 * 60);
    setTick(0);

    // Read selected scenario (saved by Use Scenario)
    let bias: ScenarioBias = {};
    try {
      const raw = localStorage.getItem("cwa.selectedScenario");
      if (raw) {
        const scenario = JSON.parse(raw) as {
          title?: string;
          verdictCategory?: string;
          bias?: ScenarioBias;
        };
        bias = scenario?.bias ?? {};
        // Ensure header preview reflects the applied scenario
        setScenarioTitle(
          scenario.title || scenario.verdictCategory || "Custom scenario"
        );
        const cadence = Math.round(
          (bias.messageIntervalMs ?? DEFAULT_MESSAGE_INTERVAL_MS) / 1000
        );
        const grace = Math.round(
          (bias.criticalGraceMs ?? DEFAULT_CRITICAL_GRACE_MS) / 1000
        );
        const fav =
          bias.categories && bias.categories.length
            ? bias.categories.join(", ")
            : scenario.verdictCategory ?? "mixed";
        setScenarioMeta(
          `Favours: ${fav} · cadence ~${cadence}s · grace ${grace}s`
        );
      }
    } catch {}

    // Apply bias timings (with defaults)
    setMessageIntervalMs(bias.messageIntervalMs ?? DEFAULT_MESSAGE_INTERVAL_MS);
    setCriticalGraceMs(bias.criticalGraceMs ?? DEFAULT_CRITICAL_GRACE_MS);

    // Build initial queue with favored categories first
    const q = buildQueueForScenario(TASKS, bias.categories);
    setQueue(q);

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
      {/* Force light text for the Generate Options modal if it uses .options-modal container */}
      <style
        // Safe, local override so the options screen stays black-on-white even in dark mode
        dangerouslySetInnerHTML={{
          __html: `
            .options-modal, .options-modal * {
              color: #000 !important;
            }
          `,
        }}
      />

      {/* preload verdict sound */}
      <audio
        ref={audioRef}
        src="/sounds/verdict.mp3"
        preload="auto"
        aria-hidden="true"
      />

      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
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

        {/* Active scenario badge (when selected) */}
        {scenarioTitle && (
          <div style={{ ...headerBadge, fontSize: 12 }}>
            <div style={{ fontWeight: 900 }}>{scenarioTitle}</div>
            {scenarioMeta && (
              <div style={{ fontWeight: 500 }}>{scenarioMeta}</div>
            )}
          </div>
        )}

        {/* When the start box is hidden and game hasn't started, show a quick "Show Start Screen" button */}
        {!gameStarted && !showStartOverlay && (
          <button
            onClick={() => setShowStartOverlay(true)}
            title="Show Start Screen"
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              border: "1px solid #111",
              background: "#fff",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Show Start Screen
          </button>
        )}
      </header>

      {/* Center the coding tasks panel on screen */}
      <div style={{ display: "grid", placeItems: "center" }}>
        <CodingTaskPanel
          gameStarted={gameStarted}
          nowTick={tick}
          onVerdict={onVerdictFromTask}
          onWin={() => {
            // Stop the main countdown/alerts when tasks are finished
            setGameStarted(false);
          }}
          onRestart={() => {
            // Optional: re-show the start screen so the player can pick options again
            setShowStartOverlay(true);
          }}
        />
      </div>

      {/* Start screen: perfectly centered over the viewport, non-blocking */}
      {!gameStarted && showStartOverlay && (
        <div
          aria-hidden={false}
          style={{
            position: "fixed",
            inset: 0, // full viewport
            display: "grid",
            placeItems: "center", // center horizontally & vertically
            zIndex: 1000,
            pointerEvents: "none", // don't block clicks outside the box
          }}
        >
          <div
            role="dialog"
            aria-label="Start game"
            // Force light theme styling here (black text) so it stays readable even in dark mode
            style={{
              pointerEvents: "auto", // the box itself is interactive
              width: 420,
              maxWidth: "92vw",
              maxHeight: "80vh",
              overflow: "auto",
              background: "#fff", // pure white
              color: "#000", // force black text
              border: "1px solid #ccc",
              borderRadius: 12,
              padding: 24,
              textAlign: "center",
              boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
            }}
          >
            {/* Box controls in the top-right corner of the box */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <Link
                href="/"
                style={{
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: "1px solid #aaa",
                  background: "#fff",
                  color: "#000",
                  textDecoration: "none",
                }}
              >
                ← Back to site
              </Link>
              <button
                onClick={() => setShowStartOverlay(false)}
                aria-label="Close start screen"
                title="Close"
                style={{
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: "1px solid #aaa",
                  background: "#fff",
                  color: "#000",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            <h2 style={{ marginTop: 0 }}>Ready to start?</h2>

            <div style={{ margin: "0 0 12px" }}>
              <div style={{ fontWeight: 800 }}>
                Scenario: {scenarioTitle ?? "None selected"}
              </div>
              <div style={{ fontSize: 12 }}>
                {scenarioMeta ??
                  "Pick an option to influence alerts & timings."}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 8,
                marginBottom: 12,
                flexWrap: "wrap",
              }}
            >
              {/* The modal opened by OptionsButton should use a container class "options-modal"
                  so our <style> override above keeps it black-on-white even in dark mode. */}
              <OptionsButton
                label="Generate Options"
                onSelected={() => refreshScenarioPreview()}
              />
              <button
                onClick={() => {
                  localStorage.removeItem("cwa.selectedScenario");
                  refreshScenarioPreview();
                }}
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #aaa",
                  background: "#fff",
                  color: "#000",
                  cursor: "pointer",
                }}
              >
                Clear Scenario
              </button>
            </div>

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
        </div>
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
                +{stack.length - 1} more alert{stack.length - 1 > 1 ? "s" : ""}{" "}
                queued
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
                    Review critical (
                    {penaltySecondsLeft ?? Math.floor(criticalGraceMs / 1000)}s)
                  </button>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      justifyContent: "center",
                    }}
                  >
                    <button
                      onClick={onFix}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 8,
                        border: "1px solid #111",
                        background: "#fff",
                      }}
                    >
                      Fix
                    </button>
                    <button
                      onClick={onIgnoreCritical}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 8,
                        border: "1px solid #aaa",
                        background: "#fff",
                      }}
                    >
                      Ignore
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div
                style={{ display: "flex", gap: 8, justifyContent: "center" }}
              >
                <button
                  onClick={onFix}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "1px solid #111",
                    background: "#fff",
                  }}
                >
                  Fix
                </button>
                <button
                  onClick={onSnooze}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "1px solid #777",
                    background: "#f5f5f5",
                  }}
                >
                  Snooze
                </button>
                <button
                  onClick={onIgnoreNonCritical}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "1px solid #aaa",
                    background: "#fff",
                  }}
                >
                  Ignore
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom-right actions: Save Output + (optional) in-game Generate Options */}
      <div
        style={{
          position: "fixed",
          bottom: 16,
          right: 16,
          zIndex: 10,
          display: "flex",
          gap: 8,
          alignItems: "center",
          background: "rgba(255,255,255,0.9)",
          border: "1px solid #ddd",
          borderRadius: 12,
          padding: 8,
          boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
          backdropFilter: "blur(4px)",
        }}
      >
        <button
          onClick={async () => {
            const summary = {
              secondsLeft,
              queueRemaining: queue.length,
              stackCount: stack.length,
              started: gameStarted,
              topId: top?.id ?? null,
              criticalCountdown: penaltyStartAt
                ? penaltySecondsLeft ?? 0
                : null,
              cadenceMs: messageIntervalMs,
              criticalGraceMs,
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
            whiteSpace: "nowrap",
          }}
        >
          Save Output
        </button>
      </div>
    </div>
  );
}