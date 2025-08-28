import { MCPTool } from "mcp-framework";
import { z } from "zod";
import { sagaManager } from "../core/saga-manager.js";

class ExecutePlanTool extends MCPTool<{
  plan_id: string;
}> {
  name = "execute_plan";
  description = "Execute a saved tool execution plan";

  schema = {
    plan_id: {
      type: z.string(),
      description: "ID of the plan to execute"
    },
    // simplified: no execution options
  };

  async execute(input: { plan_id: string }) {
    try {
      const execution = sagaManager.createSAGA(input.plan_id, {});
      
      // Start execution asynchronously
      sagaManager.executeAsync(execution.id, {}).catch(() => {});
      
      return {
        content: [{
          type: "text",
          text: `Plan execution started successfully (sequential)!

Execution ID: ${execution.id}
Plan ID: ${input.plan_id}

Note: This is a tool execution planning system, not the MSA Saga pattern.
- Tools are executed sequentially
- You must monitor execution status and handle failures manually
- Use the status tool to monitor progress`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error executing plan: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
}

export default ExecutePlanTool;
