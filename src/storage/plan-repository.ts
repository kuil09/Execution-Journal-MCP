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
}


