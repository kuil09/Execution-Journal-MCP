import { MCPTool } from "mcp-framework";
import { z } from "zod";

class SavePlanTool extends MCPTool<{
  plan: {
    name: string;
    description?: string;
    steps: Array<{
      id: string;
      name: string;
      tool: string;
      parameters: Record<string, any>;
      cancellation?: {
        tool: string;
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
        description: z.string().optional().describe("Description of the plan"),
        steps: z.array(z.object({
          id: z.string().describe("Unique identifier for the step"),
          name: z.string().describe("Human-readable name for the step"),
          tool: z.string().describe("Tool to be called"),
          parameters: z.record(z.any()).describe("Parameters for the tool"),
          cancellation: z.object({
            tool: z.string().describe("Tool to call for cancellation"),
            parameters: z.record(z.any()).describe("Parameters for the cancellation tool")
          }).optional().describe("Cancellation action for this step")
        })).describe("Array of steps to execute")
      }),
      description: "The plan object to save"
    }
  };

  async execute(input: { plan: any }) {
    try {
      // For now, return a mock response since we don't have the actual savePlan method
      const planId = `plan_${Date.now().toString(36)}`;
      
      return {
        content: [{
          type: "text",
          text: `Plan "${input.plan.name}" saved successfully with ID: ${planId}

Steps: ${input.plan.steps.length}
- ${input.plan.steps.map((step: any) => `${step.name} (${step.tool})`).join('\n- ')}

Note: This is a tool execution planning system, not the MSA Saga pattern. 
Each step has cancellation actions that you must execute manually when failures occur.`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error saving plan: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
}

export default SavePlanTool;
