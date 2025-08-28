import { v4 as uuidv4 } from "uuid";
import { PlanRepository } from "../storage/plan-repository.js";
import { SagaRepository } from "../storage/saga-repository.js";
import { toolCoordinator } from "./tool-coordinator.js";
// Simplified: sequential execution only (scheduler removed)

export interface ExecuteOptions {
  // kept for forward-compatibility
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

    const now = new Date().toISOString();
    this.sagaRepo.update({ id, status: "running", started_at: data.instance.started_at ?? now, updated_at: now });

    try {
      for (const step of plan.steps || []) {
        // mark start
        const stepRow = (data.steps as any[]).find((x) => x.step_id === step.id) || {
          saga_id: id,
          step_id: step.id,
          name: step.name,
          tool_name: step.tool_name,
        };
        const started_at = new Date().toISOString();
        this.sagaRepo.upsertStep({ ...stepRow, status: "running", started_at });
        this.sagaRepo.update({ id, current_step: step.id, updated_at: new Date().toISOString() });

        // execute tool (sequential, no retry policy)
        const res = await toolCoordinator.executeTool(step.tool_name, step.parameters ?? {});

        // mark completion
        this.sagaRepo.upsertStep({
          saga_id: id,
          step_id: step.id,
          name: step.name,
          tool_name: step.tool_name,
          status: "completed",
          started_at,
          completed_at: new Date().toISOString(),
          result_json: JSON.stringify(res)
        } as any);
      }
    } catch (err: any) {
      // record failure on current step and saga
      const failedStepId = (this.sagaRepo.get(id)?.current_step as string) || undefined;
      const stepRow = failedStepId ? (this.sagaRepo.getWithSteps(id)?.steps.find((s) => s.step_id === failedStepId)) : undefined;
      if (stepRow) {
        this.sagaRepo.upsertStep({ ...stepRow, status: "failed", error: err?.message || String(err) });
      }
      this.sagaRepo.update({ id, status: "failed", error: err?.message || String(err), updated_at: new Date().toISOString() });
    }

    const finishedAt = new Date().toISOString();
    const current = this.sagaRepo.get(id);
    if (!current) return;
    if (current.status === "failed") {
      this.sagaRepo.update({ id, updated_at: finishedAt, current_step: "failed" as any });
      return;
    }
    this.sagaRepo.update({ id, status: "completed", completed_at: finishedAt, updated_at: finishedAt, current_step: "finished" });
  }

  // pause/resume removed in simplified model

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


