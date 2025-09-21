import { supabase } from './supabase';
import { Company, BrokerDeal, CompanyStatus } from '../components/types';

export interface DatabaseCompany {
  id: string;
  name: string;
  description: string;
  website: string;
  categories: string[];
  country: string;
  contact_email: string;
  contact_phone?: string;
  created_at: string;
  updated_at?: string;
  status: CompanyStatus;
  user_id: string;
  approved_by?: string;
  approved_at?: string;
  rejected_by?: string;
  rejected_at?: string;
  rejection_reason?: string;
}

export interface DatabaseBrokerDeal {
  id: string;
  company_id: string;
  title: string;
  description: string;
  category: string;
  start_date: string;
  end_date: string;
  terms: string;
  status: 'pending_approval' | 'approved' | 'rejected' | 'expired';
  created_at: string;
  updated_at: string;
  approved_by?: string;
  approved_at?: string;
  rejected_by?: string;
  rejected_at?: string;
  rejection_reason?: string;
}

// Convert database company to frontend type
function convertDatabaseCompany(dbCompany: DatabaseCompany): Company {
  return {
    id: dbCompany.id,
    name: dbCompany.name,
    description: dbCompany.description,
    website: dbCompany.website,
    categories: dbCompany.categories,
    country: dbCompany.country,
    contactEmail: dbCompany.contact_email,
    contactPhone: dbCompany.contact_phone,
    createdAt: dbCompany.created_at,
    updatedAt: dbCompany.updated_at,
    status: dbCompany.status,
    userId: dbCompany.user_id,
    approvedBy: dbCompany.approved_by,
    approvedAt: dbCompany.approved_at,
    rejectedBy: dbCompany.rejected_by,
    rejectedAt: dbCompany.rejected_at,
    rejectionReason: dbCompany.rejection_reason
  };
}

// Convert database broker deal to frontend type
function convertDatabaseBrokerDeal(dbDeal: DatabaseBrokerDeal): BrokerDeal {
  return {
    id: dbDeal.id,
    companyId: dbDeal.company_id,
    title: dbDeal.title,
    description: dbDeal.description,
    category: dbDeal.category,
    startDate: dbDeal.start_date,
    endDate: dbDeal.end_date,
    terms: dbDeal.terms,
    status: dbDeal.status,
    createdAt: dbDeal.created_at,
    updatedAt: dbDeal.updated_at,
    approvedBy: dbDeal.approved_by,
    approvedAt: dbDeal.approved_at,
    rejectedBy: dbDeal.rejected_by,
    rejectedAt: dbDeal.rejected_at,
    rejectionReason: dbDeal.rejection_reason
  };
}

// Add a debug function to check tables and their data
export async function debugCheckDatabaseTables(): Promise<void> {
  console.log('🔍 Checking database tables...');
  
  try {
    // Test companies table
    console.log('📋 Checking companies table...');
    const companiesResult = await supabase
      .from('companies')
      .select('*', { count: 'exact' })
      .limit(1);
    
    if (companiesResult.error) {
      console.error('❌ Companies table error:', companiesResult.error);
    } else {
      console.log('✅ Companies table exists:', {
        count: companiesResult.count,
        sample: companiesResult.data?.[0] || 'No data'
      });
    }

    // Test broker_deals table
    console.log('📋 Checking broker_deals table...');
    const dealsResult = await supabase
      .from('broker_deals')
      .select('*', { count: 'exact' })
      .limit(1);
    
    if (dealsResult.error) {
      console.error('❌ Broker deals table error:', dealsResult.error);
    } else {
      console.log('✅ Broker deals table exists:', {
        count: dealsResult.count,
        sample: dealsResult.data?.[0] || 'No data'
      });
    }

    // Just log that we've completed the essential checks
    console.log('📊 Essential table checks completed. Both companies and broker_deals tables checked.');

  } catch (error) {
    console.error('💥 Debug check failed:', error);
  }
}

/**
 * Fetch all companies from the database
 */
export async function fetchCompanies(): Promise<{ companies: Company[], error: string | null }> {
  try {
    // Debug: check tables first
    await debugCheckDatabaseTables();
    
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching companies:', error);
      
      // If tables don't exist, return empty array with helpful message
      if (error.code === 'PGRST205') {
        console.warn('Companies table does not exist. Please run the database setup SQL.');
        return { 
          companies: [], 
          error: 'Database tables not set up. Please run the SQL setup script first.' 
        };
      }
      
      return { companies: [], error: error.message };
    }

    const companies = (data || []).map(convertDatabaseCompany);
    console.log('✅ Successfully fetched companies:', companies.length);
    return { companies, error: null };
  } catch (error) {
    console.error('Unexpected error fetching companies:', error);
    return { companies: [], error: 'Failed to fetch companies' };
  }
}

/**
 * Fetch all broker deals from the database
 */
export async function fetchBrokerDeals(): Promise<{ deals: BrokerDeal[], error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('broker_deals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching broker deals:', error);
      
      // If tables don't exist, return empty array with helpful message
      if (error.code === 'PGRST205') {
        console.warn('Broker deals table does not exist. Please run the database setup SQL.');
        return { 
          deals: [], 
          error: 'Database tables not set up. Please run the SQL setup script first.' 
        };
      }
      
      return { deals: [], error: error.message };
    }

    const deals = (data || []).map(convertDatabaseBrokerDeal);
    return { deals, error: null };
  } catch (error) {
    console.error('Unexpected error fetching broker deals:', error);
    return { deals: [], error: 'Failed to fetch broker deals' };
  }
}

/**
 * Approve a company
 */
