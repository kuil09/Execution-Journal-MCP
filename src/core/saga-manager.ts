import { v4 as uuidv4 } from "uuid";
import { PlanRepository } from "../storage/plan-repository.js";
import { SagaRepository } from "../storage/saga-repository.js";
import { toolCoordinator } from "./tool-coordinator.js";

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
    const { instance, steps } = data as any;
    const plan = this.planRepo.get(instance.plan_id) as any;
    const now = new Date().toISOString();
    this.sagaRepo.update({ id, status: "running", started_at: data.instance.started_at ?? now, updated_at: now });

    let failed = false;
    let paused = false;

    // Skip steps already completed
    const remaining = steps.filter((s: any) => s.status !== "completed");

    for (const step of remaining) {
      const start = new Date().toISOString();
      this.sagaRepo.upsertStep({ ...step, status: "running", started_at: start });
      this.sagaRepo.update({ id, current_step: step.step_id, updated_at: new Date().toISOString() });
      try {
        // Get step definition (parameters, retry_policy)
        const stepDef = plan?.steps?.find((ps: any) => ps.id === step.step_id) || {};
        const parameters = stepDef.parameters ?? {};
        const retry_policy = stepDef.retry_policy ?? { max_attempts: 1, backoff_strategy: 'linear' };
        const execRes = await toolCoordinator.executeTool(step.tool_name, parameters, {
          timeoutMs: undefined,
          retry: {
            maxAttempts: retry_policy.max_attempts ?? 1,
            backoff: (retry_policy.backoff_strategy ?? 'linear') as 'linear' | 'exponential',
            initialDelayMs: 300,
          },
        });
        const complete = new Date().toISOString();
        this.sagaRepo.upsertStep({ ...step, status: "completed", started_at: start, completed_at: complete, result_json: JSON.stringify(execRes) });
      } catch (err: any) {
        failed = true;
        this.sagaRepo.upsertStep({ ...step, status: "failed", error: err?.message || String(err) });
        const update: any = { id, status: options.pause_on_error ? "paused" : "failed", error: err?.message || String(err), updated_at: new Date().toISOString() };
        this.sagaRepo.update(update);
        if (options.auto_compensate) {
          // TODO: run compensation steps (AI-driven or future server-driven)
        }
        if (options.pause_on_error) {
          paused = true;
          break;
        }
        break;
      }
    }

    const finishedAt = new Date().toISOString();

    if (paused) {
      // Do not mark completed
      this.sagaRepo.update({ id, updated_at: finishedAt, current_step: "paused" as any });
      return;
    }

    if (failed) {
      // Already marked as failed above; ensure current_step reflects end
      this.sagaRepo.update({ id, updated_at: finishedAt, current_step: "failed" as any });
      return;
    }

    // Only mark completed if no failures occurred
    this.sagaRepo.update({ id, status: "completed", completed_at: finishedAt, updated_at: finishedAt, current_step: "finished" });
  }

  pauseSAGA(id: string) {
    const data = this.sagaRepo.get(id);
    if (!data) throw new Error(`SAGA not found: ${id}`);
    if (data.status !== "running") return { id, status: data.status };
    const now = new Date().toISOString();
    this.sagaRepo.update({ id, status: "paused", updated_at: now });
    return { id, status: "paused" };
  }

  resumeSAGA(id: string, options: ExecuteOptions = {}) {
    const data = this.sagaRepo.get(id);
    if (!data) throw new Error(`SAGA not found: ${id}`);
    if (data.status !== "paused") return { id, status: data.status };
    // Fire-and-forget resume; executeAsync will skip completed steps
    this.executeAsync(id, options).catch(() => {});
    return { id, status: "running" };
  }

  cancelSAGA(id: string) {
    const data = this.sagaRepo.get(id);
    if (!data) throw new Error(`SAGA not found: ${id}`);
    const now = new Date().toISOString();
    if (data.status === "completed" || data.status === "failed") return { id, status: data.status };
    this.sagaRepo.update({ id, status: "failed", updated_at: now, current_step: "cancelled" as any, error: "Cancelled by user" });
    return { id, status: "failed" };
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


