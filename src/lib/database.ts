import { supabase, type Profile, type Deal, type UserSavedDeal, type UserAction, type TradingFirm } from './supabase'

// Authentication functions
export async function signUp(email: string, password: string, userData?: { full_name?: string; phone?: string }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  })
  return { data, error }
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export async function signInWithProvider(provider: 'google' | 'apple' | 'facebook') {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })
  return { data, error }
}

export async function signInWithPhone(phone: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    phone,
    options: {
      channel: 'sms'
    }
  })
  return { data, error }
}

export async function verifyOtp(phone: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms'
  })
  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

// Profile functions
export async function getProfile(userId: string): Promise<{ data: Profile | null; error: any }> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  return { data, error }
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single()
  
  return { data, error }
}

// Deal functions
export async function getActiveDeals(category?: string): Promise<{ data: Deal[] | null; error: any }> {
  let query = supabase
    .from('deals')
    .select(`
      *,
      firm:trading_firms(*)
    `)
    .eq('is_active', true)
    .lte('start_date', new Date().toISOString())
    .gte('end_date', new Date().toISOString())
    .order('priority_score', { ascending: false })
    .order('created_at', { ascending: false })

  if (category && category !== 'All') {
    query = query.eq('category', category)
  }

  const { data, error } = await query
  return { data, error }
}

export async function getDealById(dealId: string): Promise<{ data: Deal | null; error: any }> {
  const { data, error } = await supabase
    .from('deals')
    .select(`
      *,
      firm:trading_firms(*)
    `)
    .eq('id', dealId)
    .single()
  
  return { data, error }
}

// Trading firm functions
export async function getTradingFirms(): Promise<{ data: TradingFirm[] | null; error: any }> {
  const { data, error } = await supabase
    .from('trading_firms')
    .select('*')
    .eq('is_active', true)
    .order('name')
  
  return { data, error }
}

// User saved deals functions
export async function getUserSavedDeals(userId: string): Promise<{ data: UserSavedDeal[] | null; error: any }> {
  const { data, error } = await supabase
    .from('user_saved_deals')
    .select(`
      *,
      deal:deals(
        *,
        firm:trading_firms(*)
      )
    `)
    .eq('user_id', userId)
    .order('saved_at', { ascending: false })
  
  return { data, error }
}

export async function saveDeal(userId: string, dealId: string, isClaimed = false) {
  const { data, error } = await supabase
    .from('user_saved_deals')
    .upsert({
      user_id: userId,
      deal_id: dealId,
      is_claimed: isClaimed,
      claimed_at: isClaimed ? new Date().toISOString() : null
    })
    .select()
    .single()
  
  // Update user's total deals saved count
  if (!error) {
    await supabase
      .from('profiles')
      .update({
        total_deals_saved: supabase.raw('total_deals_saved + 1'),
        total_deals_claimed: isClaimed ? supabase.raw('total_deals_claimed + 1') : supabase.raw('total_deals_claimed')
      })
      .eq('id', userId)
  }
  
  return { data, error }
}

export async function unsaveDeal(userId: string, dealId: string) {
  const { data, error } = await supabase
    .from('user_saved_deals')
    .delete()
    .eq('user_id', userId)
    .eq('deal_id', dealId)
  
  // Update user's total deals saved count
  if (!error) {
    await supabase
      .from('profiles')
      .update({
        total_deals_saved: supabase.raw('GREATEST(total_deals_saved - 1, 0)')
      })
      .eq('id', userId)
  }
  
  return { data, error }
}

export async function claimDeal(userId: string, dealId: string) {
  const { data, error } = await supabase
    .from('user_saved_deals')
    .update({
      is_claimed: true,
      claimed_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .eq('deal_id', dealId)
    .select()
    .single()
  
  // Update user's total deals claimed count
  if (!error) {
    await supabase
      .from('profiles')
      .update({
        total_deals_claimed: supabase.raw('total_deals_claimed + 1')
      })
      .eq('id', userId)
  }
  
  return { data, error }
}

// User action tracking
export async function trackUserAction(
  dealId: string | null,
  actionType: UserAction['action_type'],
  actionData?: Record<string, any>
) {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { data: null, error: 'User not authenticated' }
  
  const { data, error } = await supabase
    .from('user_actions')
    .insert({
      user_id: user.id,
      deal_id: dealId,
      action_type: actionType,
      action_data: actionData || {},
      session_id: sessionStorage.getItem('reduzed_session_id') || crypto.randomUUID(),
      user_agent: navigator.userAgent
    })
  
  return { data, error }
}

// Analytics functions
export async function getUserStats(userId: string) {
  const { data: profile } = await getProfile(userId)
  
  const { data: recentActions, error: actionsError } = await supabase
    .from('user_actions')
    .select('action_type, created_at')
    .eq('user_id', userId)
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
    .order('created_at', { ascending: false })
  
  const { data: savedDeals, error: savedError } = await supabase
    .from('user_saved_deals')
    .select('saved_at, is_claimed')
    .eq('user_id', userId)
  
  return {
    profile,
    recentActions: recentActions || [],
    savedDeals: savedDeals || [],
    actionsError,
    savedError
  }
}

// Admin functions (require elevated permissions)
export async function createDeal(deal: Omit<Deal, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('deals')
    .insert(deal)
    .select()
    .single()
  
  return { data, error }
}

export async function updateDeal(dealId: string, updates: Partial<Deal>) {
  const { data, error } = await supabase
    .from('deals')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', dealId)
    .select()
    .single()
  
  return { data, error }
}

export async function deleteDeal(dealId: string) {
  const { data, error } = await supabase
    .from('deals')
    .update({ is_active: false })
    .eq('id', dealId)
  
  return { data, error }
}

// Real-time subscriptions
export function subscribeToDeals(callback: (payload: any) => void) {
  return supabase
    .channel('deals_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'deals'
      },
      callback
    )
    .subscribe()
}

export function subscribeToUserSavedDeals(userId: string, callback: (payload: any) => void) {
  return supabase
    .channel(`user_saved_deals:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_saved_deals',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe()
}