import { MCPTool } from "mcp-framework";
import { z } from "zod";
import { sagaManager } from "../core/saga-manager.js";

class RecordExecutionStartTool extends MCPTool<{
  plan_id: string;
  notes?: string;
}> {
  name = "record_execution_start";
  description = "Record the start of plan execution in the ledger";

  schema = {
    plan_id: {
      type: z.string(),
      description: "ID of the plan to execute"
    },
    notes: {
      type: z.string().optional(),
      description: "Optional notes about this execution"
    }
  };

  async execute(input: { plan_id: string; notes?: string }) {
    try {
      const execution = sagaManager.createSAGA(input.plan_id, {});
      
      // Start execution asynchronously
      sagaManager.executeAsync(execution.id, {}).catch(() => {});
      
      return {
        content: [{
          type: "text",
          text: `Execution start recorded in ledger!

Execution ID: ${execution.id}
Plan ID: ${input.plan_id}
${input.notes ? `Notes: ${input.notes}` : ''}

Note: This system provides a ledger for recording execution events.
- Execution start has been recorded in the ledger
- Tools are executed sequentially
- Use query_ledger to monitor progress
- Record decisions and actions as they occur`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error recording execution start: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
}

export default RecordExecutionStartTool;
