-- Companies Management Database Setup for KOOCAO
-- Run this SQL in your Supabase SQL editor to create the companies and broker_deals tables

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  website VARCHAR(255),
  categories TEXT[] DEFAULT '{}', -- Array of category strings
  country VARCHAR(100),
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(50),
  user_id UUID REFERENCES auth.users(id), -- Links to the user who registered the company
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended', 'connected', 'admin_created')),
  
  -- Approval/rejection tracking
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_by UUID REFERENCES auth.users(id),
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(name), -- Company names should be unique
  CONSTRAINT valid_email CHECK (contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create broker_deals table (for deals submitted by companies)
CREATE TABLE IF NOT EXISTS broker_deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  terms TEXT,
  status VARCHAR(50) DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'approved', 'rejected', 'expired')),
  
  -- Approval/rejection tracking
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_by UUID REFERENCES auth.users(id),
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_dates CHECK (end_date > start_date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_companies_status ON companies(status);
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON companies(user_id);
CREATE INDEX IF NOT EXISTS idx_companies_created_at ON companies(created_at);
CREATE INDEX IF NOT EXISTS idx_broker_deals_company_id ON broker_deals(company_id);
CREATE INDEX IF NOT EXISTS idx_broker_deals_status ON broker_deals(status);
CREATE INDEX IF NOT EXISTS idx_broker_deals_category ON broker_deals(category);

-- Create updated_at trigger function (if it doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_broker_deals_updated_at
    BEFORE UPDATE ON broker_deals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies

-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE broker_deals ENABLE ROW LEVEL SECURITY;

-- Companies policies
-- Allow users to read all companies (for public directory)
CREATE POLICY "Allow read access to all companies" ON companies
  FOR SELECT USING (true);

-- Allow users to insert companies (for self-registration)
CREATE POLICY "Allow users to register companies" ON companies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own companies (before approval)
CREATE POLICY "Allow users to update own companies" ON companies
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

-- Allow admins to manage companies (you'll need to set admin role)
-- Note: Replace 'admin' with your actual admin role
CREATE POLICY "Allow admins to manage companies" ON companies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Broker deals policies
-- Allow reading approved deals
CREATE POLICY "Allow read access to approved deals" ON broker_deals
  FOR SELECT USING (status = 'approved');

-- Allow companies to manage their own deals
CREATE POLICY "Allow companies to manage own deals" ON broker_deals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM companies 
      WHERE companies.id = broker_deals.company_id 
      AND companies.user_id = auth.uid()
    )
  );

-- Allow admins to manage all deals
CREATE POLICY "Allow admins to manage all deals" ON broker_deals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Insert some sample data (optional)
-- You can remove this section if you don't want sample data

-- Sample companies
INSERT INTO companies (name, description, website, categories, country, contact_email, status, user_id) VALUES
  (
    'FundedNext Demo', 
    'Leading prop trading firm offering funded accounts up to $300K.',
    'https://fundednext.com',
    ARRAY['CFD'],
    'United Arab Emirates',
    'partnerships@fundednext.com',
    'pending',
    '00000000-0000-0000-0000-000000000001' -- Replace with actual user ID
  ),
  (
    'TradeForge Pro Demo', 
    'Innovative crypto trading platform with advanced tools and 24/7 support.',
    'https://tradeforge.pro',
    ARRAY['Crypto'],
    'Estonia',
    'hello@tradeforge.pro',
    'approved',
    '00000000-0000-0000-0000-000000000002' -- Replace with actual user ID
  )
ON CONFLICT (name) DO NOTHING; -- Avoid duplicates

-- Sample broker deals
INSERT INTO broker_deals (company_id, title, description, category, start_date, end_date, terms, status) VALUES
  (
    (SELECT id FROM companies WHERE name = 'FundedNext Demo' LIMIT 1),
    '50% Off Trading Challenge',
    'Get 50% discount on our $100K trading challenge.',
    'CFD',
    '2025-01-01T00:00:00Z',
    '2025-03-31T23:59:59Z',
    'Valid for new customers only. One-time use per account.',
    'pending_approval'
  )
ON CONFLICT DO NOTHING;

-- Grant necessary permissions (if needed)
-- GRANT ALL ON companies TO authenticated;
-- GRANT ALL ON broker_deals TO authenticated;

COMMENT ON TABLE companies IS 'Table storing company information for KOOCAO admin management';
COMMENT ON TABLE broker_deals IS 'Table storing deals submitted by companies for admin approval';