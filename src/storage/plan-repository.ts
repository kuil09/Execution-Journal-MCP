import { db } from "../core/db.js";

export interface PlanRow {
  plan_id: string;
  name: string;
  steps_json: string;
  created_at: string;
}

export class PlanRepository {
  create(plan: PlanRow): void {
    this.db.prepare(`INSERT INTO plans (plan_id, name, steps_json, created_at) VALUES (?, ?, ?, ?)`).run(
      plan.plan_id, plan.name, plan.steps_json, plan.created_at
    );
  }

  get(id: string): PlanRow | null {
    const row = this.db.prepare(`SELECT * FROM plans WHERE plan_id = ?`).get(id);
    if (!row) return null;
    return row as PlanRow;
  }

  getAll(): PlanRow[] {
    const rows = this.db.prepare(`SELECT * FROM plans ORDER BY created_at DESC`).all();
    return rows as PlanRow[];
  }

  delete(id: string): boolean {
    const result = this.db.prepare(`DELETE FROM plans WHERE plan_id = ?`).run(id);
    return result.changes > 0;
  }

  hasExecutions(planId: string): boolean {
    const result = this.db.prepare(`SELECT COUNT(1) as cnt FROM execution_instances WHERE plan_id = ?`).get(planId);
    if (!result) return false;
    const countResult = result as { cnt: number };
    return countResult.cnt > 0;
  }

  get db() {
    return db;
  }
}


