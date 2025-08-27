import { getDb } from "../core/db.js";

export interface StoredPlan {
  plan_id: string;
  name: string;
  steps: any[];
  created_at: string;
}

export class PlanRepository {
  private db = getDb();

  save(plan: StoredPlan): void {
    const stmt = this.db.prepare(
      `INSERT OR REPLACE INTO plans (plan_id, name, steps_json, created_at) VALUES (?, ?, ?, ?)`
    );
    stmt.run(plan.plan_id, plan.name, JSON.stringify(plan.steps), plan.created_at);
  }

  get(planId: string): StoredPlan | null {
    const row = this.db.prepare(`SELECT * FROM plans WHERE plan_id = ?`).get(planId) as any;
    if (!row) return null;
    return {
      plan_id: row.plan_id,
      name: row.name,
      steps: JSON.parse(row.steps_json),
      created_at: row.created_at,
    };
  }

  list(options: { offset?: number; limit?: number } = {}): StoredPlan[] {
    const { offset = 0, limit = 50 } = options;
    const rows = this.db
      .prepare(`SELECT * FROM plans ORDER BY datetime(created_at) DESC LIMIT ? OFFSET ?`)
      .all(limit, offset) as any[];
    return rows.map((row: any) => ({
      plan_id: row.plan_id,
      name: row.name,
      steps: JSON.parse(row.steps_json),
      created_at: row.created_at,
    }));
  }

  update(planId: string, update: { name?: string; steps?: any[] }): StoredPlan | null {
    const existing = this.get(planId);
    if (!existing) return null;
    const updated: StoredPlan = {
      plan_id: existing.plan_id,
      name: update.name ?? existing.name,
      steps: update.steps ?? existing.steps,
      created_at: existing.created_at,
    };
    this.save(updated);
    return updated;
  }

  hasExecutions(planId: string): boolean {
    const row = this.db
      .prepare(`SELECT COUNT(1) as cnt FROM saga_instances WHERE plan_id = ?`)
      .get(planId) as any;
    return (row?.cnt ?? 0) > 0;
  }

  delete(planId: string): boolean {
    // Guard: prevent delete when executions exist
    if (this.hasExecutions(planId)) {
      throw new Error(
        `Cannot delete plan '${planId}': executions exist. Cancel or complete them before deletion.`
      );
    }
    const info = this.db.prepare(`DELETE FROM plans WHERE plan_id = ?`).run(planId);
    return (info.changes ?? 0) > 0;
  }
}


