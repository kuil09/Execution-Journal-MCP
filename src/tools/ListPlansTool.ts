import { MCPTool } from "mcp-framework";
import { z } from "zod";
import { PlanRepository } from "../storage/plan-repository.js";

interface ListPlansInput {
  offset?: number;
  limit?: number;
}

class ListPlansTool extends MCPTool<ListPlansInput> {
  name = "list_plans";
  description = "List saved plans with pagination";

  schema = {
    offset: { type: z.number().optional(), description: "Offset for pagination" },
    limit: { type: z.number().optional(), description: "Page size (default 50)" },
  };

  async execute(input: ListPlansInput) {
    const repo = new PlanRepository();
    const plans = repo.list({ offset: input.offset, limit: input.limit });
    const summary = plans.map((p) => ({ plan_id: p.plan_id, name: p.name, steps: p.steps.length, created_at: p.created_at }));
    return {
      content: [
        {
          type: "text",
          text: `📚 Saved Plans (count: ${plans.length})\n\n${summary
            .map((p, i) => `${i + 1}. ${p.name} (id=${p.plan_id}) steps=${p.steps} created=${p.created_at}`)
            .join("\n")}`,
        },
      ],
    };
  }
}

export default ListPlansTool;


