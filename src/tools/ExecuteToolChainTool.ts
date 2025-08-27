import { MCPTool } from "mcp-framework";
import { z } from "zod";
import { sagaManager } from "../core/saga-manager.js";

interface ExecuteToolChainInput {
  plan_id: string;
  context?: Record<string, any>;
  execution_options?: {
    auto_compensate?: boolean;
    pause_on_error?: boolean;
  };
}

class ExecuteToolChainTool extends MCPTool<ExecuteToolChainInput> {
  name = "execute_tool_chain";
  description = "Execute planned tool chains and track progress";

  schema = {
    plan_id: {
      type: z.string(),
      description: "Plan ID to execute",
    },
    context: {
      type: z.record(z.any()).optional(),
      description: "Execution context",
    },
    execution_options: {
      type: z.object({
        auto_compensate: z.boolean().optional(),
        pause_on_error: z.boolean().optional(),
      }).optional(),
      description: "Execution options",
    },
  };

  async execute(input: ExecuteToolChainInput) {
    const { plan_id, context = {}, execution_options = {} } = input;
    const sagaInstance = await sagaManager.createSAGA(plan_id, context);
    // fire and forget async execution
    sagaManager.executeAsync(sagaInstance.id, execution_options).catch(() => {});
    return {
      content: [
        {
          type: "text",
          text: `⚡ Tool chain execution has started!\n\n` +
                `Execution ID: ${sagaInstance.id}\n` +
                `Plan ID: ${plan_id}\n` +
                `Execution options:\n` +
                `- Auto compensate: ${execution_options.auto_compensate ?? false}\n` +
                `- Pause on error: ${execution_options.pause_on_error ?? false}\n\n` +
                `📊 Use the get_execution_status tool to check progress.\n` +
                `🔧 You can query status using Execution ID: ${sagaInstance.id}.`
        }
      ]
    };
  }
}

export default ExecuteToolChainTool;