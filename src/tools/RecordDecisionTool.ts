import { MCPTool } from "mcp-framework";
import { z } from "zod";
import { sagaManager } from "../core/saga-manager.js";
import { SagaRepository } from "../storage/saga-repository.js";

class RecordDecisionTool extends MCPTool<{
  action: "stop" | "continue";
  execution_id: string;
  reason: string;
  details?: Record<string, any>;
}> {
  name = "record_decision";
  description = "Record a decision made during execution (stop/continue) in the ledger";
  private sagaRepo = new SagaRepository();

  schema = {
    action: {
      type: z.enum(["stop", "continue"]),
      description: "Decision made about execution"
    },
    execution_id: {
      type: z.string(),
      description: "ID of the execution where the decision was made"
    },
    reason: {
      type: z.string(),
      description: "Reason for the decision"
    },
    details: {
      type: z.record(z.any()).optional(),
      description: "Additional details about the decision"
    }
  };

  async execute(input: { action: "stop" | "continue"; execution_id: string; reason: string; details?: any }) {
    try {
      let result;
      let resultText = "";
      
      // Record decision in ledger first
      this.sagaRepo.insertEvent({
        saga_id: input.execution_id,
        event_type: "decision_made",
        timestamp: new Date().toISOString(),
        data_json: JSON.stringify({
          action: input.action,
          reason: input.reason,
          details: input.details ?? null
        })
      });
      
      switch (input.action) {
        case "stop":
          result = sagaManager.cancelSAGA(input.execution_id);
          resultText = `Decision recorded: Execution ${result.id} stopped.
Current Status: ${result.status}
Reason: ${input.reason}

Note: This system provides a ledger for recording decisions.
- Your decision to stop has been recorded
- Execution is stopped but not automatically rolled back
- You must manually handle any cleanup needed
- Use record_action to log what cleanup was performed`;
          break;
          
        case "continue":
          resultText = `Decision recorded: Execution ${input.execution_id} marked for continuation.
Reason: ${input.reason}

Note: This system provides a ledger for recording decisions.
- Your decision to continue has been recorded
- Execution continues from current state
- Monitor status to ensure smooth continuation
- Be prepared to handle any failures that occur`;
          break;
      }
      
      return {
        content: [{
          type: "text",
          text: resultText
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error recording decision: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
}

export default RecordDecisionTool;
