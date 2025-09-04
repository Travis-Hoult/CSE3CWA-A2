import type { Metadata } from "next";
import type React from "react";

import Header from "../components/Header";
import Footer from "../components/Footer";
import LastPageCookie from "../components/LastPageCookie";

export const metadata: Metadata = {
  title: "CSE3CWA A1",
  description: "Assignment 1 build",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Basic page colours and font (kept inline for simplicity)
  const bodyStyle: React.CSSProperties = {
    margin: 0,
    background: "var(--bg, #ffffff)",
    color: "var(--fg, #111111)",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
  };

  // Constrain main content width and add padding
  const mainStyle: React.CSSProperties = {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "16px",
  };

  return (
    <html lang="en">
      <head>
        {/* Make Bootstrap available without changing our own styles */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        />
      </head>
      <body style={bodyStyle}>
        {/* Writes a 'lastMenu' cookie whenever the path changes */}
        <LastPageCookie />

        {/* Theme tokens for light/dark support via data-theme on <html> */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root { --bg:#ffffff; --fg:#111111; --card:#f5f5f5; --link:#0b5fff; }
              [data-theme="dark"] { --bg:#111111; --fg:#f7f7f7; --card:#1c1c1c; --link:#70a0ff; }
            `,
          }}
        />

        {/* Header with title, nav, and controls */}
        <div style={{ borderBottom: "1px solid #ddd", background: "var(--bg)" }}>
          <Header />
        </div>

        {/* Main routed page */}
        <main style={mainStyle}>{children}</main>

        {/* Simple footer */}
        <Footer />
      </body>
    </html>
  );
}
