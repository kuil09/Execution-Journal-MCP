import { MCPTool } from "mcp-framework";
import { z } from "zod";
import { sagaManager } from "../core/saga-manager.js";

class ControlTool extends MCPTool<{
  action: "cancel";
  execution_id: string;
}> {
  name = "control";
  description = "Control execution of a tool execution plan (cancel only)";

  schema = {
    action: {
      type: z.enum(["cancel"]),
      description: "Action to perform on the execution"
    },
    execution_id: {
      type: z.string(),
      description: "ID of the execution to control"
    },
    // simplified: cancel only
  };

  async execute(input: { action: "cancel"; execution_id: string }) {
    try {
      let result;
      let resultText = "";
      
      switch (input.action) {
        case "cancel":
          result = sagaManager.cancelSAGA(input.execution_id);
          resultText = `Execution ${result.id} cancelled successfully.
Current Status: ${result.status}

Note: This is a tool execution planning system, not the MSA Saga pattern.
- Execution is stopped but not automatically rolled back
- You must manually execute cancellation actions for completed steps
- Use record_compensation to log what was cancelled
- Consider the impact on related operations`;
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
          text: `Error controlling execution: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
}

export default ControlTool;
