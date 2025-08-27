import { MCPTool } from "mcp-framework";
import { z } from "zod";

class SavePlanTool extends MCPTool<{
  plan: {
    name: string;
    description?: string;
    steps: Array<{
      id: string;
      name: string;
      tool_name: string;
      parameters: Record<string, any>;
      depends_on?: string[];
      compensation?: {
        tool_name: string;
        parameters: Record<string, any>;
      };
    }>;
  };
}> {
  name = "save_plan";
  description = "Save a tool execution plan with contextual dependencies";

  schema = {
    plan: {
      type: z.object({
        name: z.string().describe("Name of the plan"),
        description: z
          .string()
          .optional()
          .describe("Description of the plan"),
        steps: z
          .array(
            z.object({
              id: z.string().describe("Unique identifier for the step"),
              name: z.string().describe("Human-readable name for the step"),
              tool_name: z.string().describe("Tool to be called"),
              parameters: z
                .record(z.any())
                .describe("Parameters for the tool"),
              depends_on: z
                .array(z.string())
                .optional()
                .describe("IDs of steps this step depends on"),
              compensation: z
                .object({
                  tool_name: z
                    .string()
                    .describe("Tool to call for compensation"),
                  parameters: z
                    .record(z.any())
                    .describe("Parameters for the compensation tool"),
                })
                .optional()
                .describe("Compensation action for this step"),
            })
          )
          .describe("Array of steps to execute"),
      }),
      description: "The plan object to save",
    },
  };

  async execute(input: { plan: any }) {
    try {
      const planId = `plan_${Date.now().toString(36)}`;

      return {
        content: [
          {
            type: "json",
            json: {
              plan_id: planId,
              name: input.plan.name,
              step_count: input.plan.steps.length,
              note:
                "This is a tool execution planning system, not the MSA Saga pattern. Each step may define compensation actions that must be executed manually when failures occur.",
            },
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "json",
            json: {
              error:
                error instanceof Error
                  ? error.message
                  : String(error),
            },
          },
        ],
      };
    }
  }
}

export default SavePlanTool;
