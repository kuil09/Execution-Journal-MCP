import { z } from "zod";
import { executionManager } from "../core/execution-manager.js";
import { ExecutionRepository } from "../storage/execution-repository.js";

const inputSchema = z.object({
  execution_id: z.string().describe("ID of the execution to control"),
  action: z.enum(["stop", "continue"]).describe("Action to take: stop or continue"),
  reason: z.string().describe("Reason for this decision"),
  details: z.string().optional().describe("Additional details about the decision")
});

export default class RecordDecisionTool {
  static description = "Record a decision made during execution (stop/continue) in the journal";
  static inputSchema = inputSchema;

  private executionRepo = new ExecutionRepository();

  static async invoke(input: z.infer<typeof inputSchema>) {
    const tool = new RecordDecisionTool();
    
    if (input.action === "stop") {
      // Record the decision in the journal
      tool.executionRepo.insertEvent({
        execution_id: input.execution_id,
        event_type: "decision_recorded",
        data_json: JSON.stringify({
          action: "stop",
          reason: input.reason,
          details: input.details,
          timestamp: new Date().toISOString()
        })
      });

      // Cancel the execution
      const result = executionManager.cancelExecution(input.execution_id);
      
      return {
        message: "Decision recorded: Execution stopped",
        execution_id: input.execution_id,
        action: "stop",
        reason: input.reason,
        cancelled: result
      };
    } else {
      // Record the decision to continue
      tool.executionRepo.insertEvent({
        execution_id: input.execution_id,
        event_type: "decision_recorded",
        data_json: JSON.stringify({
          action: "continue",
          reason: input.reason,
          details: input.details,
          timestamp: new Date().toISOString()
        })
      });

      return {
        message: "Decision recorded: Execution will continue",
        execution_id: input.execution_id,
        action: "continue",
        reason: input.reason
      };
    }
  }
}
