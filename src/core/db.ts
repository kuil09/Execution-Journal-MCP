import Database from "better-sqlite3";
import path from "path";
import os from "os";

// Prefer env override; else use ~/.execution-journal/data to avoid writing to '/data'
const baseDir = process.env.EXECUTION_JOURNAL_DATA_DIR
  ? path.resolve(process.env.EXECUTION_JOURNAL_DATA_DIR)
  : path.join(os.homedir(), ".execution-journal", "data");

const dbPath = path.join(baseDir, "execution-journal.db");

// Ensure directory exists
import { mkdirSync } from "fs";
try {
  mkdirSync(baseDir, { recursive: true });
} catch (e) {
  // Directory might already exist
}

export const db = new Database(dbPath);

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS plans (
    plan_id TEXT PRIMARY KEY,
    name TEXT,
    steps_json TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS execution_instances (
    id TEXT PRIMARY KEY,
    plan_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    current_step TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    started_at TEXT,
    completed_at TEXT,
    error TEXT,
    FOREIGN KEY (plan_id) REFERENCES plans(plan_id)
  );

  CREATE TABLE IF NOT EXISTS execution_steps (
    execution_id TEXT NOT NULL,
    step_id TEXT NOT NULL,
    name TEXT,
    tool_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    started_at TEXT,
    completed_at TEXT,
    result_json TEXT,
    error TEXT,
    cancellable TEXT,
    PRIMARY KEY (execution_id, step_id),
    FOREIGN KEY (execution_id) REFERENCES execution_instances(id)
  );

  CREATE TABLE IF NOT EXISTS execution_events (
    event_id TEXT PRIMARY KEY,
    execution_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    data_json TEXT,
    FOREIGN KEY (execution_id) REFERENCES execution_instances(id)
  );
`);

