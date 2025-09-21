import { createClient } from '@supabase/supabase-js'

// Your REDUZED app Supabase configuration
const supabaseUrl = typeof window !== 'undefined' ? 
  (window as any).NEXT_PUBLIC_SUPABASE_URL || 'https://unghlvhuvbuxygsolzrk.supabase.co' :
  'https://unghlvhuvbuxygsolzrk.supabase.co'

const supabaseAnonKey = typeof window !== 'undefined' ?
  (window as any).NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuZ2hsdmh1dmJ1eHlnc29senJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMjk3MDIsImV4cCI6MjA3MzYwNTcwMn0.RJN3W39haJUgF02hs4KpdfGAqNewCwC-TWnMkYyUdpU' :
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuZ2hsdmh1dmJ1eHlnc29senJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMjk3MDIsImV4cCI6MjA3MzYwNTcwMn0.RJN3W39haJUgF02hs4KpdfGAqNewCwC-TWnMkYyUdpU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
})

// Database types
export interface Profile {
  id: string
  email?: string
  full_name?: string
  avatar_url?: string
  phone?: string
  ip_address?: string
  country?: string
  country_code?: string
  preferred_categories?: string[]
  max_deal_value?: number
  experience_level?: 'beginner' | 'intermediate' | 'advanced'
  notifications_enabled?: boolean
  email_marketing_consent?: boolean
  privacy_consent?: boolean
  terms_accepted?: boolean
  terms_accepted_at?: string
  total_deals_saved?: number
  total_deals_claimed?: number
  last_active_at?: string
  created_at?: string
  updated_at?: string
}

export interface TradingFirm {
  id: string
  name: string
  slug: string
  description?: string
  logo_url?: string
  website_url?: string
  category: 'CFD Prop' | 'Futures Prop' | 'Broker Bonuses' | 'Casinos'
  verification_status: 'pending' | 'verified' | 'rejected'
  affiliate_base_url?: string
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface Deal {
  id: string
  firm_id?: string
  title: string
  description: string
  discount_text: string
  discount_value?: number
  discount_type?: 'percentage' | 'fixed_amount' | 'bonus' | 'free'
  category: 'CFD Prop' | 'Futures Prop' | 'Broker Bonuses' | 'Casinos'
  original_price?: number
  discounted_price?: number
  promo_code?: string
  terms_conditions?: string
  start_date: string
  end_date: string
  image_url?: string
  background_image_url?: string
  background_position?: string
  background_blur?: number
  affiliate_url: string
  tracking_params?: Record<string, any>
  button_config?: 'claim-and-code' | 'claim-only' | 'code-only'
  is_active?: boolean
  is_featured?: boolean
  priority_score?: number
  admin_notes?: string
  created_at?: string
  updated_at?: string
  // Joined data
  firm?: TradingFirm
}

export interface UserSavedDeal {
  id: string
  user_id: string
  deal_id: string
  saved_at: string
  is_claimed?: boolean
  claimed_at?: string
  notes?: string
  // Joined data
  deal?: Deal
}

export interface UserAction {
  id: string
  user_id?: string
  deal_id?: string
  action_type: 'view' | 'swipe_right' | 'swipe_left' | 'save' | 'claim' | 'share'
  action_data?: Record<string, any>
  session_id?: string
  user_agent?: string
  ip_address?: string
  created_at?: string
}