"use client";

// Simple footer with date and student id
export default function Footer() {
  const now = new Date();
  const style: React.CSSProperties = {
    borderTop: "1px solid #ddd",
    padding: "16px",
    textAlign: "center",
    marginTop: 40,
    color: "var(--fg)",
    background: "var(--bg)",
  };
  return (
    <footer style={style}>
      © {now.getFullYear()} Travis Hoult — Student #20221016 — {now.toLocaleDateString()}
    </footer>
  );
}
