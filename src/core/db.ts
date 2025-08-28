import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (dbInstance) return dbInstance;
  // Prefer env override; else use ~/.saga-mcp/data to avoid writing to '/data'
  const baseDir = process.env.SAGA_DATA_DIR
    ? path.resolve(process.env.SAGA_DATA_DIR)
    : path.join(os.homedir(), ".saga-mcp", "data");
  if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });
  const dbPath = path.join(baseDir, "saga.db");
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS plans (
      plan_id TEXT PRIMARY KEY,
      name TEXT,
      steps_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS saga_instances (
      id TEXT PRIMARY KEY,
      plan_id TEXT NOT NULL,
      status TEXT NOT NULL,
      current_step TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      started_at TEXT,
      completed_at TEXT,
      error TEXT,
      FOREIGN KEY (plan_id) REFERENCES plans(plan_id)
    );

    CREATE TABLE IF NOT EXISTS saga_steps (
      saga_id TEXT NOT NULL,
      step_id TEXT NOT NULL,
      name TEXT,
      tool_name TEXT NOT NULL,
      status TEXT NOT NULL,
      started_at TEXT,
      completed_at TEXT,
      result_json TEXT,
      error TEXT,
      cancellable TEXT,
      PRIMARY KEY (saga_id, step_id),
      FOREIGN KEY (saga_id) REFERENCES saga_instances(id)
    );

    CREATE TABLE IF NOT EXISTS saga_events (
      event_id TEXT PRIMARY KEY,
      saga_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      data_json TEXT,
      FOREIGN KEY (saga_id) REFERENCES saga_instances(id)
    );
  `);

  dbInstance = db;
  return dbInstance;
}
