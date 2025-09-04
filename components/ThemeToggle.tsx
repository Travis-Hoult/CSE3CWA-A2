"use client";

import { useEffect, useState } from "react";

// Light/dark theme type
type Theme = "light" | "dark";

// Key for saving theme
const THEME_KEY = "theme";

// Read a saved theme from localStorage
function readSavedTheme(): Theme | null {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === "dark" || v === "light" ? v : null;
  } catch {
    return null;
  }
}

// Apply theme by setting data-theme on <html>
function applyTheme(theme: Theme) {
  if (typeof document !== "undefined") {
    document.documentElement.dataset.theme = theme;
  }
}

// Button that toggles between light and dark themes
export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | undefined>(undefined);

  // Set initial theme on mount
  useEffect(() => {
    const saved = readSavedTheme() ?? "light";
    setTheme(saved);
    applyTheme(saved);
  }, []);

  // Save and apply theme when it changes
  useEffect(() => {
    if (!theme) return;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {}
    applyTheme(theme);
  }, [theme]);

  // Disabled button while theme is loading
  if (!theme) {
    return (
      <button
        aria-label="Theme toggle"
        title="Theme"
        style={{
          padding: "8px 10px",
          border: "1px solid #ccc",
          background: "var(--card)",
          borderRadius: 8,
          cursor: "pointer",
        }}
        disabled
      >
        🌓
      </button>
    );
  }

  // Compute the next theme and label
  const next = theme === "light" ? "dark" : "light";
  const label = theme === "light" ? "Switch to dark mode" : "Switch to light mode";

  return (
    <button
      aria-label={label}
      title={label}
      onClick={() => setTheme(next)}
      style={{
        padding: "8px 10px",
        border: "1px solid #ccc",
        background: "var(--card)",
        borderRadius: 8,
        cursor: "pointer",
      }}
    >
      {theme === "light" ? "🌙" : "🌞"}
    </button>
  );
}
