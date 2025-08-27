export interface ToolExecutionOptions {
  timeoutMs?: number;
  retry?: {
    maxAttempts: number;
    backoff: 'linear' | 'exponential';
    initialDelayMs?: number;
  };
}

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

  async executeTool(toolName: string, parameters: Record<string, any>, options: ToolExecutionOptions = {}): Promise<any> {
    const timeoutMs = options.timeoutMs ?? 30_000;
    const retryCfg = options.retry ?? { maxAttempts: 1, backoff: 'linear', initialDelayMs: 300 };
    const initialDelayMs = retryCfg.initialDelayMs ?? 300;

    let attempt = 0;
    let delay = initialDelayMs;

    while (attempt < retryCfg.maxAttempts) {
      attempt += 1;
      try {
        const execPromise = this.registry.has(toolName)
          ? this.registry.get(toolName)!(parameters)
          : this.mockInvoke(toolName, parameters);
        const result = await this.runWithTimeout(execPromise, timeoutMs);
        return { ok: true, attempt, result };
      } catch (err) {
        if (attempt >= retryCfg.maxAttempts) {
          throw err;
        }
        await new Promise((r) => setTimeout(r, delay));
        if (retryCfg.backoff === 'exponential') {
          delay *= 2;
        }
      }
    }
    return { ok: false };
  }

  private async runWithTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Tool execution timeout')), timeoutMs)),
    ]);
  }

  private async mockInvoke(toolName: string, parameters: Record<string, any>): Promise<any> {
    await new Promise((r) => setTimeout(r, 300));
    return { tool: toolName, parameters, success: true };
  }
}

export const toolCoordinator = ToolCoordinator.getInstance();


