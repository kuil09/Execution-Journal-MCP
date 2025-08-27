import { MCPTool } from "mcp-framework";
import { z } from "zod";

class RecordCompensationTool extends MCPTool<{
  execution_id: string;
  step_id: string;
  reason: string;
  action_taken: string;
  details?: Record<string, any>;
}> {
  name = "record_compensation";
  description = "Record a compensation action that was performed manually";

  schema = {
    execution_id: {
      type: z.string(),
      description: "ID of the execution where the compensation occurred",
    },
    step_id: {
      type: z.string(),
      description: "ID of the step that was compensated",
    },
    reason: {
      type: z.string(),
      description: "Reason why the compensation was necessary",
    },
    action_taken: {
      type: z.string(),
      description: "Description of what compensation action was performed",
    },
    details: {
      type: z.record(z.any()).optional(),
      description: "Additional details about the compensation",
    }
  };

  async execute(input: { execution_id: string; step_id: string; reason: string; action_taken: string; details?: any }) {
    try {
      const timestamp = new Date().toISOString();
      const compensationId = `comp_${Date.now().toString(36)}`;

      const resultText = `Compensation action recorded successfully!

Compensation ID: ${compensationId}
Execution ID: ${input.execution_id}
Step ID: ${input.step_id}
Reason: ${input.reason}
Action Taken: ${input.action_taken}
Timestamp: ${timestamp}
${input.details ? `Details: ${JSON.stringify(input.details, null, 2)}` : ''}

Note: This is a tool execution planning system, not the MSA Saga pattern.
- Compensation actions are recorded but not automatically executed
- You must manually invoke compensation tools when failures occur
- This tool helps track what was compensated and why
- Use this information for audit trails and debugging

Remember: Always consider contextual dependencies when compensating operations.
If one tool call fails, related tool calls may also need to be compensated.`;

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
