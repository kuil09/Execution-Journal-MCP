export interface ExecutionStep {
  id: string;
  name: string;
  tool: string;
  parameters: Record<string, any>;
  cancellable?: "reversible" | "partially-reversible" | "irreversible";
}

export interface ExecutionPlan {
  name: string;
  description: string;
  steps: ExecutionStep[];
}

export interface ExecutionInstance {
  id: string;
  plan_id: string;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  current_step?: string;
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
  error?: string;
}

export interface ExecutionStepRow {
  execution_id: string;
  step_id: string;
  name?: string;
  tool_name: string;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  started_at?: string;
  completed_at?: string;
  result_json?: string;
  error?: string;
  cancellable?: string;
}

export interface ExecutionInstanceRow {
  id: string;
  plan_id: string;
  status: string;
  current_step?: string;
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
  error?: string;
}

export interface ExecutionEvent {
  event_id: string;
  execution_id: string;
  event_type: string;
  timestamp: string;
  data_json?: string;
}