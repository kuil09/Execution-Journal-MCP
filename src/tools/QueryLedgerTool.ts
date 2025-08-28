import { MCPTool } from "mcp-framework";
import { z } from "zod";
import { sagaManager } from "../core/saga-manager.js";
import { SagaRepository } from "../storage/saga-repository.js";

class QueryLedgerTool extends MCPTool<{
  execution_id: string;
  include_step_details?: boolean;
  include_events?: boolean;
}> {
  name = "query_ledger";
  description = "Query the execution ledger for status, progress, and history";
  private sagaRepo = new SagaRepository();

  schema = {
    execution_id: {
      type: z.string(),
      description: "ID of the execution to query"
    },
    include_step_details: {
      type: z.boolean().optional(),
      description: "Whether to include detailed step information"
    },
    include_events: {
      type: z.boolean().optional(),
      description: "Whether to include ledger events history"
    }
  };

  async execute(input: { execution_id: string; include_step_details?: boolean; include_events?: boolean }) {
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
      
      let statusText = `Ledger Query Results: ${sagaStatus.execution_id}

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

      if (input.include_events) {
        // Query ledger events
        const events = this.sagaRepo.queryEvents(input.execution_id);
        if (events && events.length > 0) {
          statusText += `\n\nLedger Events:
${events.map((event: any, index: number) => 
  `${index + 1}. ${event.event_type} - ${event.timestamp}${event.data_json ? ` - ${JSON.parse(event.data_json).description || 'No description'}` : ''}`
).join('\n')}`;
        }
      }

      statusText += `\n\nNote: This system provides a ledger for recording decisions and actions.
- Monitor status continuously to detect failures
- Record decisions and actions using the ledger tools
- Each step has metadata for tracking cancellability`;

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
          text: `Error querying ledger: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
}

export default QueryLedgerTool;
