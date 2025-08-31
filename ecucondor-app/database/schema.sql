-- Ecucondor Database Schema
-- Run this in your Supabase SQL editor to create the required tables

-- Enable RLS on all tables
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- User transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pair VARCHAR(10) NOT NULL,
  transaction_type VARCHAR(4) NOT NULL CHECK (transaction_type IN ('buy', 'sell')),
  base_currency VARCHAR(3) NOT NULL,
  target_currency VARCHAR(3) NOT NULL,
  base_amount DECIMAL(18,8) NOT NULL,
  target_amount DECIMAL(18,8) NOT NULL,
  rate_used DECIMAL(18,8) NOT NULL,
  commission DECIMAL(18,8) DEFAULT 0,
  commission_rate DECIMAL(5,4) DEFAULT 0,
  amount_usd DECIMAL(18,2) NOT NULL, -- For limits tracking
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  price_lock_id VARCHAR(100), -- Reference to price lock if used
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Price locks table
CREATE TABLE IF NOT EXISTS price_locks (
  id VARCHAR(100) PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pair VARCHAR(10) NOT NULL,
  rate DECIMAL(18,8) NOT NULL,
  amount_usd DECIMAL(18,2) NOT NULL,
  transaction_type VARCHAR(4) NOT NULL CHECK (transaction_type IN ('buy', 'sell')),
  locked_at TIMESTAMP WITH TIME ZONE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User limits tracking (optional - for custom per-user limits)
CREATE TABLE IF NOT EXISTS user_limits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  min_transaction_usd DECIMAL(18,2) DEFAULT 5,
  max_transaction_usd DECIMAL(18,2) DEFAULT 2000,
  max_monthly_usd DECIMAL(18,2) DEFAULT 10000,
  max_daily_transactions INTEGER DEFAULT 20,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for transactions
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for price_locks
CREATE POLICY "Users can view own price locks" ON price_locks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own price locks" ON price_locks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own price locks" ON price_locks
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for user_limits
CREATE POLICY "Users can view own limits" ON user_limits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own limits" ON user_limits
  FOR UPDATE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_monthly ON transactions(user_id, created_at) WHERE status = 'completed';

CREATE INDEX IF NOT EXISTS idx_price_locks_user_id ON price_locks(user_id);
CREATE INDEX IF NOT EXISTS idx_price_locks_expires_at ON price_locks(expires_at);
CREATE INDEX IF NOT EXISTS idx_price_locks_used ON price_locks(used);

-- Functions for automatic updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_limits_updated_at BEFORE UPDATE ON user_limits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data (optional)
-- INSERT INTO user_limits (user_id) VALUES (auth.uid()) ON CONFLICT DO NOTHING;