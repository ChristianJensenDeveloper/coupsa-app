# REDUZED Supabase Setup Guide

## 1. Database Schema Setup

### Users Table (extends Supabase auth.users)
```sql
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Location & tracking data
  ip_address INET,
  country TEXT,
  country_code TEXT, -- ISO 2-letter code (US, GB, etc.)
  -- Trading preferences
  preferred_categories TEXT[] DEFAULT ARRAY['All'],
  max_deal_value DECIMAL,
  experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
  -- App preferences
  notifications_enabled BOOLEAN DEFAULT true,
  email_marketing_consent BOOLEAN DEFAULT false,
  privacy_consent BOOLEAN DEFAULT true,
  terms_accepted BOOLEAN DEFAULT true,
  terms_accepted_at TIMESTAMPTZ,
  -- Tracking
  total_deals_saved INTEGER DEFAULT 0,
  total_deals_claimed INTEGER DEFAULT 0,
  last_active_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
```

### Trading Firms Table (includes Propfirms, Brokers & Casinos)
```sql
CREATE TABLE public.trading_firms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  category TEXT NOT NULL CHECK (category IN ('CFD Prop', 'Futures Prop', 'Broker Bonuses', 'Casinos')),
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  affiliate_base_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- RLS for trading firms (public read)
ALTER TABLE public.trading_firms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Trading firms are viewable by everyone" ON public.trading_firms FOR SELECT USING (is_active = true);
```

### Deals Table
```sql
CREATE TABLE public.deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id UUID REFERENCES public.trading_firms(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  discount_text TEXT NOT NULL, -- "90% OFF", "$500 BONUS", etc.
  discount_value DECIMAL, -- Numeric value for sorting
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed_amount', 'bonus', 'free')),
  
  -- Deal details
  category TEXT NOT NULL CHECK (category IN ('CFD Prop', 'Futures Prop', 'Broker Bonuses', 'Casinos')),
  original_price DECIMAL,
  discounted_price DECIMAL,
  promo_code TEXT,
  terms_conditions TEXT,
  
  -- Dates
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Images
  image_url TEXT,
  background_image_url TEXT,
  background_position TEXT DEFAULT 'center',
  background_blur INTEGER DEFAULT 0,
  
  -- Affiliate tracking
  affiliate_url TEXT NOT NULL,
  tracking_params JSONB DEFAULT '{}',
  
  -- Deal configuration
  button_config TEXT DEFAULT 'claim-and-code' CHECK (button_config IN ('claim-and-code', 'claim-only', 'code-only')),
  
  -- Admin fields
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  priority_score INTEGER DEFAULT 0,
  admin_notes TEXT
);

-- Indexes for performance
CREATE INDEX idx_deals_category ON public.deals(category);
CREATE INDEX idx_deals_active_dates ON public.deals(is_active, start_date, end_date);
CREATE INDEX idx_deals_featured ON public.deals(is_featured) WHERE is_featured = true;

-- RLS for deals
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active deals are viewable by everyone" ON public.deals 
FOR SELECT USING (is_active = true AND start_date <= NOW() AND end_date > NOW());
```

### User Saved Deals Table
```sql
CREATE TABLE public.user_saved_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  is_claimed BOOLEAN DEFAULT false,
  claimed_at TIMESTAMPTZ,
  notes TEXT,
  
  UNIQUE(user_id, deal_id)
);

-- RLS for saved deals
ALTER TABLE public.user_saved_deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own saved deals" ON public.user_saved_deals 
USING (auth.uid() = user_id);
```

### User Actions Tracking
```sql
CREATE TABLE public.user_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('view', 'swipe_right', 'swipe_left', 'save', 'claim', 'share')),
  action_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Session tracking
  session_id TEXT,
  user_agent TEXT,
  ip_address INET
);

-- Index for analytics
CREATE INDEX idx_user_actions_user_date ON public.user_actions(user_id, created_at);
CREATE INDEX idx_user_actions_deal_date ON public.user_actions(deal_id, created_at);
```

### Chat Support Table
```sql
CREATE TABLE public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'escalated')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'support', 'system')),
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for chat
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations" ON public.chat_conversations 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own messages" ON public.chat_messages 
FOR SELECT USING (
  conversation_id IN (
    SELECT id FROM public.chat_conversations WHERE user_id = auth.uid()
  )
);
```

