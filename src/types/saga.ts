export interface SAGADefinition {
  name: string;
  description?: string;
  steps: SAGAStep[];
}

export interface SAGAStep {
  id: string;
  name?: string;
  tool_name: string;
  parameters: Record<string, any>;
  cancellable?: 'reversible' | 'partially-reversible' | 'irreversible';
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
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface StepExecution {
  status: 'pending' | 'running' | 'completed' | 'failed';
  started_at?: Date;
  completed_at?: Date;
  result?: any;
  error?: string;
}

export interface SAGAEvent {
  event_id: string;
  saga_id: string;
  event_type: string;
  timestamp: Date;
  data: any;
  metadata?: Record<string, any>;
}