// lib/db.ts
import { Sequelize } from "sequelize";
import sqlite3 from "sqlite3";
import fs from "fs";
import path from "path";

/**
 * Priority for DB selection:
 * 1) DATABASE_URL -> Postgres connection string
 * 2) (SQLite) DATABASE_FILE (preferred override)
 * 3) (SQLite) SQLITE_PATH (legacy override)
 * 4) Defaults:
 *    - NODE_ENV === "test"       -> data/test.sqlite
 *    - NODE_ENV === "production" -> /app/data/app.sqlite  (Docker default)
 *    - otherwise (dev)           -> data/app.sqlite
 */

const isTest = process.env.NODE_ENV === "test";
const isProd = process.env.NODE_ENV === "production";

const defaultDevPath = "data/app.sqlite";
const defaultTestPath = "data/test.sqlite";
const defaultProdPath = "/app/data/app.sqlite";

const fileOverride =
  process.env.DATABASE_FILE || // preferred
  process.env.SQLITE_PATH ||   // legacy
  null;

const sqliteFile = fileOverride
  ? fileOverride
  : isTest
  ? defaultTestPath
  : isProd
  ? defaultProdPath
  : defaultDevPath;

// Ensure directory exists for SQLite files
try {
  const dir = path.dirname(sqliteFile);
  if (dir && dir !== "." && !fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
} catch {
  // non-fatal; if it fails the next DB open will surface the error
}

export const sequelize =
  process.env.DATABASE_URL
    ? new Sequelize(process.env.DATABASE_URL, {
        dialect: "postgres",
        logging: false,
      })
    : new Sequelize({
        dialect: "sqlite",
        storage: sqliteFile,
        logging: false,
        dialectModule: sqlite3, // avoid dynamic require
      });