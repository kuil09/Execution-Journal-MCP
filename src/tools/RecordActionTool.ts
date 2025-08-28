import { z } from "zod";
import { ExecutionRepository } from "../storage/execution-repository.js";

const inputSchema = z.object({
  execution_id: z.string().describe("ID of the execution where the action was taken"),
  step_id: z.string().optional().describe("ID of the specific step if action relates to a step"),
  action_type: z.enum(["stopped", "cleaned_up", "notified", "rolled_back", "other"]).describe("Type of action taken"),
  description: z.string().describe("Description of what was done"),
  details: z.string().optional().describe("Additional details about the action")
});

export default class RecordActionTool {
  static description = "Record any manual action taken during execution in the journal";
  static inputSchema = inputSchema;

  private executionRepo = new ExecutionRepository();

  static async invoke(input: z.infer<typeof inputSchema>) {
    const tool = new RecordActionTool();
    
    // Record the action in the journal
    tool.executionRepo.insertEvent({
      execution_id: input.execution_id,
      event_type: "action_taken",
      data_json: JSON.stringify({
        step_id: input.step_id,
        action_type: input.action_type,
        description: input.description,
        details: input.details,
        timestamp: new Date().toISOString()
      })
    });

    return {
      message: "Action recorded successfully in journal!",
      execution_id: input.execution_id,
      step_id: input.step_id,
      action_type: input.action_type,
      description: input.description
    };
  }
}
