// lib/courtroom/options.ts
// -----------------------------------------------------------------------------
// Provenance & Academic Integrity Notes
// - Source pattern: Simple typed config module (types + in-memory list +
//   lookup helper) aligns with lecture material on TypeScript domain models and
//   separating UI from data definitions.
// - Reuse:
//   • The Option/Category types are imported by UI components (OptionsButton,
//     CourtroomGame) to keep props and runtime data consistent.
//   • BASE_OPTIONS serves as a local fallback when Lambda is absent or fails,
//     mirroring the app’s “local → lambda → fallback” flow shown in class.
// - AI Assist: Commenting/annotation only — no functional changes were made.
//   The structure and values of the options remain exactly as in the project.
// - External references: None required beyond standard TypeScript patterns
//   discussed in lectures.
// -----------------------------------------------------------------------------
//
// What this module provides
// - Category and Option types used across the Courtroom feature.
// - BASE_OPTIONS: a small, typed catalog of scenarios for local/demo use.
// - getOption(id): convenience helper to fetch an option by id.
//
// Notes
// - bias: lets scenarios influence alert cadence and “critical” grace period.
// - This module is intentionally framework-agnostic (no React/Next imports).
// -----------------------------------------------------------------------------

export type Category = "accessibility" | "security-input" | "auth";

export type Option = {
  id: string;
  title: string;
  verdictCategory: Category;
  text: string;
  bias?: {
    categories: Category[];
    messageIntervalMs?: number; // optional: faster/slower alert cadence
    criticalGraceMs?: number;   // optional: change CRITICAL grace period
  };
};

// (keep BASE_OPTIONS as a local fallback – safe to leave as-is
// or add the same bias fields if you like)
export const BASE_OPTIONS: Option[] = [
  {
    id: "opt-acc",
    title: "Fix accessibility issues",
    verdictCategory: "accessibility",
    text: "In this scenario, we have identified several accessibility issues that need to be addressed to ensure our application is usable by all users, including those with disabilities.",
    bias: { categories: ["accessibility"], messageIntervalMs: 24000 }
  },
  {
    id: "opt-sec",
    title: "Harden login form",
    verdictCategory: "security-input",
    text: "In this scenario, we have identified potential security vulnerabilities in our login form that need to be addressed to protect user data and prevent unauthorized access.",
    bias: { categories: ["security-input"], criticalGraceMs: 50000 }
  },
  {
    id: "opt-auth",
    title: "Ship MVP auth flow",
    verdictCategory: "auth",
    text: "In this scenario, we need to implement a minimum viable product (MVP) authentication flow to allow users to securely log in and access their accounts.",
    bias: { categories: ["auth"] }
  }
];

export function getOption(id: string) {
  return BASE_OPTIONS.find(o => o.id === id);
}