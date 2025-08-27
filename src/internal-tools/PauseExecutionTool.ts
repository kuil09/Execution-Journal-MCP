import { MCPTool } from "mcp-framework";
import { z } from "zod";
import { sagaManager } from "../core/saga-manager.js";

interface PauseExecutionInput { execution_id: string }

class PauseExecutionTool extends MCPTool<PauseExecutionInput> {
  name = "pause_execution";
  description = "Pause a running execution";

  schema = {
    execution_id: { type: z.string(), description: "Execution ID to pause" },
  };

  async execute(input: PauseExecutionInput) {
    const { execution_id } = input;
    try {
      const res = sagaManager.pauseSAGA(execution_id);
      return { content: [{ type: "text", text: `⏸️ Execution paused (id=${execution_id}) | status=${res.status}` }] };
    } catch (e: any) {
      return { content: [{ type: "text", text: `❌ Pause failed: ${e.message}` }] };
    }
  }
}

export default PauseExecutionTool;


