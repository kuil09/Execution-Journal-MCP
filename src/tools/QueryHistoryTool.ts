import { z } from "zod";
import { ExecutionRepository } from "../storage/execution-repository.js";
import { PlanRepository } from "../storage/plan-repository.js";

const inputSchema = z.object({
  query_type: z.enum(["recent", "incomplete", "failed", "completed", "all"]).describe("Type of query to perform"),
  status_filter: z.array(z.enum(["pending", "running", "completed", "failed", "cancelled"])).optional().describe("Filter by specific statuses"),
  limit: z.number().min(1).max(100).optional().describe("Maximum number of results to return"),
  offset: z.number().min(0).optional().describe("Number of results to skip for pagination"),
  include_plans: z.boolean().optional().describe("Include plan information in results"),
  include_step_details: z.boolean().optional().describe("Include detailed step information")
});

export default class QueryHistoryTool {
  static description = "Query execution history with comprehensive filtering and pagination";
  static inputSchema = inputSchema;

  private executionRepo = new ExecutionRepository();
  private planRepo = new PlanRepository();

  static async invoke(input: z.infer<typeof inputSchema>) {
    const tool = new QueryHistoryTool();
    
    const limit = input.limit || 20;
    const offset = input.offset || 0;
    
    let results: any[] = [];
    
    switch (input.query_type) {
      case "recent":
        results = tool.getRecentExecutions(limit, offset);
        break;
      case "incomplete":
        results = tool.getIncompleteExecutions(limit, offset);
        break;
      case "failed":
        results = tool.getFailedExecutions(limit, offset);
        break;
      case "completed":
        results = tool.getCompletedExecutions(limit, offset);
        break;
      case "all":
        results = tool.getAllExecutions(limit, offset);
        break;
    }
    
    // Apply status filter if specified
    if (input.status_filter && input.status_filter.length > 0) {
      results = results.filter(exec => input.status_filter!.includes(exec.status));
    }
    
    // Enhance results with plan and step information if requested
    if (input.include_plans || input.include_step_details) {
      results = await tool.enhanceResults(results, input.include_plans, input.include_step_details);
    }
    
    return {
      message: `Found ${results.length} executions`,
      query_type: input.query_type,
      total_results: results.length,
      limit,
      offset,
      executions: results
    };
  }

  private getRecentExecutions(limit: number, offset: number): any[] {
    const sql = `
      SELECT * FROM execution_instances 
      ORDER BY updated_at DESC 
      LIMIT ? OFFSET ?
    `;
    return this.executionRepo.db.prepare(sql).all(limit, offset);
  }

  private getIncompleteExecutions(limit: number, offset: number): any[] {
    const sql = `
      SELECT * FROM execution_instances 
      WHERE status IN ('pending', 'running') 
      ORDER BY updated_at DESC 
      LIMIT ? OFFSET ?
    `;
    return this.executionRepo.db.prepare(sql).all(limit, offset);
  }

  private getFailedExecutions(limit: number, offset: number): any[] {
    const sql = `
      SELECT * FROM execution_instances 
      WHERE status IN ('failed', 'cancelled') 
      ORDER BY updated_at DESC 
      LIMIT ? OFFSET ?
    `;
    return this.executionRepo.db.prepare(sql).all(limit, offset);
  }

  private getCompletedExecutions(limit: number, offset: number): any[] {
    const sql = `
      SELECT * FROM execution_instances 
      WHERE status = 'completed' 
      ORDER BY completed_at DESC 
      LIMIT ? OFFSET ?
    `;
    return this.executionRepo.db.prepare(sql).all(limit, offset);
  }

  private getAllExecutions(limit: number, offset: number): any[] {
    const sql = `
      SELECT * FROM execution_instances 
      ORDER BY updated_at DESC 
      LIMIT ? OFFSET ?
    `;
    return this.executionRepo.db.prepare(sql).all(limit, offset);
  }

  private async enhanceResults(executions: any[], includePlans: boolean = false, includeSteps: boolean = false): Promise<any[]> {
    return executions.map(exec => {
      const enhanced: any = { ...exec };
      
      if (includePlans) {
        const plan = this.planRepo.get(exec.plan_id);
        enhanced.plan = plan ? {
          name: plan.name,
          created_at: plan.created_at
        } : null;
      }
      
      if (includeSteps) {
        const steps = this.executionRepo.db.prepare(`
          SELECT * FROM execution_steps 
          WHERE execution_id = ? 
          ORDER BY rowid ASC
        `).all(exec.id);
        enhanced.steps = steps;
      }
      
      return enhanced;
    });
  }
}
