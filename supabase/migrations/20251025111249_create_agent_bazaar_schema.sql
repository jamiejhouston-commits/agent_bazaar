/*
  # Agent Bazaar Database Schema

  ## Overview
  Creates the complete database schema for Agent Bazaar - an AI agent marketplace where autonomous agents discover and transact.

  ## New Tables
  
  ### 1. agents
  - Core table storing AI agent listings
  - Columns: id, name, description, category, capabilities, pricing, owner_id, rating, total_executions, status, sla, api_endpoint, api_key, avatar_url, timestamps
  - Categories: creative, blockchain, storage, data, marketing
  - Status: online, offline, maintenance
  
  ### 2. transactions
  - Records all payments and agent executions
  - Columns: id, from_user_id, to_agent_id, amount, currency, status, ap2_receipt, input_data, output_data, error_message, created_at
  - Status: pending, completed, failed, refunded
  - Currency: USDC (stablecoins)
  
  ### 3. workflows
  - User-created automation chains
  - Columns: id, user_id, name, description, agent_chain, status, execution_count, timestamps
  - Status: draft, active, paused
  
  ### 4. workflow_executions
  - Execution history for workflows
  - Columns: id, workflow_id, status, results, total_cost, created_at
  - Status: running, completed, failed
  
  ### 5. reviews
  - User reviews for agents
  - Columns: id, agent_id, user_id, rating, comment, helpful_count, created_at
  - Rating: 1-5 stars

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Agents: Public read, owner write
  - Transactions: Users can only view their own
  - Workflows: Users can only manage their own
  - Reviews: Public read, authenticated write

  ## Performance
  - Indexes created on frequently queried columns
  - Foreign key constraints for data integrity
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Agents table
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('creative', 'blockchain', 'storage', 'data', 'marketing')),
  capabilities JSONB DEFAULT '[]'::jsonb,
  pricing JSONB NOT NULL DEFAULT '{}'::jsonb,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_executions INTEGER DEFAULT 0,
  status TEXT DEFAULT 'online' CHECK (status IN ('online', 'offline', 'maintenance')),
  sla JSONB DEFAULT '{}'::jsonb,
  api_endpoint TEXT,
  api_key TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  to_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  amount DECIMAL(10,4) NOT NULL,
  currency TEXT DEFAULT 'USDC',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  ap2_receipt JSONB,
  input_data JSONB,
  output_data JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflows table
CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  agent_chain JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused')),
  execution_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflow executions table
CREATE TABLE IF NOT EXISTS workflow_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  results JSONB,
  total_cost DECIMAL(10,4),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_agents_category ON agents(category);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_owner ON agents(owner_id);
CREATE INDEX IF NOT EXISTS idx_agents_rating ON agents(rating DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(from_user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_agent ON transactions(to_agent_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_workflows_user ON workflows(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_agent ON reviews(agent_id);

-- Enable Row Level Security
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agents
CREATE POLICY "Agents are viewable by everyone" 
  ON agents FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create agents" 
  ON agents FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own agents" 
  ON agents FOR UPDATE 
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete own agents" 
  ON agents FOR DELETE 
  TO authenticated
  USING (auth.uid() = owner_id);

-- RLS Policies for transactions
CREATE POLICY "Users can view own transactions" 
  ON transactions FOR SELECT 
  TO authenticated
  USING (auth.uid() = from_user_id);

CREATE POLICY "Users can create transactions" 
  ON transactions FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = from_user_id);

-- RLS Policies for workflows
CREATE POLICY "Users can view own workflows" 
  ON workflows FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create workflows" 
  ON workflows FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workflows" 
  ON workflows FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own workflows" 
  ON workflows FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for workflow_executions
CREATE POLICY "Users can view own workflow executions" 
  ON workflow_executions FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workflows 
      WHERE workflows.id = workflow_executions.workflow_id 
      AND workflows.user_id = auth.uid()
    )
  );

-- RLS Policies for reviews
CREATE POLICY "Reviews are viewable by everyone" 
  ON reviews FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create reviews" 
  ON reviews FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);