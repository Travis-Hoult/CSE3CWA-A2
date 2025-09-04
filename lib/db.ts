// lib/db.ts
import { Sequelize } from "sequelize";

// Import sqlite3 explicitly so Next bundles it correctly
// If TS complains about types, it's fine — sqlite3 has no full types.
// You can keep esModuleInterop on (Next defaults) so this works.
import sqlite3 from "sqlite3";

/**
 * Local dev: SQLite file (data.sqlite)
 * Cloud (AWS): set DATABASE_URL to a Postgres connection string and we'll use that.
 */
export const sequelize =
  process.env.DATABASE_URL
    ? new Sequelize(process.env.DATABASE_URL, {
        dialect: "postgres",
        logging: false,
      })
    : new Sequelize({
        dialect: "sqlite",
        storage: "data.sqlite",
        logging: false,
        dialectModule: sqlite3, // <-- key line: avoid dynamic require
      });
