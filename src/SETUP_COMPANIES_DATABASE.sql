-- ========================================
-- KOOCAO Companies Management Setup
-- ========================================
-- Run this in your Supabase SQL Editor

-- 1. Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  website VARCHAR(255),
  categories TEXT[] DEFAULT '{}',
  country VARCHAR(100),
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(50),
  user_id UUID REFERENCES auth.users(id),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended', 'connected', 'admin_created')),
  
  -- Approval tracking
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_by UUID REFERENCES auth.users(id),
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create broker_deals table  
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
  
  -- Approval tracking
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_by UUID REFERENCES auth.users(id),
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_companies_status ON companies(status);
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON companies(user_id);
CREATE INDEX IF NOT EXISTS idx_broker_deals_company_id ON broker_deals(company_id);
CREATE INDEX IF NOT EXISTS idx_broker_deals_status ON broker_deals(status);

-- 4. Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE broker_deals ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies
-- Allow reading all companies (for admin and public use)
CREATE POLICY "Allow read access to companies" ON companies
  FOR SELECT USING (true);

-- Allow users to create companies
CREATE POLICY "Allow users to create companies" ON companies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own pending companies
CREATE POLICY "Allow users to update own pending companies" ON companies
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

-- Allow reading approved broker deals
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

-- 6. Insert some demo data (optional - you can remove this section)
INSERT INTO companies (name, description, website, categories, country, contact_email, status) VALUES
  (
    'Demo PropFirm', 
    'Demo prop trading firm for testing admin functionality.',
    'https://demo-propfirm.com',
    ARRAY['CFD'],
    'United States',
    'admin@demo-propfirm.com',
    'pending'
  ),
  (
    'Demo Broker', 
    'Demo broker for testing admin functionality.',
    'https://demo-broker.com',
    ARRAY['Futures'],
    'United Kingdom',
    'admin@demo-broker.com',
    'approved'
  )
ON CONFLICT (name) DO NOTHING;

-- 7. Add a demo deal
INSERT INTO broker_deals (company_id, title, description, category, start_date, end_date, terms, status) VALUES
  (
    (SELECT id FROM companies WHERE name = 'Demo PropFirm' LIMIT 1),
    'Demo Challenge Discount',
    'Get 50% off our trading challenge.',
    'CFD',
    NOW(),
    NOW() + INTERVAL '30 days',
    'Valid for new customers only.',
    'pending_approval'
  )
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'Companies database setup completed successfully!' as message;