// app/courtroom/page.tsx
// -----------------------------------------------------------------------------
// Provenance & Academic Integrity Notes
// - Source pattern: Standard Next.js App Router page component that composes a
//   child React component. Matches lecture material on separating page shells
//   from feature components.
// - Reuse:
//   • This page simply hosts <CourtroomGame/>, which encapsulates all gameplay.
//   • Styling approach (inline style object on <main>) mirrors other pages for
//     consistency across the app.
// - AI Assist: Commenting only — no logic or structure was changed.
// - External references: Next.js App Router documentation for page components.
// -----------------------------------------------------------------------------
//
// What this page does
// - Provides the route-level container for the Courtroom feature at /courtroom.
// - Renders the interactive <CourtroomGame/> component.
//
// Accessibility notes
// - Uses a semantic <main> region and a vertical flex layout that adapts to
//   viewport height.
// -----------------------------------------------------------------------------

import CourtroomGame from "../../components/CourtroomGame";

export default function CourtroomPage() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <CourtroomGame />
    </main>
  );
}