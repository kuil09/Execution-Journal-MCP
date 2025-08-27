import { MCPTool } from "mcp-framework";
import { z } from "zod";
import { sagaManager } from "../core/saga-manager.js";

class StatusTool extends MCPTool<{
  execution_id: string;
  include_step_details?: boolean;
}> {
  name = "status";
  description = "Check the status of a tool execution plan";

  schema = {
    execution_id: {
      type: z.string(),
      description: "ID of the execution to check"
    },
    include_step_details: {
      type: z.boolean().optional(),
      description: "Whether to include detailed step information"
    }
  };

  async execute(input: { execution_id: string; include_step_details?: boolean }) {
    try {
      const sagaStatus = sagaManager.getSAGA(input.execution_id);
      
      if (!sagaStatus) {
        return {
          content: [{
            type: "text",
            text: `Execution not found: ${input.execution_id}`
          }]
        };
      }
      
      let statusText = `Execution Status: ${sagaStatus.execution_id}

Plan: ${sagaStatus.plan_name || sagaStatus.plan_id}
Status: ${sagaStatus.status}
Progress: ${sagaStatus.progress}
Current Step: ${sagaStatus.current_step || 'N/A'}
Started: ${sagaStatus.started_at || 'Not started'}
${sagaStatus.completed_at ? `Completed: ${sagaStatus.completed_at}` : ''}
${sagaStatus.error ? `Error: ${sagaStatus.error}` : ''}`;

      if (input.include_step_details && sagaStatus.steps) {
        statusText += `\n\nStep Details:
${sagaStatus.steps.map((step: any, index: number) => 
  `${index + 1}. ${step.name || step.step_id} (${step.tool_name}) - ${step.status}${step.error ? ` [Error: ${step.error}]` : ''}`
).join('\n')}`;
      }

      statusText += `\n\nNote: This is a tool execution planning system, not the MSA Saga pattern.
- Monitor status continuously to detect failures
- Handle failures manually by calling cancellation tools
- Each step has defined cancellation actions for rollback`;

      return {
        content: [{
          type: "text",
          text: statusText
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error checking status: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
}

export default StatusTool;
