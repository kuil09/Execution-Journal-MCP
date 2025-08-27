import { MCPTool } from "mcp-framework";
import { z } from "zod";
import { PlanRepository } from "../storage/plan-repository.js";

interface SavePlanInput {
  plan_id?: string;
  name: string;
  steps: any[];
}

class SavePlanTool extends MCPTool<SavePlanInput> {
  name = "save_plan";
  description = "Save an AI-defined plan structure to the database";

  schema = {
    plan_id: {
      type: z.string().optional(),
      description: "Optional custom plan ID. If omitted, one will be generated.",
    },
    name: {
      type: z.string(),
      description: "Human-friendly plan name",
    },
    steps: {
      type: z.array(z.any()),
      description: "Array of plan steps (DAG nodes)",
    },
  };

  async execute(input: SavePlanInput) {
    const planRepo = new PlanRepository();
    const planId = input.plan_id ?? `plan_${Date.now().toString(36)}`;
    const createdAt = new Date().toISOString();

    planRepo.save({ plan_id: planId, name: input.name, steps: input.steps, created_at: createdAt });

    return {
      content: [
        {
          type: "text",
          text: `💾 Plan saved successfully.\n\nPlan ID: ${planId}\nName: ${input.name}\nSteps: ${input.steps.length}`,
        },
      ],
    };
  }
}

export default SavePlanTool;


