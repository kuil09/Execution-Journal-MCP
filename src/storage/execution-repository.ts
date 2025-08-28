import { db } from "../core/db.js";
import { v4 as uuidv4 } from "uuid";

export interface ExecutionStepRow {
  execution_id: string;
  step_id: string;
  name?: string;
  tool_name: string;
  status: string;
  started_at?: string;
  completed_at?: string;
  result_json?: string;
  error?: string;
  cancellable?: string;
  failure_policy_json?: string;
}

export interface ExecutionInstanceRow {
  id: string;
  plan_id: string;
  status: string;
  current_step?: string;
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
  error?: string;
}

export class ExecutionRepository {
  create(instance: ExecutionInstanceRow, steps: ExecutionStepRow[]): void {
    this.db.prepare(`INSERT INTO execution_instances (id, plan_id, status, current_step, created_at, updated_at, started_at, completed_at, error) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      instance.id, instance.plan_id, instance.status, instance.current_step, instance.created_at, instance.updated_at, instance.started_at, instance.completed_at, instance.error
    );

    const stepStmt = this.db.prepare(`INSERT INTO execution_steps (execution_id, step_id, name, tool_name, status, started_at, completed_at, result_json, error, cancellable, failure_policy_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const step of steps) {
      stepStmt.run(
        step.execution_id, step.step_id, step.name ?? null, step.tool_name, step.status, step.started_at ?? null, step.completed_at ?? null, step.result_json ?? null, step.error ?? null, step.cancellable ?? null, step.failure_policy_json ?? null
      );
    }
  }

  update(instance: Partial<ExecutionInstanceRow> & { id: string }): void {
    const existing = this.get(instance.id);
    if (!existing) throw new Error(`Execution instance not found: ${instance.id}`);
    
    const merged: ExecutionInstanceRow = { ...existing, ...instance } as ExecutionInstanceRow;
    this.db.prepare(`UPDATE execution_instances SET status=?, current_step=?, updated_at=?, started_at=?, completed_at=?, error=? WHERE id=?`).run(
      merged.status, merged.current_step, merged.updated_at, merged.started_at, merged.completed_at, merged.error, merged.id
    );
  }

  upsertStep(step: ExecutionStepRow): void {
    this.db.prepare(`INSERT INTO execution_steps (execution_id, step_id, name, tool_name, status, started_at, completed_at, result_json, error, cancellable, failure_policy_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(execution_id, step_id) DO UPDATE SET name=excluded.name, tool_name=excluded.tool_name, status=excluded.status, started_at=excluded.started_at, completed_at=excluded.completed_at, result_json=excluded.result_json, error=excluded.error, cancellable=excluded.cancellable, failure_policy_json=excluded.failure_policy_json`).run(
      step.execution_id, step.step_id, step.name ?? null, step.tool_name, step.status, step.started_at ?? null, step.completed_at ?? null, step.result_json ?? null, step.error ?? null, step.cancellable ?? null, step.failure_policy_json ?? null
    );
  }

  get(id: string): ExecutionInstanceRow | null {
    const row = this.db.prepare(`SELECT * FROM execution_instances WHERE id = ?`).get(id);
    if (!row) return null;
    return row as ExecutionInstanceRow;
  }

  getWithSteps(id: string): { instance: ExecutionInstanceRow; steps: ExecutionStepRow[] } | null {
    const instance = this.get(id);
    if (!instance) return null;
    
    const steps = this.db.prepare(`SELECT * FROM execution_steps WHERE execution_id = ? ORDER BY rowid ASC`).all(id) as ExecutionStepRow[];
    return { instance, steps };
  }

  insertEvent(event: { execution_id: string; event_type: string; timestamp?: string; data_json?: string; event_id?: string }): void {
    const id = event.event_id ?? uuidv4();
    const ts = event.timestamp ?? new Date().toISOString();
    
    this.db.prepare(`INSERT INTO execution_events (event_id, execution_id, event_type, timestamp, data_json) VALUES (?, ?, ?, ?, ?)`)
      .run(id, event.execution_id, event.event_type, ts, event.data_json ?? null);
  }

  queryEvents(executionId: string): any[] {
    const rows = this.db.prepare(`SELECT * FROM execution_events WHERE execution_id = ? ORDER BY timestamp ASC`).all(executionId);
    return rows;
  }

  get db() {
    return db;
  }
}