export async function approveCompany(companyId: string, adminId: string): Promise<{ success: boolean, error?: string }> {
  try {
    const { error } = await supabase
      .from('companies')
      .update({
        status: 'approved',
        approved_by: adminId,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', companyId);

    if (error) {
      console.error('Error approving company:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error approving company:', error);
    return { success: false, error: 'Failed to approve company' };
  }
}

/**
 * Reject a company with reason
 */
export async function rejectCompany(
  companyId: string, 
  adminId: string, 
  reason: string
): Promise<{ success: boolean, error?: string }> {
  try {
    const { error } = await supabase
      .from('companies')
      .update({
        status: 'rejected',
        rejected_by: adminId,
        rejected_at: new Date().toISOString(),
        rejection_reason: reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', companyId);

    if (error) {
      console.error('Error rejecting company:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error rejecting company:', error);
    return { success: false, error: 'Failed to reject company' };
  }
}

/**
 * Suspend a company
 */
export async function suspendCompany(companyId: string, adminId: string): Promise<{ success: boolean, error?: string }> {
  try {
    const { error } = await supabase
      .from('companies')
      .update({
        status: 'suspended',
        updated_at: new Date().toISOString()
      })
      .eq('id', companyId);

    if (error) {
      console.error('Error suspending company:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error suspending company:', error);
    return { success: false, error: 'Failed to suspend company' };
  }
}

/**
 * Update company information
 */
export async function updateCompany(company: Company): Promise<{ success: boolean, error?: string }> {
  try {
    const { error } = await supabase
      .from('companies')
      .update({
        name: company.name,
        description: company.description,
        website: company.website,
        categories: company.categories,
        country: company.country,
        contact_email: company.contactEmail,
        contact_phone: company.contactPhone,
        updated_at: new Date().toISOString()
      })
      .eq('id', company.id);

    if (error) {
      console.error('Error updating company:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error updating company:', error);
    return { success: false, error: 'Failed to update company' };
  }
}

/**
 * Get companies with pagination
 */
export async function fetchCompaniesWithPagination(
  page: number = 0,
  limit: number = 50,
  status?: CompanyStatus
): Promise<{ companies: Company[], total: number, error: string | null }> {
  try {
    let query = supabase
      .from('companies')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, count, error } = await query;

    if (error) {
      console.error('Error fetching companies with pagination:', error);
      return { companies: [], total: 0, error: error.message };
    }

    const companies = (data || []).map(convertDatabaseCompany);
    return { companies, total: count || 0, error: null };
  } catch (error) {
    console.error('Unexpected error fetching companies with pagination:', error);
    return { companies: [], total: 0, error: 'Failed to fetch companies' };
  }
}

/**
 * Search companies by name or description
 */
export async function searchCompanies(query: string): Promise<{ companies: Company[], error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .or(`name.ilike.%${query}%, description.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching companies:', error);
      return { companies: [], error: error.message };
    }

    const companies = (data || []).map(convertDatabaseCompany);
    return { companies, error: null };
  } catch (error) {
    console.error('Unexpected error searching companies:', error);
    return { companies: [], error: 'Failed to search companies' };
  }
}

/**
 * Create a new company
 */
export async function createCompany(
  companyData: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>
): Promise<{ success: boolean, company?: Company, error?: string }> {
  try {
    const { data, error } = await supabase
      .from('companies')
      .insert({
        name: companyData.name,
        description: companyData.description,
        website: companyData.website,
        categories: companyData.categories,
        country: companyData.country,
        contact_email: companyData.contactEmail,
        contact_phone: companyData.contactPhone,
        status: companyData.status,
        user_id: companyData.userId || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating company:', error);
      return { success: false, error: error.message };
    }

    const company = convertDatabaseCompany(data);
    return { success: true, company };
  } catch (error) {
    console.error('Unexpected error creating company:', error);
    return { success: false, error: 'Failed to create company' };
  }
}

/**
 * Check if a company already exists by name or website
 */
export async function checkExistingCompany(
  name: string, 
  website: string
): Promise<{ company: Company | null, error: string | null }> {
  try {
    const normalizedName = name.toLowerCase().trim();
    const normalizedWebsite = website.replace(/^(https?:\/\/)?(www\.)?/, '').toLowerCase().trim();
    
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .or(`name.ilike.%${normalizedName}%,website.ilike.%${normalizedWebsite}%`);

    if (error) {
      console.error('Error checking existing company:', error);
      return { company: null, error: error.message };
    }

    // Find exact matches
    const exactMatch = data?.find(company => {
      const existingName = company.name.toLowerCase().trim();
      const existingWebsite = company.website.replace(/^(https?:\/\/)?(www\.)?/, '').toLowerCase().trim();
      return existingName === normalizedName || existingWebsite === normalizedWebsite;
    });

    if (exactMatch) {
      return { company: convertDatabaseCompany(exactMatch), error: null };
    }

    return { company: null, error: null };
  } catch (error) {
    console.error('Unexpected error checking existing company:', error);
    return { company: null, error: 'Failed to check existing companies' };
  }
}

/**
 * Claim an existing company
 */
export async function claimCompany(
  companyId: string,
  userId: string,
  claimData: {
    position: string;
    verificationMethod: 'email_domain' | 'email_verification' | 'manual_approval';
    additionalInfo?: string;
  }
): Promise<{ success: boolean, error?: string }> {
  try {
    const { error } = await supabase
      .from('companies')
      .update({
        status: 'claim_pending',
        claim_requested_by: userId,
        claim_requested_at: new Date().toISOString(),
        claim_verification_method: claimData.verificationMethod,
        connection_notes: `Position: ${claimData.position}. ${claimData.additionalInfo || ''}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', companyId);

    if (error) {
      console.error('Error claiming company:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error claiming company:', error);
    return { success: false, error: 'Failed to claim company' };
  }
}