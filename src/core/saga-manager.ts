import { v4 as uuidv4 } from "uuid";
import { PlanRepository } from "../storage/plan-repository.js";
import { SagaRepository } from "../storage/saga-repository.js";

export interface ExecuteOptions {
  auto_compensate?: boolean;
  pause_on_error?: boolean;
}

class SagaManager {
  private static instance: SagaManager;
  private planRepo = new PlanRepository();
  private sagaRepo = new SagaRepository();

  static getInstance(): SagaManager {
    if (!SagaManager.instance) {
      SagaManager.instance = new SagaManager();
    }
    return SagaManager.instance;
  }

  createSAGA(plan_id: string, context: Record<string, any>) {
    const plan = this.planRepo.get(plan_id);
    if (!plan) throw new Error(`Plan not found: ${plan_id}`);
    const id = `exec_${Date.now()}_${uuidv4()}`;
    const now = new Date().toISOString();
    const steps = plan.steps.map((s: any) => ({
      saga_id: id,
      step_id: s.id,
      name: s.name,
      tool_name: s.tool_name,
      status: "pending" as const,
    }));
    this.sagaRepo.create(
      {
        id,
        plan_id,
        status: "planned",
        current_step: null as any,
        created_at: now,
        updated_at: now,
      },
      steps
    );
    return { id };
  }

  async executeAsync(id: string, options: ExecuteOptions = {}) {
    const data = this.sagaRepo.getWithSteps(id);
    if (!data) throw new Error(`SAGA not found: ${id}`);
    const { instance, steps } = data;
    const now = new Date().toISOString();
    this.sagaRepo.update({ id, status: "running", started_at: now, updated_at: now });

    for (const step of steps) {
      const start = new Date().toISOString();
      this.sagaRepo.upsertStep({ ...step, status: "running", started_at: start });
      this.sagaRepo.update({ id, current_step: step.step_id, updated_at: new Date().toISOString() });
      try {
        // TODO: Integrate with actual tool executor
        await new Promise((r) => setTimeout(r, 500));
        const complete = new Date().toISOString();
        this.sagaRepo.upsertStep({ ...step, status: "completed", started_at: start, completed_at: complete, result_json: JSON.stringify({ success: true }) });
      } catch (err: any) {
        this.sagaRepo.upsertStep({ ...step, status: "failed", error: err?.message || String(err) });
        this.sagaRepo.update({ id, status: "failed", error: err?.message || String(err), updated_at: new Date().toISOString() });
        if (options.auto_compensate) {
          // TODO: run compensation steps
        }
        if (options.pause_on_error) return;
        break;
      }
    }

    const completeAt = new Date().toISOString();
    this.sagaRepo.update({ id, status: "completed", completed_at: completeAt, updated_at: completeAt, current_step: "finished" });
  }

  getSAGA(id: string) {
    const data = this.sagaRepo.getWithSteps(id);
    if (!data) return null;
    const { instance, steps } = data;
    const progress = `${steps.filter((s: any) => s.status === "completed").length}/${steps.length} steps`;
    return {
      execution_id: instance.id,
      plan_id: instance.plan_id,
      plan_name: this.planRepo.get(instance.plan_id)?.name,
      status: instance.status,
      current_step: instance.current_step,
      progress,
      started_at: instance.started_at,
      completed_at: instance.completed_at,
      error: instance.error,
      steps: steps.map((s: any) => ({
        step_id: s.step_id,
        name: s.name,
        tool_name: s.tool_name,
        status: s.status,
        started_at: s.started_at,
        completed_at: s.completed_at,
        result: s.result_json ? JSON.parse(s.result_json) : undefined,
        error: s.error,
      }))
    };
  }
}

export const sagaManager = SagaManager.getInstance();


