import { MCPTool } from "mcp-framework";
import { z } from "zod";
import { PlanRepository } from "../storage/plan-repository.js";

interface UpdatePlanInput {
  plan_id: string;
  name?: string;
  steps?: any[];
}

class UpdatePlanTool extends MCPTool<UpdatePlanInput> {
  name = "update_plan";
  description = "Update an existing plan's name or steps";

  schema = {
    plan_id: { type: z.string(), description: "Plan ID to update" },
    name: { type: z.string().optional(), description: "New name" },
    steps: { type: z.array(z.any()).optional(), description: "New steps (replace)" },
  };

  async execute(input: UpdatePlanInput) {
    const repo = new PlanRepository();
    const updated = repo.update(input.plan_id, { name: input.name, steps: input.steps });
    if (!updated) {
      return {
        content: [
          { type: "text", text: `❌ Plan not found: ${input.plan_id}` },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: `✏️ Plan updated successfully.\n\nPlan ID: ${updated.plan_id}\nName: ${updated.name}\nSteps: ${updated.steps.length}`,
        },
      ],
    };
  }
}

export default UpdatePlanTool;


