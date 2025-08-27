import { MCPTool } from "mcp-framework";
import { z } from "zod";
import { PlanRepository } from "../storage/plan-repository.js";

interface DeletePlanInput {
  plan_id: string;
}

class DeletePlanTool extends MCPTool<DeletePlanInput> {
  name = "delete_plan";
  description = "Delete a saved plan by ID (fails if executions exist)";

  schema = {
    plan_id: { type: z.string(), description: "Plan ID to delete" },
  };

  async execute(input: DeletePlanInput) {
    const repo = new PlanRepository();
    try {
      const deleted = repo.delete(input.plan_id);
      if (!deleted) {
        return { content: [{ type: "text", text: `❌ Plan not found: ${input.plan_id}` }] };
      }
      return { content: [{ type: "text", text: `🗑️ Plan deleted: ${input.plan_id}` }] };
    } catch (e: any) {
      const msg = e?.message || String(e);
      if (repo.hasExecutions(input.plan_id)) {
        return {
          content: [{
            type: "text",
            text: `🚫 Cannot delete plan '${input.plan_id}' because executions exist.\n` +
                  `Use cancel_execution for active runs, or wait for completion, then retry.`
          }]
        };
      }
      return { content: [{ type: "text", text: `❌ Delete failed: ${msg}` }] };
    }
  }
}

export default DeletePlanTool;


