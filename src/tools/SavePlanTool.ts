import { MCPTool } from "mcp-framework";
import { z } from "zod";
import { PlanRepository, StoredPlan } from "../storage/plan-repository.js";
import { v4 as uuidv4 } from "uuid";

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
  private planRepo = new PlanRepository();

  schema = {
    plan: {
      type: z.object({
        name: z.string().describe("Name of the plan"),
        description: z.string().optional().describe("Description of the plan"),
        steps: z.array(z.object({
          id: z.string().describe("Unique identifier for the step"),
          name: z.string().describe("Human-readable name for the step"),
          tool: z.string().describe("Tool to be called"),
          tool_name: z.string().describe("Tool name (alias for tool field)").optional(),
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
      const planId = `plan_${uuidv4()}`;
      const now = new Date().toISOString();
      
      // Normalize steps to ensure tool_name field exists
      const normalizedSteps = input.plan.steps.map((step: any) => ({
        ...step,
        tool_name: step.tool_name || step.tool // Ensure tool_name is set
      }));
      
      const storedPlan: StoredPlan = {
        plan_id: planId,
        name: input.plan.name,
        steps: normalizedSteps,
        created_at: now
      };
      
      this.planRepo.save(storedPlan);
      
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
