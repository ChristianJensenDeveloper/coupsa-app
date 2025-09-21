-- KOOCAO Database Quick Fix Script
-- Run this in your Supabase SQL Editor to create the missing tables

-- Create companies table
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  website VARCHAR(255),
  categories TEXT[] DEFAULT '{}',
  country VARCHAR(100),
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(50),
  user_id UUID,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended', 'connected', 'admin_created')),
  
  -- Approval tracking
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_by UUID,
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create broker_deals table
CREATE TABLE IF NOT EXISTS public.broker_deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  terms TEXT,
  status VARCHAR(50) DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'approved', 'rejected', 'expired')),
  
  -- Approval tracking
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_by UUID,
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broker_deals ENABLE ROW LEVEL SECURITY;

-- Create permissive policies (for development - tighten in production)
DROP POLICY IF EXISTS "Allow all operations on companies" ON public.companies;
CREATE POLICY "Allow all operations on companies" ON public.companies FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all operations on broker deals" ON public.broker_deals;
CREATE POLICY "Allow all operations on broker deals" ON public.broker_deals FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_companies_status ON public.companies(status);
CREATE INDEX IF NOT EXISTS idx_companies_categories ON public.companies USING GIN(categories);
CREATE INDEX IF NOT EXISTS idx_companies_created_at ON public.companies(created_at);

CREATE INDEX IF NOT EXISTS idx_broker_deals_company_id ON public.broker_deals(company_id);
CREATE INDEX IF NOT EXISTS idx_broker_deals_status ON public.broker_deals(status);
CREATE INDEX IF NOT EXISTS idx_broker_deals_category ON public.broker_deals(category);
CREATE INDEX IF NOT EXISTS idx_broker_deals_dates ON public.broker_deals(start_date, end_date);

-- Insert demo data for testing
INSERT INTO public.companies (name, description, website, categories, country, contact_email, status) VALUES
  ('Demo PropFirm Alpha', 'Demo prop trading firm for testing admin functionality. Offers CFD trading challenges with competitive profit targets.', 'https://demo-propfirm-alpha.com', ARRAY['CFD'], 'United States', 'admin@demo-propfirm-alpha.com', 'pending'),
  ('Demo Crypto Exchange', 'Demo crypto exchange for testing admin functionality. Provides spot and futures trading for major cryptocurrencies.', 'https://demo-crypto-exchange.com', ARRAY['Crypto'], 'United Kingdom', 'admin@demo-crypto-exchange.com', 'approved'),
  ('Demo Futures Broker', 'Demo futures broker for testing admin functionality. Specializes in commodities and indices futures trading.', 'https://demo-futures-broker.com', ARRAY['Futures'], 'Germany', 'admin@demo-futures-broker.com', 'rejected')
ON CONFLICT (name) DO NOTHING;

-- Insert demo deals (only if companies exist)
INSERT INTO public.broker_deals (company_id, title, description, category, start_date, end_date, terms, status) 
SELECT 
  c.id,
  deal.title,
  deal.description,
  deal.category,
  deal.start_date,
  deal.end_date,
  deal.terms,
  deal.status
FROM (
  VALUES 
    ('Demo PropFirm Alpha', '50% Off Trading Challenge', 'Get 50% discount on our $100K trading challenge. Perfect for experienced traders looking to get funded quickly.', 'CFD', NOW(), NOW() + INTERVAL '30 days', 'Valid for new customers only. Cannot be combined with other offers.', 'pending_approval'),
    ('Demo Crypto Exchange', 'Free Trading for 30 Days', 'Trade crypto with zero fees for your first 30 days. All major cryptocurrencies included.', 'Crypto', NOW(), NOW() + INTERVAL '60 days', 'Valid for new accounts only. Minimum deposit required.', 'approved'),
    ('Demo PropFirm Alpha', '25% Bonus on Profits', 'Earn an additional 25% bonus on your first month profits. Available for all challenge completers.', 'CFD', NOW(), NOW() + INTERVAL '45 days', 'Must complete challenge within 30 days to qualify.', 'pending_approval')
) AS deal(company_name, title, description, category, start_date, end_date, terms, status)
JOIN public.companies c ON c.name = deal.company_name
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'Database setup completed successfully! You now have:' as status,
       (SELECT COUNT(*) FROM public.companies) as companies_count,
       (SELECT COUNT(*) FROM public.broker_deals) as deals_count;