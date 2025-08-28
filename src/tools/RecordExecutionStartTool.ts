import { z } from "zod";
import { executionManager } from "../core/execution-manager.js";

const inputSchema = z.object({
  plan_id: z.string().describe("ID of the plan to execute"),
  notes: z.string().optional().describe("Optional notes about this execution")
});

export default class RecordExecutionStartTool {
  static description = "Record the start of plan execution in the journal";
  static inputSchema = inputSchema;

  static async invoke(input: z.infer<typeof inputSchema>) {
    const execution = executionManager.createExecution(input.plan_id, {});
    
    // Start execution asynchronously
    executionManager.executeAsync(execution.id, {}).catch(() => {});
    
    return {
      message: "Execution start recorded in journal!",
      execution_id: execution.id,
      status: "started"
    };
  }
}
