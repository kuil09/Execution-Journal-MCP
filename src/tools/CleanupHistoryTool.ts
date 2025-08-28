import { z } from "zod";
import { ExecutionRepository } from "../storage/execution-repository.js";
import { PlanRepository } from "../storage/plan-repository.js";

const inputSchema = z.object({
  cleanup_type: z.enum(["completed_old", "failed_old", "orphaned_plans", "all_old"]).describe("Type of cleanup to perform"),
  older_than_days: z.number().min(1).max(365).optional().describe("Remove items older than this many days"),
  dry_run: z.boolean().optional().describe("Show what would be deleted without actually deleting"),
  include_events: z.boolean().optional().describe("Also clean up related events")
});

export default class CleanupHistoryTool {
  static description = "Clean up old and completed execution history to free up space";
  static inputSchema = inputSchema;

  private executionRepo = new ExecutionRepository();
  private planRepo = new PlanRepository();

  static async invoke(input: z.infer<typeof inputSchema>) {
    const tool = new CleanupHistoryTool();
    
    const olderThanDays = input.older_than_days || 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    const cutoffDateStr = cutoffDate.toISOString();
    
    let itemsToDelete: any[] = [];
    let message = "";
    
    switch (input.cleanup_type) {
      case "completed_old":
        itemsToDelete = tool.getOldCompletedExecutions(cutoffDateStr);
        message = `Found ${itemsToDelete.length} old completed executions`;
        break;
      case "failed_old":
        itemsToDelete = tool.getOldFailedExecutions(cutoffDateStr);
        message = `Found ${itemsToDelete.length} old failed executions`;
        break;
      case "orphaned_plans":
        itemsToDelete = tool.getOrphanedPlans();
        message = `Found ${itemsToDelete.length} orphaned plans`;
        break;
      case "all_old":
        itemsToDelete = tool.getAllOldItems(cutoffDateStr);
        message = `Found ${itemsToDelete.length} old items total`;
        break;
    }
    
    if (input.dry_run) {
      return {
        message: `${message} (DRY RUN - nothing deleted)`,
        cleanup_type: input.cleanup_type,
        items_found: itemsToDelete.length,
        items_to_delete: itemsToDelete,
        dry_run: true
      };
    }
    
    // Perform actual cleanup
    const deletedCount = await tool.performCleanup(itemsToDelete, input.cleanup_type, input.include_events);
    
    return {
      message: `Cleanup completed: ${deletedCount} items deleted`,
      cleanup_type: input.cleanup_type,
      items_found: itemsToDelete.length,
      items_deleted: deletedCount,
      dry_run: false
    };
  }

  private getOldCompletedExecutions(cutoffDate: string): any[] {
    const sql = `
      SELECT * FROM execution_instances 
      WHERE status = 'completed' 
      AND completed_at < ?
      ORDER BY completed_at ASC
    `;
    return this.executionRepo.db.prepare(sql).all(cutoffDate);
  }

  private getOldFailedExecutions(cutoffDate: string): any[] {
    const sql = `
      SELECT * FROM execution_instances 
      WHERE status IN ('failed', 'cancelled') 
      AND updated_at < ?
      ORDER BY updated_at ASC
    `;
    return this.executionRepo.db.prepare(sql).all(cutoffDate);
  }

  private getOrphanedPlans(): any[] {
    const sql = `
      SELECT p.* FROM plans p
      LEFT JOIN execution_instances e ON p.plan_id = e.plan_id
      WHERE e.plan_id IS NULL
      ORDER BY p.created_at ASC
    `;
    return this.planRepo.db.prepare(sql).all();
  }

  private getAllOldItems(cutoffDate: string): any[] {
    const sql = `
      SELECT * FROM execution_instances 
      WHERE updated_at < ?
      ORDER BY updated_at ASC
    `;
    return this.executionRepo.db.prepare(sql).all(cutoffDate);
  }

  private async performCleanup(itemsToDelete: any[], cleanupType: string, includeEvents: boolean = false): Promise<number> {
    let deletedCount = 0;
    
    for (const item of itemsToDelete) {
      try {
        if (cleanupType === "orphaned_plans") {
          // Delete orphaned plan
          this.planRepo.delete(item.plan_id);
          deletedCount++;
        } else {
          // Delete execution instance and related data
          const executionId = item.id;
          
          // Delete related events first
          if (includeEvents) {
            this.executionRepo.db.prepare(`
              DELETE FROM execution_events WHERE execution_id = ?
            `).run(executionId);
          }
          
          // Delete related steps
          this.executionRepo.db.prepare(`
            DELETE FROM execution_steps WHERE execution_id = ?
          `).run(executionId);
          
          // Delete execution instance
          this.executionRepo.db.prepare(`
            DELETE FROM execution_instances WHERE id = ?
          `).run(executionId);
          
          deletedCount++;
        }
      } catch (error) {
        console.error(`Error deleting item ${item.id}:`, error);
      }
    }
    
    return deletedCount;
  }
}
