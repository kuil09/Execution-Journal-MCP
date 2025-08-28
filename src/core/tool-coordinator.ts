// No execution options in simplified model

type ToolExecutor = (params: Record<string, any>) => Promise<any>;

class ToolCoordinator {
  private static instance: ToolCoordinator;
  private registry: Map<string, ToolExecutor> = new Map();

  static getInstance(): ToolCoordinator {
    if (!ToolCoordinator.instance) {
      ToolCoordinator.instance = new ToolCoordinator();
    }
    return ToolCoordinator.instance;
  }

  registerTool(toolName: string, executor: ToolExecutor): void {
    this.registry.set(toolName, executor);
  }

  hasTool(toolName: string): boolean {
    return this.registry.has(toolName);
  }

  async executeTool(toolName: string, parameters: Record<string, any>): Promise<any> {
    if (!this.registry.has(toolName)) {
      throw new Error(`Tool not registered: ${toolName}`);
    }
    const result = await this.registry.get(toolName)!(parameters);
    return { ok: true, result };
  }

  // No timeout handling in simplified model

  // mockInvoke removed in simplified model
}

export const toolCoordinator = ToolCoordinator.getInstance();


