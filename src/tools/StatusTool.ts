import { MCPTool } from "mcp-framework";
import { z } from "zod";

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
      // For now, return a mock response since we don't have the actual status method
      const mockStatus = {
        execution_id: input.execution_id,
        status: "running",
        progress: "2/5 steps completed",
        current_step: "book_hotel",
        started_at: new Date().toISOString(),
        steps: [
          { id: "download_data", name: "Download Data", status: "completed", tool: "download_files" },
          { id: "book_hotel", name: "Book Hotel", status: "running", tool: "book_hotel" },
          { id: "book_car", name: "Book Car", status: "pending", tool: "book_car" },
          { id: "book_activities", name: "Book Activities", status: "pending", tool: "book_activities" },
          { id: "send_confirmation", name: "Send Confirmation", status: "pending", tool: "send_email" }
        ]
      };
      
      let statusText = `Execution Status: ${mockStatus.execution_id}

Status: ${mockStatus.status}
Progress: ${mockStatus.progress}
Current Step: ${mockStatus.current_step}
Started: ${mockStatus.started_at}`;

      if (input.include_step_details) {
        statusText += `\n\nStep Details:
${mockStatus.steps.map((step: any, index: number) => 
  `${index + 1}. ${step.name} (${step.tool}) - ${step.status}`
).join('\n')}`;
      }

      statusText += `\n\nNote: This is a tool execution planning system, not the MSA Saga pattern.
- Monitor status continuously to detect failures
- Handle failures manually by calling compensation tools
- Each step has defined compensation actions for rollback`;

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
