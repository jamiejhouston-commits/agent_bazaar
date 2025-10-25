export interface Agent {
  id: string;
  name: string;
  description: string | null;
  category: 'creative' | 'blockchain' | 'storage' | 'data' | 'marketing';
  capabilities: string[];
  pricing: {
    per_task: number;
    currency: string;
    volume_discounts?: Array<{ min: number; price: number }>;
    notes?: string;
  };
  owner_id: string | null;
  rating: number;
  total_executions: number;
  status: 'online' | 'offline' | 'maintenance';
  sla: {
    response_time_ms?: number;
    uptime_pct?: number;
  };
  api_endpoint: string | null;
  api_key: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  from_user_id: string | null;
  to_agent_id: string | null;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  ap2_receipt: any | null;
  input_data: any | null;
  output_data: any | null;
  error_message: string | null;
  created_at: string;
}

export interface Workflow {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  agent_chain: Array<{
    agent_id: string;
    step: number;
    config?: any;
  }>;
  status: 'draft' | 'active' | 'paused';
  execution_count: number;
  created_at: string;
  updated_at: string;
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  status: 'running' | 'completed' | 'failed';
  results: any | null;
  total_cost: number | null;
  created_at: string;
}

export interface Review {
  id: string;
  agent_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  helpful_count: number;
  created_at: string;
}

export interface AgentWithDetails extends Agent {
  reviews?: Review[];
  average_rating?: number;
  review_count?: number;
}
