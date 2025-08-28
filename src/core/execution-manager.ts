import { ExecutionRepository } from "../storage/execution-repository.js";
import { ExecutionInstanceRow, ExecutionStepRow } from "../types/execution.js";
import { v4 as uuidv4 } from "uuid";

class ExecutionManager {
  private static instance: ExecutionManager;
  private executionRepo = new ExecutionRepository();

  static getInstance(): ExecutionManager {
    if (!ExecutionManager.instance) {
      ExecutionManager.instance = new ExecutionManager();
    }
    return ExecutionManager.instance;
  }

  createExecution(plan_id: string, context: Record<string, any>) {
    const id = `exec_${uuidv4()}`;
    const now = new Date().toISOString();
    
    const instance: ExecutionInstanceRow = {
      id,
      plan_id,
      status: "pending",
      created_at: now,
      updated_at: now
    };

    // Create empty steps array for now
    const steps: ExecutionStepRow[] = [];
    
    this.executionRepo.create(instance, steps);
    return instance;
  }

  async executeAsync(id: string, context: Record<string, any>) {
    const data = this.executionRepo.getWithSteps(id);
    if (!data) throw new Error(`Execution not found: ${id}`);
    
    const now = new Date().toISOString();
    
    // Update status to running
    this.executionRepo.update({ id, status: "running", started_at: data.instance.started_at ?? now, updated_at: now });
    
    // For now, just mark as completed since we're not actually executing tools
    // In a real implementation, this would coordinate with the tool coordinator
    this.executionRepo.update({ id, status: "completed", completed_at: now, updated_at: now });
    
    // Update all steps to completed
    for (const step of data.steps) {
      this.executionRepo.upsertStep({
        ...step,
        status: "completed",
        completed_at: now
      });
    }
  }

  cancelExecution(id: string): boolean {
    const data = this.executionRepo.getWithSteps(id);
    if (!data) return false;
    
    const now = new Date().toISOString();
    this.executionRepo.update({ id, status: "cancelled", updated_at: now });
    
    // Mark all pending/running steps as cancelled
    for (const step of data.steps) {
      if (step.status === "pending" || step.status === "running") {
        this.executionRepo.upsertStep({
          ...step,
          status: "cancelled",
          completed_at: now
        });
      }
    }
    
    return true;
  }
}

export const executionManager = ExecutionManager.getInstance();


