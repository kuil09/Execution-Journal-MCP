import { MCPTool } from "mcp-framework";
import { z } from "zod";
import { sagaManager } from "../core/saga-manager.js";

interface GetExecutionStatusInput {
  execution_id: string;
  include_step_details?: boolean;
}

class GetExecutionStatusTool extends MCPTool<GetExecutionStatusInput> {
  name = "get_execution_status";
  description = "Query current status of running tool chains";

  schema = {
    execution_id: {
      type: z.string(),
      description: "Execution ID to query",
    },
    include_step_details: {
      type: z.boolean().optional(),
      description: "Include step-by-step details",
    },
  };

  async execute(input: GetExecutionStatusInput) {
    const { execution_id, include_step_details = false } = input;
    
    try {
      // Query status from SAGA Manager
      const saga = await sagaManager.getSAGA(execution_id);
      
      if (!saga) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Execution ID '${execution_id}' not found.\n\n` +
                    `Please verify the execution ID or start a new execution using the execute_tool_chain tool.`
            }
          ]
        };
      }
      
      let statusText = `📊 Execution Status Query Result\n\n` +
                       `Execution ID: ${execution_id}\n` +
                       `Plan Name: ${saga.plan_name || saga.plan_id}\n` +
                       `Status: ${this.getStatusEmoji(saga.status)} ${saga.status}\n` +
                       `Current Step: ${saga.current_step}\n` +
                       `Progress: ${saga.progress}\n` +
                       `Start Time: ${saga.started_at}\n`;
      
      if (saga.completed_at) {
        statusText += `Completion Time: ${saga.completed_at}\n`;
      }

      if (saga.error) {
        statusText += `⚠️ Error: ${saga.error}\n`;
      }
      
      if (include_step_details && saga.steps) {
        statusText += `\n📋 Step-by-Step Details:\n`;
        saga.steps.forEach((step: any, i: number) => {
          const stepEmoji = this.getStepStatusEmoji(step.status);
          statusText += `${i+1}. ${stepEmoji} ${step.name}\n`;
          statusText += `   Status: ${step.status}\n`;
          statusText += `   Tool: ${step.tool_name}\n`;
          
          if (step.started_at) {
            statusText += `   Started: ${step.started_at}\n`;
          }
          
          if (step.completed_at) {
            const duration = new Date(step.completed_at).getTime() - new Date(step.started_at).getTime();
            statusText += `   Completed: ${step.completed_at} (${duration}ms)\n`;
          }
          
          if (step.result) {
            statusText += `   Result: ${JSON.stringify(step.result)}\n`;
          }
          
          if (step.error) {
            statusText += `   ❌ Error: ${step.error}\n`;
          }
          
          statusText += '\n';
        });
      }

      // Next action suggestions
      if (saga.status === 'running') {
        statusText += `\n💡 Execution is in progress. Check status again in a moment.`;
      } else if (saga.status === 'completed') {
        statusText += `\n✅ All steps completed successfully!`;
      } else if (saga.status === 'failed') {
        statusText += `\n❌ Execution failed. Compensation transactions may be required.`;
      }
      
      return {
        content: [
          {
            type: "text",
            text: statusText
          }
        ]
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Error querying execution status: ${error.message}\n\n` +
                  `Please check the execution ID and try again.`
          }
        ]
      };
    }
  }

  private getStatusEmoji(status: string): string {
    const statusEmojis: Record<string, string> = {
      'planned': '📋',
      'running': '⚡',
      'paused': '⏸️',
      'completed': '✅',
      'failed': '❌',
      'compensating': '🔄',
      'compensated': '↩️'
    };
    return statusEmojis[status] || '❓';
  }

  private getStepStatusEmoji(status: string): string {
    const stepEmojis: Record<string, string> = {
      'pending': '⏳',
      'running': '⚡',
      'completed': '✅',
      'failed': '❌',
      'compensated': '↩️'
    };
    return stepEmojis[status] || '❓';
  }
}

export default GetExecutionStatusTool;