export interface SAGADefinition {
  name: string;
  description?: string;
  steps: SAGAStep[];
  global_timeout?: number;
  failure_strategy: 'stop' | 'continue' | 'compensate';
}

export interface SAGAStep {
  id: string;
  name?: string;
  tool_name: string;
  parameters: Record<string, any>;
  depends_on?: string[];
  compensation?: {
    tool_name: string;
    parameters: Record<string, any>;
    auto_execute?: boolean;
  };
  retry_policy?: {
    max_attempts: number;
    backoff_strategy: 'linear' | 'exponential';
  };
}

export interface SAGAInstance {
  id: string;
  definition: SAGADefinition;
  state: SAGAState;
  current_step?: string;
  steps: Record<string, StepExecution>;
  created_at: Date;
  updated_at: Date;
}

export type SAGAState = 
  | 'planned'
  | 'running' 
  | 'paused'
  | 'completed'
  | 'failed'
  | 'compensating'
  | 'compensated';

export interface StepExecution {
  status: 'pending' | 'running' | 'completed' | 'failed' | 'compensated';
  started_at?: Date;
  completed_at?: Date;
  result?: any;
  error?: string;
  retry_count: number;
  compensation_executed?: boolean;
}

export interface SAGAEvent {
  event_id: string;
  saga_id: string;
  event_type: string;
  timestamp: Date;
  data: any;
  metadata?: Record<string, any>;
}