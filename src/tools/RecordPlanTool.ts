import { z } from "zod";
import { PlanRepository, PlanRow } from "../storage/plan-repository.js";
import { v4 as uuidv4 } from "uuid";

const inputSchema = z.object({
  name: z.string().describe("Name of the execution plan"),
  description: z.string().describe("Description of what the plan accomplishes"),
  steps: z.array(z.object({
    id: z.string().describe("Unique identifier for this step"),
    name: z.string().describe("Human-readable name for this step"),
    tool: z.string().describe("Name of the tool to execute"),
    parameters: z.record(z.any()).describe("Parameters to pass to the tool"),
    cancellable: z.enum(["reversible", "partially-reversible", "irreversible"]).describe("Whether this step can be cancelled/undone")
  })).describe("Sequential steps to execute")
});

export default class RecordPlanTool {
  static description = "Record a planned sequence of tool calls in the journal";
  static inputSchema = inputSchema;

  private planRepo = new PlanRepository();

  static async invoke(input: z.infer<typeof inputSchema>) {
    const tool = new RecordPlanTool();
    
    const planId = `plan_${uuidv4()}`;
    const now = new Date().toISOString();
    
    const storedPlan: PlanRow = {
      plan_id: planId,
      name: input.name,
      steps_json: JSON.stringify(input.steps),
      created_at: now
    };

    try {
      tool.planRepo.create(storedPlan);
      
      return {
        message: "Plan recorded successfully in journal!",
        plan_id: planId,
        name: input.name,
        steps_count: input.steps.length,
        created_at: now
      };
    } catch (error) {
      return {
        message: "Error recording plan",
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}
