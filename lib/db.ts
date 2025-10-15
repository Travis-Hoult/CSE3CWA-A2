// lib/db.ts
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
        dialectModule: sqlite3, // avoid dynamic require
      });