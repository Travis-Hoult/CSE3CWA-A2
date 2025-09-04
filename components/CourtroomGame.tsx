"use client";
import { useEffect, useMemo, useRef, useState } from "react";

type Task = { id: string; text: string; critical: boolean };

const TASKS: Task[] = [
  { id: "t1", text: "Boss: Are you done with Sprint 1?", critical: false },
  { id: "t2", text: "Fix alt on <img id='img1'> (accessibility)", critical: true },
  { id: "t3", text: "Fix input validation on login form (security)", critical: true },
];

export default function CourtroomGame() {
  const [secondsLeft, setSecondsLeft] = useState(40 * 60); // 40:00
  const [queue, setQueue] = useState<Task[]>(TASKS);
  const [active, setActive] = useState<Task | null>(null);
  const [ignoredCriticalAt, setIgnoredCriticalAt] = useState<number | null>(null);
  const penaltyTimer = useRef<number | null>(null);

  // main countdown
  useEffect(() => {
    const id = window.setInterval(() => setSecondsLeft(s => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(id);
  }, []);

  // show a message roughly every 28s
  useEffect(() => {
    const id = window.setInterval(() => {
      if (active || queue.length === 0) return;
      setActive(queue[0]);
      setQueue(q => q.slice(1));
    }, 28000);
    return () => window.clearInterval(id);
  }, [active, queue]);

  // if a critical was ignored for 120s → verdict
  useEffect(() => {
    if (penaltyTimer.current) return;
    penaltyTimer.current = window.setInterval(() => {
      if (ignoredCriticalAt && Date.now() - ignoredCriticalAt >= 120_000) {
        window.location.assign("/courtroom/verdict");
      }
    }, 1000);
    return () => { if (penaltyTimer.current) window.clearInterval(penaltyTimer.current); };
  }, [ignoredCriticalAt]);

  const mmss = useMemo(() => {
    const m = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
    const s = String(secondsLeft % 60).padStart(2, "0");
    return `${m}:${s}`;
  }, [secondsLeft]);

  function onFix()   { setActive(null); }
  function onSnooze(){ if (active && !active.critical) setQueue(q => [...q, active]); setActive(null); }
  function onIgnore(){
    if (active?.critical) setIgnoredCriticalAt(Date.now());
    setActive(null);
  }

  async function onSaveOutput() {
    const summary = { secondsLeft, remaining: queue.length };
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Snapshot</title></head>
<body style="font-family:system-ui;padding:16px">
<h1>Courtroom Snapshot</h1>
<pre>${JSON.stringify(summary)}</pre>
<script>console.log("snapshot");</script>
</body></html>`;
    await fetch("/api/output", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ html, summary })
    });
    alert("Saved (stub)!");
  }

  return (
    <div
      style={{
        minHeight: "calc(100vh - 120px)",
        padding: 16,
        background: "#f8f8f8 url('/images/courtroom-desk.jpg') center/cover no-repeat",
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
        gap: 12,
      }}
      aria-label="Courtroom scenario"
    >
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ margin: 0 }}>Courtroom</h1>
        <div aria-live="polite" style={{ fontSize: 24, fontVariantNumeric: "tabular-nums" }}>⏱ {mmss}</div>
      </header>

      {active && (
        <section role="dialog" aria-modal="true" aria-label="Incoming message"
          style={{ background: "white", border: "1px solid #ccc", padding: 16, borderRadius: 8, maxWidth: 560 }}>
          <p style={{ marginTop: 0 }}>{active.text}</p>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onFix}>Fix</button>
            <button onClick={onSnooze}>Snooze</button>
            <button onClick={onIgnore}>Ignore</button>
          </div>
        </section>
      )}

      <footer>
        <button onClick={onSaveOutput}>Save Output (stub)</button>
      </footer>
    </div>
  );
}
