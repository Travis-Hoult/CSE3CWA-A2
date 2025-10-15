// eslint.config.ts (flat config with Next.js presets)
// -----------------------------------------------------------------------------
// Provenance & Academic Integrity Notes
// - Source pattern: Uses ESLint “flat config” with Next.js presets, which aligns
//   with lecture guidance on adopting the modern ESLint format and Next rules.
// - Reuse:
//   • FlatCompat bridges legacy "extends" preset style to the flat config API.
//   • Presets "next/core-web-vitals" and "next/typescript" match course examples
//     and Next.js documentation used in class.
// - AI Assist: Added explanatory comments and ensured the minimal, standard
//   setup without altering rule behavior or adding custom rules.
// - External references: ESLint flat config docs and Next.js ESLint docs.
// -----------------------------------------------------------------------------

import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Bridge helper to use legacy-style "extends" within flat config
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// Export a flat-config array that includes Next.js recommended presets
const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;