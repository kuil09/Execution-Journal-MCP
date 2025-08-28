import { MCPTool } from "mcp-framework";
import { z } from "zod";
import { SagaRepository } from "../storage/saga-repository.js";

class RecordActionTool extends MCPTool<{
  execution_id: string;
  step_id: string;
  action_type: "stopped" | "cleaned_up" | "notified" | "rolled_back" | "other";
  description: string;
  details?: Record<string, any>;
}> {
  name = "record_action";
  description = "Record any manual action taken during execution in the ledger";
  private sagaRepo = new SagaRepository();

  schema = {
    execution_id: {
      type: z.string(),
      description: "ID of the execution where the action occurred"
    },
    step_id: {
      type: z.string(),
      description: "ID of the step where the action was taken"
    },
    action_type: {
      type: z.enum(["stopped", "cleaned_up", "notified", "rolled_back", "other"]),
      description: "Type of action that was taken"
    },
    description: {
      type: z.string(),
      description: "Description of what action was performed"
    },
    details: {
      type: z.record(z.any()).optional(),
      description: "Additional details about the action"
    }
  };

  async execute(input: { execution_id: string; step_id: string; action_type: string; description: string; details?: any }) {
    try {
      const timestamp = new Date().toISOString();
      const actionId = `action_${Date.now().toString(36)}`;
      
      // Record as ledger event
      this.sagaRepo.insertEvent({
        saga_id: input.execution_id,
        event_type: "action_taken",
        timestamp,
        data_json: JSON.stringify({
          step_id: input.step_id,
          action_type: input.action_type,
          description: input.description,
          details: input.details ?? null
        })
      });
      
      const resultText = `Action recorded successfully in ledger!

Action ID: ${actionId}
Execution ID: ${input.execution_id}
Step ID: ${input.step_id}
Action Type: ${input.action_type}
Description: ${input.description}
Timestamp: ${timestamp}
${input.details ? `Details: ${JSON.stringify(input.details, null, 2)}` : ''}

Note: This system provides a ledger for recording actions.
- You (AI) decide and perform actions; we record them
- Use this information for audit trails and decision history

Remember: Always consider contextual dependencies when taking actions.
If one tool call fails, related tool calls may also need attention.`;

      return {
        content: [{
          type: "text",
          text: resultText
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error recording action: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
}

export default RecordActionTool;
