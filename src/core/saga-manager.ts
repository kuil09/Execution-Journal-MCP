import { v4 as uuidv4 } from "uuid";
import { PlanRepository } from "../storage/plan-repository.js";
import { SagaRepository } from "../storage/saga-repository.js";
import { toolCoordinator } from "./tool-coordinator.js";
import { ExecutionScheduler } from "./execution-scheduler.js";

export interface ExecuteOptions {
  auto_compensate?: boolean;
  pause_on_error?: boolean;
  concurrency?: number;
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
    const { instance } = data as any;
    const plan = this.planRepo.get(instance.plan_id) as any;
    if (!plan) throw new Error(`Plan not found for execution: ${instance.plan_id}`);

    // cycle validation
    if (ExecutionScheduler.hasCycle(plan.steps || [])) {
      this.sagaRepo.update({ id, status: "failed", error: "Plan has cyclic dependencies", updated_at: new Date().toISOString() });
      return;
    }

    const now = new Date().toISOString();
    this.sagaRepo.update({ id, status: "running", started_at: data.instance.started_at ?? now, updated_at: now });

    const scheduler = new ExecutionScheduler(
      (plan.steps || []).map((s: any) => ({ id: s.id, tool_name: s.tool_name, parameters: s.parameters, depends_on: s.depends_on })),
      { concurrency: Math.max(1, options.concurrency ?? 1) }
    );

    let failed = false;

    try {
      await scheduler.run({
        onStepStart: (stepId) => {
          const stepRow = (data.steps as any[]).find((x) => x.step_id === stepId);
          const started_at = new Date().toISOString();
          this.sagaRepo.upsertStep({ ...stepRow, status: "running", started_at });
          this.sagaRepo.update({ id, current_step: stepId, updated_at: new Date().toISOString() });
        },
        runStep: async (step) => {
          const stepDef = plan.steps.find((ps: any) => ps.id === step.id) || {};
          const retry_policy = stepDef.retry_policy ?? { max_attempts: 1, backoff_strategy: 'linear' };
          const res = await toolCoordinator.executeTool(step.tool_name, step.parameters ?? {}, {
            retry: {
              maxAttempts: retry_policy.max_attempts ?? 1,
              backoff: (retry_policy.backoff_strategy ?? 'linear') as 'linear' | 'exponential',
              initialDelayMs: 300,
            }
          });
          const start = (data.steps as any[]).find((x) => x.step_id === step.id)?.started_at;
          this.sagaRepo.upsertStep({
            saga_id: id,
            step_id: step.id,
            name: stepDef.name,
            tool_name: step.tool_name,
            status: "completed",
            started_at: start ?? new Date().toISOString(),
            completed_at: new Date().toISOString(),
            result_json: JSON.stringify(res)
          } as any);
        },
        onStepError: (stepId, err) => {
          failed = true;
          const stepRow = (data.steps as any[]).find((x) => x.step_id === stepId);
          this.sagaRepo.upsertStep({ ...stepRow, status: "failed", error: err?.message || String(err) });
          this.sagaRepo.update({ id, status: options.pause_on_error ? "paused" : "failed", error: err?.message || String(err), updated_at: new Date().toISOString() });
        }
      });
    } catch (e) {
      // scheduler throws first error; already recorded in onStepError
    }

    const finishedAt = new Date().toISOString();
    const current = this.sagaRepo.get(id);
    if (!current) return;

    if (current.status === "paused") {
      this.sagaRepo.update({ id, updated_at: finishedAt, current_step: "paused" as any });
      return;
    }

    if (failed || current.status === "failed") {
      this.sagaRepo.update({ id, updated_at: finishedAt, current_step: "failed" as any });
      return;
    }

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


