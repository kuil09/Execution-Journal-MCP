import { MCPTool } from "mcp-framework";
import { z } from "zod";
import { PlanRepository, StoredPlan } from "../storage/plan-repository.js";
import { v4 as uuidv4 } from "uuid";

class RecordPlanTool extends MCPTool<{
  plan: {
    name: string;
    description?: string;
    steps: Array<{
      id: string;
      name: string;
      tool: string;
      parameters: Record<string, any>;
      cancellable?: "reversible" | "partially-reversible" | "irreversible";
    }>;
  };
}> {
  name = "record_plan";
  description = "Record a planned sequence of tool calls in the ledger";
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
          parameters: z.record(z.any()).describe("Parameters for the tool"),
          cancellable: z.enum(["reversible", "partially-reversible", "irreversible"]).optional().describe("Whether and how this step can be cancelled (ledger use only)")
        })).describe("Array of steps to execute")
      }),
      description: "The plan object to record"
    }
  };

  async execute(input: { plan: any }) {
    try {
      const planId = `plan_${uuidv4()}`;
      const now = new Date().toISOString();
      
      // Normalize steps to ensure tool_name field exists (use 'tool')
      const normalizedSteps = input.plan.steps.map((step: any) => ({
        id: step.id,
        name: step.name,
        tool_name: step.tool,
        parameters: step.parameters,
        cancellable: step.cancellable ?? undefined,
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
          text: `Plan recorded successfully in ledger!

Plan ID: ${planId}
Name: ${input.plan.name}
Steps: ${input.plan.steps.length}
- ${input.plan.steps.map((step: any) => `${step.name} (${step.tool})${step.cancellable ? ` [${step.cancellable}]` : ''}`).join('\n- ')}

Note: This system provides a ledger for recording plans and decisions.
- Your plan has been recorded in the ledger
- Each step includes cancellability metadata for tracking
- Use query_ledger to monitor execution progress`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error recording plan: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
}

export default RecordPlanTool;
