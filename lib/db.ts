// lib/db.ts
// -----------------------------------------------------------------------------
// Provenance & Academic Integrity Notes
// - Source pattern: “dual-dialect” setup demonstrated in lectures—prefer a
//   simple SQLite file for local/dev and allow DATABASE_URL for Postgres in
//   production. Uses Sequelize as taught.
// - Reuse:
//   • The same `sequelize` instance is imported by all API route handlers and
//     model definition files (Output, Progress) to share one pool/connection.
//   • The absolute path `/app/data/app.sqlite` matches our Docker README notes
//     so volumes persist between container restarts.
// - AI Assist: Only added this comment header and inline clarifications. No
//   code changes to logic, exports, or config values.
// - External references: Sequelize docs (dialect options, sqlite/postgres),
//   plus the “avoid dynamic require” tip for sqlite3 in bundlers.
// -----------------------------------------------------------------------------
//
// What this module does
// - Exposes a single `sequelize` instance configured for either:
//   • Postgres (when DATABASE_URL is present), or
//   • SQLite (file-based) for local/dev and Docker demos.
// - Picks a stable absolute path for SQLite inside containers, and allows
//   overriding via SQLITE_PATH for flexibility.
// -----------------------------------------------------------------------------

import { Sequelize } from "sequelize";
import sqlite3 from "sqlite3";

// Use an absolute path in production (Docker). Allow override via env.
const defaultProdPath = "/app/data/app.sqlite";
const storage =
  process.env.SQLITE_PATH ??
  (process.env.NODE_ENV === "production" ? defaultProdPath : "data.sqlite");

export const sequelize =
  process.env.DATABASE_URL
    ? new Sequelize(process.env.DATABASE_URL, {
        dialect: "postgres",
        logging: false,
      })
    : new Sequelize({
        dialect: "sqlite",
        storage,
        logging: false,
        dialectModule: sqlite3, // avoid dynamic require in serverless/bundled envs
      });