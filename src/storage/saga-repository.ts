import { getDb } from "../core/db.js";

export interface SagaStepRow {
  saga_id: string;
  step_id: string;
  name?: string;
  tool_name: string;
  status: string;
  started_at?: string;
  completed_at?: string;
  result_json?: string;
  error?: string;
  cancellable?: string;
}

export interface SagaInstanceRow {
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

export class SagaRepository {
  private db = getDb();

  create(instance: SagaInstanceRow, steps: SagaStepRow[]): void {
    const tx = this.db.transaction(() => {
      this.db.prepare(`INSERT INTO saga_instances (id, plan_id, status, current_step, created_at, updated_at, started_at, completed_at, error) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
        instance.id, instance.plan_id, instance.status, instance.current_step ?? null, instance.created_at, instance.updated_at, instance.started_at ?? null, instance.completed_at ?? null, instance.error ?? null
      );
      const stepStmt = this.db.prepare(`INSERT INTO saga_steps (saga_id, step_id, name, tool_name, status, started_at, completed_at, result_json, error, cancellable) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
      for (const s of steps) {
        stepStmt.run(instance.id, s.step_id, s.name ?? null, s.tool_name, s.status, s.started_at ?? null, s.completed_at ?? null, s.result_json ?? null, s.error ?? null, s.cancellable ?? null);
      }
    });
    tx();
  }

  update(instance: Partial<SagaInstanceRow> & { id: string }): void {
    const existing = this.get(instance.id);
    if (!existing) return;
    const merged: SagaInstanceRow = { ...existing, ...instance } as SagaInstanceRow;
    this.db.prepare(`UPDATE saga_instances SET status=?, current_step=?, updated_at=?, started_at=?, completed_at=?, error=? WHERE id=?`).run(
      merged.status, merged.current_step ?? null, merged.updated_at, merged.started_at ?? null, merged.completed_at ?? null, merged.error ?? null, merged.id
    );
  }

  upsertStep(step: SagaStepRow): void {
    this.db.prepare(`INSERT INTO saga_steps (saga_id, step_id, name, tool_name, status, started_at, completed_at, result_json, error, cancellable) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(saga_id, step_id) DO UPDATE SET name=excluded.name, tool_name=excluded.tool_name, status=excluded.status, started_at=excluded.started_at, completed_at=excluded.completed_at, result_json=excluded.result_json, error=excluded.error, cancellable=excluded.cancellable`).run(
      step.saga_id, step.step_id, step.name ?? null, step.tool_name, step.status, step.started_at ?? null, step.completed_at ?? null, step.result_json ?? null, step.error ?? null, step.cancellable ?? null
    );
  }

  get(id: string): SagaInstanceRow | null {
    const row = this.db.prepare(`SELECT * FROM saga_instances WHERE id = ?`).get(id);
    if (!row) return null;
    return row as SagaInstanceRow;
  }

  getWithSteps(id: string): { instance: SagaInstanceRow; steps: SagaStepRow[] } | null {
    const instance = this.get(id);
    if (!instance) return null;
    const steps = this.db.prepare(`SELECT * FROM saga_steps WHERE saga_id = ? ORDER BY rowid ASC`).all(id) as SagaStepRow[];
    return { instance, steps };
  }

  insertEvent(event: { saga_id: string; event_type: string; timestamp?: string; data_json?: string; event_id?: string }): void {
    const ts = event.timestamp ?? new Date().toISOString();
    const id = event.event_id ?? `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
    this.db.prepare(`INSERT INTO saga_events (event_id, saga_id, event_type, timestamp, data_json) VALUES (?, ?, ?, ?, ?)`)
      .run(id, event.saga_id, event.event_type, ts, event.data_json ?? null);
  }
}
