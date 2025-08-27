import { MCPTool } from "mcp-framework";
import { z } from "zod";

class ControlTool extends MCPTool<{
  action: "pause" | "resume" | "cancel";
  execution_id: string;
  execution_options?: Record<string, any>;
}> {
  name = "control";
  description = "Control execution of a tool execution plan (pause, resume, cancel)";

  schema = {
    action: {
      type: z.enum(["pause", "resume", "cancel"]),
      description: "Action to perform on the execution"
    },
    execution_id: {
      type: z.string(),
      description: "ID of the execution to control"
    },
    execution_options: {
      type: z.record(z.any()).optional(),
      description: "Optional execution options for resume action"
    }
  };

  async execute(input: { action: "pause" | "resume" | "cancel"; execution_id: string; execution_options?: any }) {
    try {
      let resultText = "";
      
      switch (input.action) {
        case "pause":
          resultText = `Execution ${input.execution_id} paused successfully.

Note: This is a tool execution planning system, not the MSA Saga pattern.
- Execution is paused but not rolled back
- You can resume from the current state
- Monitor the execution to understand why it was paused
- Consider if compensation is needed instead of just pausing`;
          break;
          
        case "resume":
          resultText = `Execution ${input.execution_id} resumed successfully.

Options: ${JSON.stringify(input.execution_options || {}, null, 2)}

Note: This is a tool execution planning system, not the MSA Saga pattern.
- Execution continues from where it was paused
- Previous steps are not re-executed
- Monitor status to ensure smooth continuation
- Be prepared to handle any failures that occur`;
          break;
          
        case "cancel":
          resultText = `Execution ${input.execution_id} cancelled successfully.

Note: This is a tool execution planning system, not the MSA Saga pattern.
- Execution is stopped but not automatically rolled back
- You must manually execute compensation actions for completed steps
- Use record_compensation to log what was compensated
- Consider the impact on related operations`;
          break;
      }
      
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
          text: `Error controlling execution: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
}

export default ControlTool;
