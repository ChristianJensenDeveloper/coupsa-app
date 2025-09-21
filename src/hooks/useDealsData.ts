import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Coupon } from '../components/types';

interface UseDealsDataReturn {
  coupons: Coupon[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Fallback mock data for development/testing
const mockCoupons: Coupon[] = [
  {
    id: 'ftmo-challenge-1',
    title: '30% Off Challenge Fee',
    description: 'Get 30% discount on any FTMO Challenge. Perfect opportunity to prove your trading skills and get funded.',
    discount: '30% OFF',
    category: 'CFD',
    merchant: 'FTMO',
    validUntil: 'Dec 31, 2025',
    startDate: '2025-01-01T00:00:00Z',
    endDate: '2025-12-31T23:59:59Z',
    terms: 'Valid for new FTMO accounts only. Cannot be combined with other offers.',
    code: 'FTMO30',
    isClaimed: false,
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFkaW5nJTIwY2hhcnR8ZW58MXx8fHwxNzU2NTQ2Nzg0fDA&ixlib=rb-4.0&q=80&w=1080',
    logoUrl: 'https://images.unsplash.com/photo-1642310290564-30033ff60334?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wYW55JTIwbG9nbyUyMHByb2Zlc3Npb25hbCUyMGZpbmFuY2V8ZW58MXx8fHwxNzU2NTQ2Nzg0fDA&ixlib=rb-4.0&q=80&w=1080',
    affiliateLink: 'https://ftmo.com/signup?ref=koocao',
    hasVerificationBadge: true,
    status: 'Published',
    buttonConfig: 'both'
  },
  {
    id: 'prop-firm-alpha-1',
    title: 'Free Challenge + 90% Profit Split',
    description: 'Start your funded trading journey with a completely free evaluation and industry-leading profit split.',
    discount: 'FREE',
    category: 'CFD',
    merchant: 'PropFirm Alpha',
    validUntil: 'Mar 15, 2025',
    startDate: '2025-01-01T00:00:00Z',
    endDate: '2025-03-15T23:59:59Z',
    terms: 'Limited time offer. Must pass evaluation within 30 days.',
    code: 'FREEALPHA',
    isClaimed: false,
    imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb3JleCUyMHRyYWRpbmd8ZW58MXx8fHwxNzU2NTQ2Nzg0fDA&ixlib=rb-4.0&q=80&w=1080',
    logoUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGxvZ28lMjBmaW5hbmNlfGVufDF8fHx8MTc1NjU0Njc4NHww&ixlib=rb-4.0&q=80&w=1080',
    affiliateLink: 'https://propfirmalpha.com/join?ref=koocao',
    hasVerificationBadge: true,
    status: 'Published',
    buttonConfig: 'both'
  },
  {
    id: 'futures-trader-1',
    title: '50% Off Futures Evaluation',
    description: 'Master futures trading with our comprehensive evaluation program. Get funded and keep up to 80% of profits.',
    discount: '50% OFF',
    category: 'Futures',
    merchant: 'FuturesTrader Pro',
    validUntil: 'Feb 28, 2025',
    startDate: '2025-01-01T00:00:00Z',
    endDate: '2025-02-28T23:59:59Z',
    terms: 'Valid for first-time futures evaluations only.',
    code: 'FUTURES50',
    isClaimed: false,
    imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmdXR1cmVzJTIwdHJhZGluZ3xlbnwxfHx8fDE3NTY1NDY3ODR8MA&ixlib=rb-4.0&q=80&w=1080',
    logoUrl: 'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaW5hbmNlJTIwbG9nb3xlbnwxfHx8fDE3NTY1NDY3ODR8MA&ixlib=rb-4.0&q=80&w=1080',
    affiliateLink: 'https://futurestraderpro.com/eval?ref=koocao',
    hasVerificationBadge: true,
    status: 'Published',
    buttonConfig: 'both'
  }
];

export function useDealsData(): UseDealsDataReturn {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try different approaches to fetch deals
      let dealsData = null;
      let dealsError = null;

      // First, try the simplest approach - just fetch from deals table
      console.log('📊 Attempting to fetch deals from database...');
      
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50); // Limit to prevent large queries

      dealsData = data;
      dealsError = error;

      if (dealsError) {
        console.warn('Direct deals query failed:', dealsError.message);
        
        // If 'deals' table doesn't exist, the database might be using different table names
        // Try alternative table names that might exist
        const alternativeQueries = [
          { table: 'coupons', desc: 'coupons table' },
          { table: 'offers', desc: 'offers table' },
          { table: 'discounts', desc: 'discounts table' }
        ];

        for (const alt of alternativeQueries) {
          try {
            console.log(`🔄 Trying ${alt.desc}...`);
            const { data: altData, error: altError } = await supabase
              .from(alt.table)
              .select('*')
              .limit(10);
            
            if (!altError && altData && altData.length > 0) {
              console.log(`✅ Found data in ${alt.table} table`);
              dealsData = altData;
              dealsError = null;
              break;
            }
          } catch (e) {
            console.log(`❌ ${alt.table} table not accessible`);
          }
        }
      }

      if (dealsError || !dealsData) {
        throw new Error(`Database query failed: ${dealsError?.message || 'No data found'}`);
      }

      if (dealsData.length === 0) {
        console.warn('📋 No deals found in database, using fallback mock data');
        setCoupons(mockCoupons);
        return;
      }

      // Transform database data to match Coupon interface
      // Handle different possible field names
      const transformedDeals: Coupon[] = dealsData.map((deal, index) => ({
        id: deal.id || deal.uuid || `deal-${index}`,
        title: deal.title || deal.name || deal.deal_title || 'Untitled Deal',
        description: deal.description || deal.details || deal.deal_description || 'No description available',
        discount: deal.discount_text || deal.discount_amount || deal.discount || deal.value || 'DEAL',
        category: deal.category || deal.deal_category || 'CFD',
        merchant: deal.merchant_name || deal.company_name || deal.merchant || deal.brand || 'Unknown',
        validUntil: deal.end_date ? new Date(deal.end_date).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        }) : deal.expires_at ? new Date(deal.expires_at).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        }) : 'No expiry',
        startDate: deal.start_date || deal.created_at || new Date().toISOString(),
        endDate: deal.end_date || deal.expires_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        terms: deal.terms || deal.conditions || deal.terms_conditions || 'Terms and conditions apply.',
        code: deal.coupon_code || deal.code || deal.promo_code || '',
        isClaimed: false, // This will be managed in the app state
        imageUrl: deal.image_url || deal.banner_url || deal.image || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFkaW5nJTIwY2hhcnR8ZW58MXx8fHwxNzU2NTQ2Nzg0fDA&ixlib=rb-4.0&q=80&w=1080',
        logoUrl: deal.logo_url || deal.company_logo || deal.merchant_logo || 'https://images.unsplash.com/photo-1642310290564-30033ff60334?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wYW55JTIwbG9nbyUyMHByb2Zlc3Npb25hbCUyMGZpbmFuY2V8ZW58MXx8fHwxNzU2NTQ2Nzg0fDA&ixlib=rb-4.0&q=80&w=1080',
        affiliateLink: deal.affiliate_link || deal.link || deal.url || '#',
        hasVerificationBadge: deal.verification_badge || deal.verified || deal.is_verified || false,
        status: deal.status || 'Published',
        buttonConfig: deal.button_config || 'both'
      }));

      // Filter only published and active deals
      const activeDeals = transformedDeals.filter(deal => {
        const isPublished = deal.status === 'Published' || deal.status === 'published' || deal.status === 'active';
        const isActive = new Date(deal.endDate) > new Date();
        return isPublished && isActive;
      });

      setCoupons(activeDeals);
      console.log(`✅ Loaded ${activeDeals.length} active deals from database (${transformedDeals.length} total)`);

    } catch (err) {
      console.error('❌ Error fetching deals:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch deals';
      setError(errorMessage);
      
      // Fallback to mock data on error
      console.warn('🔄 Using fallback mock data due to database error');
      setCoupons(mockCoupons);
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchDeals();
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  return {
    coupons,
    loading,
    error,
    refetch
  };
}