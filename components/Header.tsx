"use client";

import Link from "next/link";
import Menu from "./Menu";
import ThemeToggle from "./ThemeToggle";

// Top header with title, nav, and controls
export default function Header() {
  const outerWrap: React.CSSProperties = {
    display: "grid",
    gap: 8,
    padding: "10px 16px",
    borderBottom: "1px solid #ccc",
  };

  const badgeRow: React.CSSProperties = {
    display: "flex",
    justifyContent: "flex-start",
  };

  const badge: React.CSSProperties = {
    padding: "4px 8px",
    background: "#000",
    color: "#fff",
    fontSize: 12,
    borderRadius: 6,
    whiteSpace: "nowrap",
  };

  const titleRow: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
  };

  const title: React.CSSProperties = {
    fontWeight: 600,
    fontSize: 18,
    whiteSpace: "nowrap",
    textAlign: "center",
  };

  const navBar: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
  };

  const navLinks: React.CSSProperties = {
    display: "flex",
    gap: 16,
    flexWrap: "wrap",
    fontSize: 14,
  };

  const rightControls: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
  };

  return (
    <header style={outerWrap}>
      {/* Student id badge */}
      <div style={badgeRow}>
        <span style={badge}>Student #20221016</span>
      </div>

      {/* App title */}
      <div style={titleRow}>
        <div style={title}>CSE3CWA — Assignment 1</div>
      </div>

      {/* Nav links and controls */}
      <div style={navBar}>
        <nav style={navLinks}>
          <Link href="/">Tabs</Link>
          <Link href="/prelab">Pre-lab Questions</Link>
          <Link href="/escape">Escape Room</Link>
          <Link href="/races">Coding Races</Link>
        </nav>
        <div style={rightControls}>
          <ThemeToggle />
          <Menu />
        </div>
      </div>
    </header>
  );
}
