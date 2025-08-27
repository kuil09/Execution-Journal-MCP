import { MCPTool } from "mcp-framework";
import { z } from "zod";
import { sagaManager } from "../core/saga-manager.js";

class ExecutePlanTool extends MCPTool<{
  plan_id: string;
  execution_options?: {
    concurrency?: number;
    timeout?: number;
    pause_on_error?: boolean;
  };
}> {
  name = "execute_plan";
  description = "Execute a saved tool execution plan";

  schema = {
    plan_id: {
      type: z.string(),
      description: "ID of the plan to execute"
    },
    execution_options: {
      type: z.object({
        concurrency: z.number().optional().describe("Number of concurrent tool executions (default: 1)"),
        timeout: z.number().optional().describe("Timeout for each tool execution in milliseconds"),
        pause_on_error: z.boolean().optional().describe("Whether to pause execution on first error")
      }).optional(),
      description: "Optional execution configuration"
    }
  };

  async execute(input: { plan_id: string; execution_options?: any }) {
    try {
      const context = input.execution_options?.context || {};
      const execution = sagaManager.createSAGA(input.plan_id, context);
      
      // Start execution asynchronously
      sagaManager.executeAsync(execution.id, {
        pause_on_error: input.execution_options?.pause_on_error ?? true,
        concurrency: input.execution_options?.concurrency ?? 1
      }).catch(() => {}); // Let saga manager handle errors
      
      return {
        content: [{
          type: "text",
          text: `Plan execution started successfully!

Execution ID: ${execution.id}
Plan ID: ${input.plan_id}
Options: ${JSON.stringify(input.execution_options || {}, null, 2)}

Note: This is a tool execution planning system, not the MSA Saga pattern.
- Tools are executed sequentially (parallel execution planned for future)
- You must monitor execution status and handle failures manually
- Cancellation actions must be explicitly invoked when tools fail
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