## 2. Database Functions

### Update Profile Function
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, ip_address, country)
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data->>'full_name',
    -- Extract IP from metadata if provided
    CASE 
      WHEN NEW.raw_user_meta_data->>'ip_address' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'ip_address')::inet
      ELSE NULL
    END,
    -- Extract country from metadata if provided
    NEW.raw_user_meta_data->>'country'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### User Location Update Function
```sql
-- Function to update user location data
CREATE OR REPLACE FUNCTION public.update_user_location(
  p_user_id UUID,
  p_ip_address INET,
  p_country TEXT,
  p_country_code TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles 
  SET 
    ip_address = p_ip_address,
    country = p_country,
    country_code = p_country_code,
    updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Deal Analytics Function
```sql
CREATE OR REPLACE FUNCTION public.track_deal_action(
  p_deal_id UUID,
  p_action_type TEXT,
  p_action_data JSONB DEFAULT '{}'
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.user_actions (
    user_id, 
    deal_id, 
    action_type, 
    action_data
  ) VALUES (
    auth.uid(),
    p_deal_id,
    p_action_type,
    p_action_data
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 3. Supabase Configuration

### Environment Variables
Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Authentication Settings
1. Go to Authentication > Settings in Supabase Dashboard
2. Enable providers: Email, Google, Apple, Facebook, Phone
3. Set up redirect URLs for your domain
4. Configure email templates

## 4. Data Migration Script
```sql
-- Insert sample trading firms including casinos
INSERT INTO public.trading_firms (name, slug, category, logo_url, website_url, verification_status) VALUES
('FTMO', 'ftmo', 'CFD Prop', 'https://example.com/ftmo-logo.png', 'https://ftmo.com', 'verified'),
('TopStep', 'topstep', 'Futures Prop', 'https://example.com/topstep-logo.png', 'https://topstep.com', 'verified'),
('IC Markets', 'ic-markets', 'Broker Bonuses', 'https://example.com/ic-logo.png', 'https://icmarkets.com', 'verified'),
('LeoVegas', 'leovegas', 'Casinos', 'https://example.com/leovegas-logo.png', 'https://leovegas.com', 'verified'),
('Betway Casino', 'betway-casino', 'Casinos', 'https://example.com/betway-logo.png', 'https://betway.com', 'verified');

-- Insert sample deals (convert your existing mockCoupons)
INSERT INTO public.deals (title, description, discount_text, category, start_date, end_date, affiliate_url, is_active) VALUES
('90% OFF Challenge Fee', 'Get 90% discount on your first prop trading challenge', '90% OFF', 'CFD Prop', NOW(), NOW() + INTERVAL '30 days', 'https://example.com/deal1', true),
('Free Casino Spins', 'Get 100 free spins on selected slot games', '100 FREE SPINS', 'Casinos', NOW(), NOW() + INTERVAL '7 days', 'https://example.com/casino-deal1', true);
```

## 5. Testing Checklist

### Authentication Flow
- [ ] User registration (email, social, phone)
- [ ] Profile creation on signup
- [ ] Login/logout functionality
- [ ] Password reset

### Deal Management
- [ ] Load deals from database
- [ ] Filter by category
- [ ] Save/unsave deals
- [ ] Track user actions

### Data Integrity
- [ ] RLS policies working correctly
- [ ] Foreign key constraints
- [ ] Data validation rules
- [ ] Proper indexing for performance

### Admin Functions
- [ ] Deal creation/editing
- [ ] User management
- [ ] Analytics queries
- [ ] Bulk operations

## 6. Go-Live Checklist

### Security
- [ ] RLS enabled on all tables
- [ ] API keys properly configured
- [ ] CORS settings for your domain
- [ ] Rate limiting configured

### Performance
- [ ] Database indexes optimized
- [ ] Connection pooling configured
- [ ] CDN setup for images
- [ ] Caching strategy

### Monitoring
- [ ] Database monitoring enabled
- [ ] Error tracking setup
- [ ] Performance monitoring
- [ ] Backup strategy configured

### Compliance
- [ ] GDPR compliance measures
- [ ] User data export functionality
- [ ] Data retention policies
- [ ] Privacy policy implementation