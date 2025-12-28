import path from "node:path";
import fs from "node:fs";
import Database from "better-sqlite3";
import { app } from "electron";

let db: Database.Database | null = null;

export function initDb() {
  // app.getPath("userData") is a per-user writable folder (works in dev + packaged apps)
  console.log(app.getPath("userData"))
  
  const dbPath = path.join(app.getPath("userData"), "app.db");

  db = new Database(dbPath);

  // WAL = better concurrency + durability for desktop apps
  db.pragma("journal_mode = WAL");

  runMigrations(db);
  return db;
}

export function getDb() {
  if (!db) throw new Error("DB not initialized. Call initDb() after app.whenReady().");
  return db;
}

function runMigrations(dbConn: Database.Database) {
  // Put your SQL files here: electron/db/migrations/*.sql
  const migrationsDir = path.join(process.cwd(), "electron", "db", "migrations");

  if (!fs.existsSync(migrationsDir)) return;

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort(); // relies on 001_, 002_ naming

  for (const file of files) {
    const fullPath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(fullPath, "utf-8");
    dbConn.exec(sql); // executes the whole migration file
  }
}
