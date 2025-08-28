import { z } from "zod";
import { ExecutionRepository } from "../storage/execution-repository.js";

const inputSchema = z.object({
  execution_id: z.string().describe("ID of the execution to query"),
  include_step_details: z.boolean().optional().describe("Include detailed step information"),
  include_events: z.boolean().optional().describe("Include journal events")
});

export default class QueryLedgerTool {
  static description = "Query the execution journal for status, progress, and history";
  static inputSchema = inputSchema;

  private executionRepo = new ExecutionRepository();

  static async invoke(input: z.infer<typeof inputSchema>) {
    const tool = new QueryLedgerTool();
    
    const data = tool.executionRepo.getWithSteps(input.execution_id);
    if (!data) {
      return {
        message: "Execution not found",
        execution_id: input.execution_id
      };
    }

    const { instance, steps } = data;
    const progress = `${steps.filter(s => s.status === "completed").length}/${steps.length} steps`;
    
    let events = [];
    if (input.include_events) {
      events = tool.executionRepo.queryEvents(input.execution_id);
    }

    return {
      message: "Journal Query Results",
      execution_id: instance.id,
      plan_id: instance.plan_id,
      status: instance.status,
      current_step: instance.current_step,
      progress,
      started_at: instance.started_at,
      completed_at: instance.completed_at,
      error: instance.error,
      steps: input.include_step_details ? steps.map(s => ({
        step_id: s.step_id,
        name: s.name,
        tool_name: s.tool_name,
        status: s.status,
        started_at: s.started_at,
        completed_at: s.completed_at,
        result: s.result_json ? JSON.parse(s.result_json) : undefined,
        error: s.error,
        cancellable: s.cancellable
      })) : undefined,
      events: events.length > 0 ? events : undefined
    };
  }
}
