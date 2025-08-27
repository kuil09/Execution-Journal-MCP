import { MCPTool } from "mcp-framework";
import { z } from "zod";
import { SagaRepository } from "../storage/saga-repository.js";
import { getDb } from "../core/db.js";

interface RecordCompensationInput {
  execution_id: string;
  step_id: string;
  reason?: string;
  details?: Record<string, any>;
}

class RecordCompensationTool extends MCPTool<RecordCompensationInput> {
  name = "record_compensation";
  description = "Mark a step as compensated and log an event (AI-triggered).";

  schema = {
    execution_id: { type: z.string(), description: "Execution ID (saga_id)" },
    step_id: { type: z.string(), description: "Step ID to mark compensated" },
    reason: { type: z.string().optional(), description: "Reason for compensation" },
    details: { type: z.record(z.any()).optional(), description: "Additional info to log" },
  };

  async execute(input: RecordCompensationInput) {
    const { execution_id, step_id, reason, details } = input;
    const repo = new SagaRepository();
    const data = repo.getWithSteps(execution_id);
    if (!data) {
      return { content: [{ type: "text", text: `❌ Execution not found: ${execution_id}` }] };
    }
    const step = data.steps.find((s) => s.step_id === step_id);
    if (!step) {
      return { content: [{ type: "text", text: `❌ Step not found: ${step_id} (exec=${execution_id})` }] };
    }

    // Update step status to compensated
    const completedAt = new Date().toISOString();
    repo.upsertStep({
      saga_id: execution_id,
      step_id: step_id,
      name: step.name,
      tool_name: step.tool_name,
      status: "compensated",
      started_at: step.started_at,
      completed_at: completedAt,
      result_json: step.result_json,
      error: step.error,
    } as any);

    // Append saga event
    const db = getDb();
    const eventId = `evt_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    db.prepare(
      `INSERT INTO saga_events (event_id, saga_id, event_type, timestamp, data_json) VALUES (?, ?, ?, ?, ?)`
    ).run(
      eventId,
      execution_id,
      "compensation_recorded",
      completedAt,
      JSON.stringify({ step_id, reason, details })
    );

    return {
      content: [{
        type: "text",
        text: `↩️ Compensation recorded for step '${step_id}' in execution '${execution_id}'.${reason ? `\nReason: ${reason}` : ''}`
      }]
    };
  }
}

export default RecordCompensationTool;


