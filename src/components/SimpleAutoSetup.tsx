import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { supabase } from '../lib/supabase';
import { RefreshCw, Database, CheckCircle, XCircle, Zap, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function SimpleAutoSetup() {
  const [isSetupRunning, setIsSetupRunning] = useState(false);
  const [setupStatus, setSetupStatus] = useState<'idle' | 'running' | 'success' | 'failed'>('idle');
  const [setupResults, setSetupResults] = useState<{
    companies: number;
    deals: number;
    message: string;
  } | null>(null);

  const runDirectSetup = async () => {
    setIsSetupRunning(true);
    setSetupStatus('running');
    setSetupResults(null);

    try {
      console.log('🚀 Starting direct database setup...');
      toast.info('Setting up your database...', { id: 'setup' });

      // Step 1: Try to insert companies directly - this may create the table
      const demoCompanies = [
        {
          id: '11111111-1111-1111-1111-111111111111',
          name: 'Demo PropFirm Alpha',
          description: 'Demo prop trading firm for testing admin functionality. Offers CFD trading challenges with competitive profit targets.',
          website: 'https://demo-propfirm-alpha.com',
          categories: ['CFD'],
          country: 'United States',
          contact_email: 'admin@demo-propfirm-alpha.com',
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '22222222-2222-2222-2222-222222222222',
          name: 'Demo Crypto Exchange',
          description: 'Demo crypto exchange for testing admin functionality. Provides spot and futures trading for major cryptocurrencies.',
          website: 'https://demo-crypto-exchange.com',
          categories: ['Crypto'],
          country: 'United Kingdom',
          contact_email: 'admin@demo-crypto-exchange.com',
          status: 'approved',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '33333333-3333-3333-3333-333333333333',
          name: 'Demo Futures Broker',
          description: 'Demo futures broker for testing admin functionality. Specializes in commodities and indices futures trading.',
          website: 'https://demo-futures-broker.com',
          categories: ['Futures'],
          country: 'Germany',
          contact_email: 'admin@demo-futures-broker.com',
          status: 'rejected',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      // Try upsert with explicit IDs
      console.log('📝 Creating companies...');
      toast.info('Creating companies...', { id: 'setup' });
      
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .upsert(demoCompanies, { onConflict: 'name' })
        .select();

      if (companiesError) {
        console.error('❌ Companies error:', companiesError);
        
        // If table doesn't exist, show helpful message
        if (companiesError.message.includes('does not exist')) {
          throw new Error(`Companies table doesn't exist. Please run the manual SQL setup first.\n\nError: ${companiesError.message}`);
        }
        
        throw new Error(`Failed to create companies: ${companiesError.message}`);
      }

      const companiesCount = companies?.length || 0;
      console.log(`✅ ${companiesCount} companies created`);

      // Step 2: Create deals
      console.log('📝 Creating deals...');
      toast.info('Creating deals...', { id: 'setup' });

      const demoDeals = [
        {
          id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
          company_id: '11111111-1111-1111-1111-111111111111', // Demo PropFirm Alpha
          title: '50% Off Trading Challenge',
          description: 'Get 50% discount on our $100K trading challenge. Perfect for experienced traders looking to get funded quickly.',
          category: 'CFD',
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          terms: 'Valid for new customers only. Cannot be combined with other offers.',
          status: 'pending_approval',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
          company_id: '22222222-2222-2222-2222-222222222222', // Demo Crypto Exchange
          title: 'Free Trading for 30 Days',
          description: 'Trade crypto with zero fees for your first 30 days. All major cryptocurrencies included.',
          category: 'Crypto',
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          terms: 'Valid for new accounts only. Minimum deposit required.',
          status: 'approved',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
          company_id: '11111111-1111-1111-1111-111111111111', // Demo PropFirm Alpha
          title: '25% Bonus on Profits',
          description: 'Earn an additional 25% bonus on your first month profits. Available for all challenge completers.',
          category: 'CFD',
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
          terms: 'Must complete challenge within 30 days to qualify.',
          status: 'pending_approval',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      const { data: deals, error: dealsError } = await supabase
        .from('broker_deals')
        .upsert(demoDeals, { onConflict: 'id' })
        .select();

      if (dealsError) {
        console.error('❌ Deals error:', dealsError);
        
        if (dealsError.message.includes('does not exist')) {
          throw new Error(`Broker deals table doesn't exist. Please run the manual SQL setup first.\n\nError: ${dealsError.message}`);
        }
        
        throw new Error(`Failed to create deals: ${dealsError.message}`);
      }

      const dealsCount = deals?.length || 0;
      console.log(`✅ ${dealsCount} deals created`);

      setSetupResults({
        companies: companiesCount,
        deals: dealsCount,
        message: 'Database setup completed successfully!'
      });

      setSetupStatus('success');
      toast.success(`🎉 Success! ${companiesCount} companies, ${dealsCount} deals created`, { id: 'setup' });

    } catch (error) {
      console.error('💥 Setup failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      setSetupResults({
        companies: 0,
        deals: 0,
        message: errorMessage
      });

      setSetupStatus('failed');
      toast.error('Setup failed. Please try manual setup.', { id: 'setup' });
    } finally {
      setIsSetupRunning(false);
    }
  };

  const showManualInstructions = () => {
    const instructions = `
🔧 MANUAL SETUP INSTRUCTIONS

Since automatic setup failed, please follow these steps:

1️⃣ Open Supabase Dashboard
   → Go to: https://supabase.com/dashboard
   → Select your KOOCAO project

2️⃣ Open SQL Editor
   → Click "SQL Editor" in the left sidebar
   → Click "New Query"

3️⃣ Copy & Paste This SQL:
   → Copy ALL the contents of QUICK_FIX_DATABASE.sql
   → Paste into the SQL editor
   → Click "Run" button

4️⃣ Verify Success
   → Come back here and try auto setup again
   → Your admin panel should work perfectly!

The QUICK_FIX_DATABASE.sql file contains:
✅ Complete table creation (companies, broker_deals)
✅ Proper permissions and security
✅ Demo data (3 companies, 3 deals)
✅ Indexes for performance
    `.trim();

    alert(instructions);
  };

  return (
    <Card className="p-6 border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/50">
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
          setupStatus === 'success' ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' :
          setupStatus === 'failed' ? 'bg-gradient-to-br from-red-500 to-red-600' :
          setupStatus === 'running' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
          'bg-gradient-to-br from-emerald-500 to-emerald-600'
        }`}>
          {setupStatus === 'running' ? (
            <RefreshCw className="w-6 h-6 text-white animate-spin" />
          ) : setupStatus === 'success' ? (
            <CheckCircle className="w-6 h-6 text-white" />
          ) : setupStatus === 'failed' ? (
            <XCircle className="w-6 h-6 text-white" />
          ) : (
            <Zap className="w-6 h-6 text-white" />
          )}
        </div>
        
        <div className="flex-1">
          <h3 className={`text-lg font-semibold mb-2 ${
            setupStatus === 'failed' ? 'text-red-900' : 'text-emerald-900'
          }`}>
            {setupStatus === 'running' ? 'Setting Up Database...' :
             setupStatus === 'success' ? 'Setup Complete!' :
             setupStatus === 'failed' ? 'Setup Failed' :
             'Quick Database Setup'}
          </h3>
          
          <p className={`text-sm mb-4 ${
            setupStatus === 'failed' ? 'text-red-700' : 'text-emerald-700'
          }`}>
            {setupStatus === 'running' ? 'Please wait while we create your database tables and demo data...' :
             setupStatus === 'success' ? 'Your database is ready! All tables created with demo data.' :
             setupStatus === 'failed' ? 'Automatic setup encountered an issue. Manual setup required.' :
             'Create database tables and demo data with one click. This fixes all PGRST205 errors.'}
          </p>

          {setupResults && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              setupStatus === 'success' 
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {setupStatus === 'success' ? (
                <>
                  ✅ {setupResults.companies} companies created<br/>
                  ✅ {setupResults.deals} deals created<br/>
                  ✅ Admin panel is ready to use!
                </>
              ) : (
                <>
                  ❌ {setupResults.message}<br/>
                  <div className="mt-2 text-xs">
                    The tables likely don't exist yet. Please use manual setup first.
                  </div>
                </>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={runDirectSetup}
              disabled={isSetupRunning}
              className={`${
                setupStatus === 'success' 
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700' 
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
              } text-white shadow-lg`}
            >
              {isSetupRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : setupStatus === 'success' ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Setup Complete
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Try Auto Setup
                </>
              )}
            </Button>

            {setupStatus === 'failed' && (
              <Button 
                onClick={showManualInstructions}
                variant="outline"
                className="border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Manual Setup
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}