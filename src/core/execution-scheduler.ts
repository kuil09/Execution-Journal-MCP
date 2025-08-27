export interface PlanStepDef {
  id: string;
  tool_name: string;
  parameters?: Record<string, any>;
  depends_on?: string[];
}

export interface ScheduleOptions {
  concurrency?: number; // max parallel steps
}

export interface StepRunContext {
  runStep: (step: PlanStepDef) => Promise<void>; // caller provides execution impl
  onStepStart?: (stepId: string) => void;
  onStepComplete?: (stepId: string) => void;
  onStepError?: (stepId: string, error: any) => void;
}

export class ExecutionScheduler {
  constructor(private steps: PlanStepDef[], private options: ScheduleOptions = {}) {}

  // Kahn's algorithm to compute ready sets progressively; runs with limited concurrency
  async run(context: StepRunContext): Promise<void> {
    const concurrency = Math.max(1, this.options.concurrency ?? 1);
    const idToStep = new Map<string, PlanStepDef>();
    const inDegree = new Map<string, number>();
    const dependents = new Map<string, string[]>();

    for (const s of this.steps) {
      idToStep.set(s.id, s);
      const deps = s.depends_on ?? [];
      inDegree.set(s.id, deps.length);
      for (const d of deps) {
        const arr = dependents.get(d) ?? [];
        arr.push(s.id);
        dependents.set(d, arr);
      }
    }

    const ready: string[] = [];
    for (const [id, deg] of inDegree.entries()) if (deg === 0) ready.push(id);

    let running = 0;
    const errors: any[] = [];

    const tryStartNext = async (): Promise<void> => {
      while (running < concurrency && ready.length > 0) {
        const stepId = ready.shift() as string;
        const step = idToStep.get(stepId)!;
        running += 1;
        context.onStepStart?.(stepId);
        // Fire and handle completion
        (async () => {
          try {
            await context.runStep(step);
            context.onStepComplete?.(stepId);
            // reduce in-degree of dependents
            for (const dep of dependents.get(stepId) ?? []) {
              inDegree.set(dep, (inDegree.get(dep) ?? 1) - 1);
              if ((inDegree.get(dep) ?? 0) === 0) ready.push(dep);
            }
          } catch (err) {
            errors.push(err);
            context.onStepError?.(stepId, err);
            // on error: we do not enqueue dependents; they remain blocked (deg > 0)
          } finally {
            running -= 1;
            // loop to start more if available
            await tryStartNext();
          }
        })();
      }
    };

    await tryStartNext();

    // wait until all work settles
    await new Promise<void>((resolve) => {
      const check = () => {
        const remainingReady = ready.length;
        const remainingInDegree = Array.from(inDegree.values()).some((v) => v > 0);
        if (running === 0 && remainingReady === 0) return resolve();
        setTimeout(check, 20);
      };
      check();
    });

    if (errors.length > 0) {
      // propagate first error; callers may decide on compensation
      throw errors[0];
    }
  }

  // quick validation helpers
  static hasCycle(steps: PlanStepDef[]): boolean {
    const visited = new Set<string>();
    const inStack = new Set<string>();
    const graph = new Map<string, string[]>();
    for (const s of steps) graph.set(s.id, s.depends_on ?? []);
    const dfs = (id: string): boolean => {
      if (inStack.has(id)) return true;
      if (visited.has(id)) return false;
      visited.add(id);
      inStack.add(id);
      for (const d of graph.get(id) ?? []) if (dfs(d)) return true;
      inStack.delete(id);
      return false;
    };
    return steps.some((s) => dfs(s.id));
  }
}


