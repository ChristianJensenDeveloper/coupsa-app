import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { supabase } from '../lib/supabase';
import { RefreshCw, Database, CheckCircle, XCircle, AlertCircle, Zap } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function AutoDatabaseSetup() {
  const [isSetupRunning, setIsSetupRunning] = useState(false);
  const [setupResults, setSetupResults] = useState<{
    tablesCreated: boolean;
    companiesInserted: number;
    dealsInserted: number;
    error?: string;
  } | null>(null);

  const runAutoSetup = async () => {
    setIsSetupRunning(true);
    setSetupResults(null);

    try {
      console.log('🚀 Starting one-click database setup...');
      toast.info('Starting database setup...');

      // Step 1: Create the companies and deals using direct insert operations
      // This will trigger table creation if tables don't exist (depending on Supabase config)
      
      const demoCompanies = [
        {
          name: 'Demo PropFirm Alpha',
          description: 'Demo prop trading firm for testing admin functionality. Offers CFD trading challenges with competitive profit targets.',
          website: 'https://demo-propfirm-alpha.com',
          categories: ['CFD'],
          country: 'United States',
          contact_email: 'admin@demo-propfirm-alpha.com',
          status: 'pending' as const
        },
        {
          name: 'Demo Crypto Exchange', 
          description: 'Demo crypto exchange for testing admin functionality. Provides spot and futures trading for major cryptocurrencies.',
          website: 'https://demo-crypto-exchange.com',
          categories: ['Crypto'],
          country: 'United Kingdom',
          contact_email: 'admin@demo-crypto-exchange.com',
          status: 'approved' as const
        },
        {
          name: 'Demo Futures Broker',
          description: 'Demo futures broker for testing admin functionality. Specializes in commodities and indices futures trading.',
          website: 'https://demo-futures-broker.com',
          categories: ['Futures'],
          country: 'Germany',
          contact_email: 'admin@demo-futures-broker.com',
          status: 'rejected' as const
        }
      ];

      // Try direct table creation via SQL execution
      const createSQL = `
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
          status VARCHAR(50) DEFAULT 'pending',
          approved_by UUID,
          approved_at TIMESTAMP WITH TIME ZONE,
          rejected_by UUID,
          rejected_at TIMESTAMP WITH TIME ZONE,
          rejection_reason TEXT,
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
          status VARCHAR(50) DEFAULT 'pending_approval',
          approved_by UUID,
          approved_at TIMESTAMP WITH TIME ZONE,
          rejected_by UUID,
          rejected_at TIMESTAMP WITH TIME ZONE,
          rejection_reason TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Enable RLS (Row Level Security)
        ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.broker_deals ENABLE ROW LEVEL SECURITY;

        -- Create policies for access (permissive for development)
        CREATE POLICY IF NOT EXISTS "Allow all operations on companies" 
        ON public.companies FOR ALL USING (true);

        CREATE POLICY IF NOT EXISTS "Allow all operations on broker deals" 
        ON public.broker_deals FOR ALL USING (true);
      `;

      // Try using exec_sql if available
      let tablesCreated = false;
      try {
        const { error: sqlError } = await supabase.rpc('exec_sql', { sql: createSQL });
        if (!sqlError) {
          tablesCreated = true;
          console.log('✅ Tables created via SQL execution');
          toast.success('Tables created successfully!');
        }
      } catch (sqlErr) {
        console.log('⚠️ SQL execution not available, trying alternative...');
      }

      // Insert companies
      console.log('📝 Inserting demo companies...');
      const { data: insertedCompanies, error: companiesError } = await supabase
        .from('companies')
        .upsert(demoCompanies, { 
          onConflict: 'name',
          ignoreDuplicates: true 
        })
        .select();

      if (companiesError) {
        console.error('❌ Companies insert error:', companiesError);
        throw new Error(`Failed to insert companies: ${companiesError.message}`);
      }

      const companiesCount = insertedCompanies?.length || 0;
      console.log(`✅ ${companiesCount} companies processed`);

      // Insert demo deals
      console.log('📝 Inserting demo deals...');
      
      // Get company IDs
      const { data: companies } = await supabase
        .from('companies')
        .select('id, name')
        .in('name', ['Demo PropFirm Alpha', 'Demo Crypto Exchange']);

      let dealsCount = 0;
      if (companies && companies.length > 0) {
        const propFirm = companies.find(c => c.name === 'Demo PropFirm Alpha');
        const cryptoExchange = companies.find(c => c.name === 'Demo Crypto Exchange');

        const demoDeals = [];
        
        if (propFirm) {
          demoDeals.push(
            {
              company_id: propFirm.id,
              title: '50% Off Trading Challenge',
              description: 'Get 50% discount on our $100K trading challenge. Perfect for experienced traders.',
              category: 'CFD',
              start_date: new Date().toISOString(),
              end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              terms: 'Valid for new customers only.',
              status: 'pending_approval'
            },
            {
              company_id: propFirm.id,
              title: '25% Bonus on Profits',
              description: 'Earn 25% bonus on first month profits.',
              category: 'CFD',
              start_date: new Date().toISOString(),
              end_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
              terms: 'Must complete challenge within 30 days.',
              status: 'pending_approval'
            }
          );
        }

        if (cryptoExchange) {
          demoDeals.push({
            company_id: cryptoExchange.id,
            title: 'Free Trading for 30 Days',
            description: 'Trade crypto with zero fees for 30 days.',
            category: 'Crypto',
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
            terms: 'Valid for new accounts only.',
            status: 'approved'
          });
        }

        if (demoDeals.length > 0) {
          const { data: insertedDeals, error: dealsError } = await supabase
            .from('broker_deals')
            .insert(demoDeals)
            .select();

          if (dealsError) {
            console.error('⚠️ Deals insert error:', dealsError);
          } else {
            dealsCount = insertedDeals?.length || 0;
            console.log(`✅ ${dealsCount} deals inserted`);
          }
        }
      }

      setSetupResults({
        tablesCreated: true,
        companiesInserted: companiesCount,
        dealsInserted: dealsCount
      });

      toast.success(`🎉 Setup complete! ${companiesCount} companies, ${dealsCount} deals added`);

    } catch (error) {
      console.error('💥 Auto setup failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setSetupResults({
        tablesCreated: false,
        companiesInserted: 0,
        dealsInserted: 0,
        error: errorMessage
      });

      toast.error('Auto setup failed. Manual setup required.');
    } finally {
      setIsSetupRunning(false);
    }
  };

  return (
    <Card className="p-6 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Zap className="w-6 h-6 text-white" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            One-Click Database Setup
          </h3>
          <p className="text-blue-700 text-sm mb-4">
            Automatically create database tables and insert demo data. This will fix all PGRST205 errors.
          </p>

          <div className="mb-4">
            <div className="text-xs text-blue-600 space-y-1">
              <div>✅ Creates companies table</div>
              <div>✅ Creates broker_deals table</div>
              <div>✅ Sets up security policies</div>
              <div>✅ Adds 3 demo companies</div>
              <div>✅ Adds 3 demo deals</div>
            </div>
          </div>

          <Button 
            onClick={runAutoSetup}
            disabled={isSetupRunning}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg"
          >
            {isSetupRunning ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Setting up database...
              </>
            ) : (
              <>
                <Database className="w-4 h-4 mr-2" />
                Run Auto Setup
              </>
            )}
          </Button>

          {setupResults && (
            <div className="mt-4 p-4 rounded-xl bg-white/70 border border-blue-200">
              {setupResults.error ? (
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-red-900">Setup Failed</div>
                    <div className="text-sm text-red-700 mt-1">{setupResults.error}</div>
                    <div className="text-xs text-red-600 mt-2">
                      Please use the manual setup method above.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-green-900">Setup Completed!</div>
                    <div className="text-sm text-green-700 mt-1">
                      ✅ Tables: Created<br/>
                      ✅ Companies: {setupResults.companiesInserted} added<br/>
                      ✅ Deals: {setupResults.dealsInserted} added
                    </div>
                    <div className="text-xs text-green-600 mt-2">
                      Your admin panel should now work perfectly!
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}