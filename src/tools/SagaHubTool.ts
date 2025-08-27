import { MCPTool } from "mcp-framework";
import { z } from "zod";
import { PlanRepository } from "../storage/plan-repository.js";
import { sagaManager } from "../core/saga-manager.js";

type Action =
  | "save_plan"
  | "list_plans"
  | "execute"
  | "status"
  | "pause"
  | "resume"
  | "cancel"
  | "delete_plan"
  | "record_compensation";

interface SagaHubInput {
  action: Action;
  plan?: { plan_id?: string; name?: string; steps?: any[] };
  plan_id?: string;
  execution_id?: string;
  include_step_details?: boolean;
  execution_options?: { concurrency?: number; auto_compensate?: boolean; pause_on_error?: boolean };
  record?: { step_id: string; reason?: string; details?: Record<string, any> };
  pagination?: { offset?: number; limit?: number };
}

class SagaHubTool extends MCPTool<SagaHubInput> {
  name = "saga";
  description = "Unified SAGA hub tool for common actions (plan/save, execute, status, pause/resume/cancel, delete, record_compensation).";

  schema = {
    action: { type: z.enum(["save_plan","list_plans","execute","status","pause","resume","cancel","delete_plan","record_compensation"]) },
    plan: { type: z.object({ plan_id: z.string().optional(), name: z.string().optional(), steps: z.array(z.any()).optional() }).optional() },
    plan_id: { type: z.string().optional() },
    execution_id: { type: z.string().optional() },
    include_step_details: { type: z.boolean().optional() },
    execution_options: { type: z.object({ concurrency: z.number().optional(), auto_compensate: z.boolean().optional(), pause_on_error: z.boolean().optional() }).optional() },
    record: { type: z.object({ step_id: z.string(), reason: z.string().optional(), details: z.record(z.any()).optional() }).optional() },
    pagination: { type: z.object({ offset: z.number().optional(), limit: z.number().optional() }).optional() },
  };

  async execute(input: SagaHubInput) {
    const repo = new PlanRepository();
    switch (input.action) {
      case "save_plan": {
        if (!input.plan?.name || !input.plan?.steps) {
          return { content: [{ type: "text", text: "❌ Missing plan.name or plan.steps" }] };
        }
        const planId = input.plan.plan_id ?? `plan_${Date.now().toString(36)}`;
        repo.save({ plan_id: planId, name: input.plan.name, steps: input.plan.steps, created_at: new Date().toISOString() });
        return { content: [{ type: "text", text: `💾 Plan saved: ${planId}` }] };
      }
      case "list_plans": {
        const items = repo.list({ offset: input.pagination?.offset, limit: input.pagination?.limit });
        const lines = items.map((p) => `- ${p.name} (id=${p.plan_id}) steps=${p.steps.length} created=${p.created_at}`).join("\n");
        return { content: [{ type: "text", text: `📚 Plans (${items.length})\n${lines}` }] };
      }
      case "execute": {
        if (!input.plan_id) return { content: [{ type: "text", text: "❌ Missing plan_id" }] };
        const exec = sagaManager.createSAGA(input.plan_id, {});
        sagaManager.executeAsync(exec.id, input.execution_options ?? {}).catch(() => {});
        return { content: [{ type: "text", text: `⚡ Execution started: ${exec.id} (plan=${input.plan_id})` }] };
      }
      case "status": {
        if (!input.execution_id) return { content: [{ type: "text", text: "❌ Missing execution_id" }] };
        const s = sagaManager.getSAGA(input.execution_id);
        if (!s) return { content: [{ type: "text", text: `❌ Execution not found: ${input.execution_id}` }] };
        const basic = `📊 Status: ${s.status}\nProgress: ${s.progress}\nCurrent: ${s.current_step}`;
        if (!input.include_step_details) return { content: [{ type: "text", text: basic }] };
        const details = (s.steps || []).map((st: any, i: number) => `${i+1}. ${st.status} ${st.name} (${st.tool_name})`).join("\n");
        return { content: [{ type: "text", text: `${basic}\n\n${details}` }] };
      }
      case "pause": {
        if (!input.execution_id) return { content: [{ type: "text", text: "❌ Missing execution_id" }] };
        const res = sagaManager.pauseSAGA(input.execution_id);
        return { content: [{ type: "text", text: `⏸️ Paused: ${input.execution_id} status=${res.status}` }] };
      }
      case "resume": {
        if (!input.execution_id) return { content: [{ type: "text", text: "❌ Missing execution_id" }] };
        const res = sagaManager.resumeSAGA(input.execution_id, input.execution_options ?? {});
        return { content: [{ type: "text", text: `▶️ Resumed: ${input.execution_id} status=${res.status}` }] };
      }
      case "cancel": {
        if (!input.execution_id) return { content: [{ type: "text", text: "❌ Missing execution_id" }] };
        const res = sagaManager.cancelSAGA(input.execution_id);
        return { content: [{ type: "text", text: `🛑 Cancelled: ${input.execution_id} status=${res.status}` }] };
      }
      case "delete_plan": {
        if (!input.plan_id) return { content: [{ type: "text", text: "❌ Missing plan_id" }] };
        try {
          const ok = repo.delete(input.plan_id);
          return { content: [{ type: "text", text: ok ? `🗑️ Deleted plan: ${input.plan_id}` : `❌ Plan not found: ${input.plan_id}` }] };
        } catch (e: any) {
          return { content: [{ type: "text", text: `🚫 ${e?.message || String(e)}` }] };
        }
      }
      case "record_compensation": {
        if (!input.execution_id || !input.record?.step_id) return { content: [{ type: "text", text: "❌ Missing execution_id or record.step_id" }] };
        // Optionally we could import and call RecordCompensationTool logic directly; keep simple here
        return { content: [{ type: "text", text: `ℹ️ Use record_compensation tool directly for detailed logging.` }] };
      }
    }
  }
}

export default SagaHubTool;


