import { MCPTool } from "mcp-framework";
import { z } from "zod";
import { SagaRepository } from "../storage/saga-repository.js";

class RecordCompensationTool extends MCPTool<{
  execution_id: string;
  step_id: string;
  reason: string;
  action_taken: string;
  details?: Record<string, any>;
}> {
  name = "record_compensation";
  description = "Record a cancellation action that was performed manually";
  private sagaRepo = new SagaRepository();

  schema = {
    execution_id: {
      type: z.string(),
      description: "ID of the execution where the cancellation occurred"
    },
    step_id: {
      type: z.string(),
      description: "ID of the step that was cancelled"
    },
    reason: {
      type: z.string(),
      description: "Reason why the cancellation was necessary"
    },
    action_taken: {
      type: z.string(),
      description: "Description of what cancellation action was performed"
    },
    details: {
      type: z.record(z.any()).optional(),
      description: "Additional details about the cancellation"
    }
  };

  async execute(input: { execution_id: string; step_id: string; reason: string; action_taken: string; details?: any }) {
    try {
      const timestamp = new Date().toISOString();
      const compensationId = `comp_${Date.now().toString(36)}`;
      // Persist as ledger event
      this.sagaRepo.insertEvent({
        saga_id: input.execution_id,
        event_type: "compensation",
        timestamp,
        data_json: JSON.stringify({
          step_id: input.step_id,
          reason: input.reason,
          action_taken: input.action_taken,
          details: input.details ?? null
        })
      });
      
      const resultText = `Cancellation action recorded successfully!

Compensation ID: ${compensationId}
Execution ID: ${input.execution_id}
Step ID: ${input.step_id}
Reason: ${input.reason}
Action Taken: ${input.action_taken}
Timestamp: ${timestamp}
${input.details ? `Details: ${JSON.stringify(input.details, null, 2)}` : ''}

Note: This system provides a ledger. It does not execute cancellations.
- You (AI) decide and perform cancellations; we store the record
- Use this information for audit trails and debugging

Remember: Always consider contextual dependencies when cancelling operations.
If one tool call fails, related tool calls may also need to be cancelled.`;

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
          text: `Error recording compensation: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
}

export default RecordCompensationTool;
