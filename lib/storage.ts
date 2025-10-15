// utils/storage.ts (or similar)
// -----------------------------------------------------------------------------
// Provenance & Academic Integrity Notes
// - Source pattern: This is the standard “JSON wrapper around localStorage”
//   shown in lectures (client-side persistence, try/catch for quota/denied).
// - Reuse:
//   • Called by UI components to persist/restore simple state (e.g. scenario
//     selections) using the same key across sessions.
//   • Uses the same generic <T> approach across the app so call sites get
//     typed values back without repetitive casting.
// - AI Assist: Only added documentation/comments and filename suggestion.
//   No code or behavioral changes.
// - External references: MDN localStorage API (string-only storage) and
//   JSON.stringify/parse usage.
// -----------------------------------------------------------------------------
//
// What these helpers do
// - save<T>(key, value): JSON-serializes any value and writes it to
//   localStorage under the given key. Errors are swallowed to keep the UI
//   resilient if storage is unavailable (private mode/quota/etc).
// - load<T>(key, fallback): Attempts to parse the stored JSON string; if no
//   value exists or parsing fails, returns the provided fallback.
//
// Usage examples (client components only):
//   save("cwa.selectedScenario", obj);
//   const opt = load("cwa.selectedScenario", null);
//
// Notes
// - Must be called in the browser (not during SSR) since localStorage is a
//   Window API. If needed, gate calls behind `typeof window !== "undefined"`.
// -----------------------------------------------------------------------------

// Save a value to localStorage under the given key
export function save<T>(key: string, value: T) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// Load a value from localStorage; return fallback if missing or invalid
export function load<T>(key: string, fallback: T): T {
  try {
    const s = localStorage.getItem(key);
    return s ? (JSON.parse(s) as T) : fallback;
  } catch { return fallback; }
}