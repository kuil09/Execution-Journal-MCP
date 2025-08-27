import { MCPTool } from "mcp-framework";
import { z } from "zod";
import { sagaManager } from "../core/saga-manager.js";

interface ResumeExecutionInput { execution_id: string }

class ResumeExecutionTool extends MCPTool<ResumeExecutionInput> {
  name = "resume_execution";
  description = "Resume a paused execution";

  schema = {
    execution_id: { type: z.string(), description: "Execution ID to resume" },
  };

  async execute(input: ResumeExecutionInput) {
    const { execution_id } = input;
    try {
      const res = sagaManager.resumeSAGA(execution_id, {});
      return { content: [{ type: "text", text: `▶️ Execution resumed (id=${execution_id}) | status=${res.status}` }] };
    } catch (e: any) {
      return { content: [{ type: "text", text: `❌ Resume failed: ${e.message}` }] };
    }
  }
}

export default ResumeExecutionTool;


