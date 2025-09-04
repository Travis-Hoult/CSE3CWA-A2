"use client";

import { useEffect, useState } from "react";

// Each tab has an id, title, and content
type Tab = { id: string; title: string; content: string };

// Key for saving tabs to localStorage
const TABS_KEY = "tabs-data";

// Simple id generator (good enough for this demo)
function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// Escape HTML so user input is safe when injected into a string
function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

// Build a self-contained HTML file with inline styles only
function generateInlineHtml(tabs: Tab[]): string {
  const buttons = tabs
    .map((t, i) => {
      const isFirst = i === 0;
      const label = t.title.trim() || `Untitled ${i + 1}`;
      return `<button role="tab" data-target="panel-${i}" aria-selected="${isFirst ? "true" : "false"}"
  style="padding:8px 12px;border:1px solid #999;border-radius:8px;background:${isFirst ? "#1d8346" : "#89268b"};color:#fff;cursor:pointer">
  ${escapeHtml(label)}
</button>`;
    })
    .join("");

  const panels = tabs
    .map((t, i) => {
      const isFirst = i === 0;
      const content = escapeHtml(t.content).replaceAll("\n", "<br/>");
      return `<div id="panel-${i}" role="tabpanel"
  style="border:1px solid #ddd;border-radius:10px;padding:12px;${isFirst ? "" : "display:none"}">
  ${content}
</div>`;
    })
    .join("\n");

  // Minimal HTML page with a tiny script for tab switching
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>Tabs Output</title>
</head>
<body style="margin:16px;font-family:system-ui,Arial,sans-serif;color:#111;background:#fff">
  <h1 style="font-size:20px;margin:0 0 12px 0">Tabs Output</h1>
  <div role="tablist" aria-label="Generated tabs" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">
    ${buttons}
  </div>
  ${panels}
  <script>
    (function(){
      var tabs = Array.from(document.querySelectorAll('[role="tab"]'));
      var panels = Array.from(document.querySelectorAll('[role="tabpanel"]'));
      function show(targetId){
        tabs.forEach(function(btn){
          var on = btn.getAttribute('data-target') === targetId;
          btn.setAttribute('aria-selected', on ? 'true' : 'false');
          btn.style.background = on ? '#1d8346' : '#89268b';
        });
        panels.forEach(function(p){
          p.style.display = (p.id === targetId) ? 'block' : 'none';
        });
      }
      tabs.forEach(function(btn){
        btn.addEventListener('click', function(){
          show(btn.getAttribute('data-target'));
        });
      });
      if (tabs[0]) show(tabs[0].getAttribute('data-target'));
    })();
  </script>
</body>
</html>`;
}

export default function TabsBuilder() {
  // Start with one default tab for initial render
  const DEFAULT_TABS: Tab[] = [{ id: makeId(), title: "Tab 1", content: "" }];

  const [tabs, setTabs] = useState<Tab[]>(DEFAULT_TABS);
  const [activeId, setActiveId] = useState<string>(DEFAULT_TABS[0].id);

  // Track when saved tabs have been loaded
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage after mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(TABS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Tab[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTabs(parsed);
          setActiveId(parsed[0].id);
        }
      }
    } catch {}
    setLoaded(true);
  }, []);

  // Save tabs to localStorage when they change (after load)
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(TABS_KEY, JSON.stringify(tabs));
    } catch {}
  }, [tabs, loaded]);

  // Find the active tab
  const active = tabs.find((t) => t.id === activeId) ?? tabs[0];

  // Add a new tab (limit to 15)
  function addTab() {
    if (tabs.length >= 15) return;
    const nextIndex = tabs.length + 1;
    const t: Tab = { id: makeId(), title: `Tab ${nextIndex}`, content: "" };
    setTabs((prev) => [...prev, t]);
    setActiveId(t.id);
  }

  // Remove the current tab (keep at least one)
  function removeActive() {
    if (tabs.length <= 1) return;
    const remaining = tabs.filter((t) => t.id !== activeId);
    setTabs(remaining);
    setActiveId(remaining[0].id);
  }

  // Update the title of a tab
  function updateTitle(id: string, title: string) {
    setTabs((prev) => prev.map((t) => (t.id === id ? { ...t, title } : t)));
  }

  // Update the content of a tab
  function updateContent(id: string, content: string) {
    setTabs((prev) => prev.map((t) => (t.id === id ? { ...t, content } : t)));
  }

  // Hold generated HTML for preview/copy
  const [outputHtml, setOutputHtml] = useState<string>("");

  // Build the standalone HTML string
  function onGenerate() {
    const html = generateInlineHtml(tabs.slice(0, 15));
    setOutputHtml(html);
  }

  // Copy the generated HTML to clipboard
  function copyOutput() {
    if (!outputHtml) return;
    navigator.clipboard?.writeText(outputHtml).catch(() => {});
  }

  // Minimal inline styles for the editor UI
  const wrap: React.CSSProperties = { display: "grid", gap: 12 };
  const controls: React.CSSProperties = { display: "flex", gap: 8, flexWrap: "wrap" };
  const tablist: React.CSSProperties = { display: "flex", gap: 8, flexWrap: "wrap" };
  const tabBtn = (on: boolean): React.CSSProperties => ({
    padding: "8px 12px",
    border: "1px solid #999",
    borderRadius: 8,
    background: on ? "#1d8346" : "#89268b",
    color: "#fff",
    cursor: "pointer",
  });
  const panel: React.CSSProperties = {
    border: "1px solid #ddd",
    borderRadius: 10,
    padding: 12,
  };

  return (
    <section style={wrap}>
      {/* Add/remove tab actions */}
      <div style={controls}>
        <button
          onClick={addTab}
          aria-label="Add tab"
          style={{ padding: "8px 12px", border: "1px solid #999", borderRadius: 8, background: "#e0e0e0", color: "#111", cursor: "pointer" }}
          disabled={tabs.length >= 15}
        >
          + Add Tab ({tabs.length}/15)
        </button>
        <button
          onClick={removeActive}
          aria-label="Remove active tab"
          style={{ padding: "8px 12px", border: "1px solid #999", borderRadius: 8, background: "#e0e0e0", color: "#111", cursor: "pointer" }}
          disabled={tabs.length <= 1}
        >
          − Remove Active
        </button>
      </div>

      {/* Tab buttons */}
      <div role="tablist" aria-label="Tabs" style={tablist}>
        {tabs.map((t) => {
          const on = t.id === activeId;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={on}
              onClick={() => setActiveId(t.id)}
              style={tabBtn(on)}
            >
              {t.title.trim() || "Untitled"}
            </button>
          );
        })}
      </div>

      {/* Active tab editor */}
      {active && (
        <div role="tabpanel" aria-label="Active tab content" style={panel}>
          <div style={{ display: "grid", gap: 8 }}>
            <label>
              <span style={{ display: "block", marginBottom: 4 }}>Tab title</span>
              <input
                value={active.title}
                onChange={(e) => updateTitle(active.id, e.target.value)}
                style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 8 }}
              />
            </label>
            <label>
              <span style={{ display: "block", marginBottom: 4 }}>Tab content</span>
              <textarea
                value={active.content}
                onChange={(e) => updateContent(active.id, e.target.value)}
                rows={6}
                style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 8 }}
              />
            </label>
          </div>
        </div>
      )}

      {/* Output actions and preview area */}
      <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={onGenerate}
            aria-label="Generate standalone HTML"
            style={{ padding: "8px 12px", border: "1px solid #999", borderRadius: 8, background: "#e0e0e0", color: "#111", cursor: "pointer" }}
          >
            Generate Output
          </button>
          <button
            onClick={copyOutput}
            aria-label="Copy generated HTML to clipboard"
            disabled={!outputHtml}
            style={{ padding: "8px 12px", border: "1px solid #999", borderRadius: 8, background: "#e0e0e0", color: "#111", cursor: "pointer" }}
          >
            Copy Output
          </button>
        </div>

        <textarea
          value={outputHtml}
          readOnly
          placeholder="Click 'Generate Output' to see the HTML here. Copy and paste into a .html file."
          rows={10}
          style={{
            width: "100%",
            padding: 8,
            border: "1px solid #ccc",
            borderRadius: 8,
            fontFamily: "ui-monospace, Menlo, Consolas, monospace",
            fontSize: 12,
          }}
        />
      </div>
    </section>
  );
}
