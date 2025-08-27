import { MCPTool } from "mcp-framework";
import { z } from "zod";
import { sagaManager } from "../core/saga-manager.js";

interface CancelExecutionInput { execution_id: string }

class CancelExecutionTool extends MCPTool<CancelExecutionInput> {
  name = "cancel_execution";
  description = "Cancel a running or paused execution";

  schema = {
    execution_id: { type: z.string(), description: "Execution ID to cancel" },
  };

  async execute(input: CancelExecutionInput) {
    const { execution_id } = input;
    try {
      const res = sagaManager.cancelSAGA(execution_id);
      return { content: [{ type: "text", text: `🛑 Execution cancelled (id=${execution_id}) | status=${res.status}` }] };
    } catch (e: any) {
      return { content: [{ type: "text", text: `❌ Cancel failed: ${e.message}` }] };
    }
  }
}

export default CancelExecutionTool;


