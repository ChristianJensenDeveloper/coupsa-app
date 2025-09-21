import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Database, RefreshCw, Plus, Eye, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from "./ui/alert";
import { supabase } from "../lib/supabase";

interface DealRecord {
  [key: string]: any;
}

const DealsTableInspector: React.FC = () => {
  const [dealsData, setDealsData] = useState<DealRecord[]>([]);
  const [tableExists, setTableExists] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [columns, setColumns] = useState<string[]>([]);

  const checkDealsTable = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Checking deals table...');
      
      // Try to fetch deals data
      const { data, error: fetchError } = await supabase
        .from('deals')
        .select('*')
        .limit(10);

      if (fetchError) {
        console.error('❌ Deals table error:', fetchError);
        setTableExists(false);
        setError(fetchError.message);
        
        // Try alternative table names
        const alternatives = ['coupons', 'offers', 'discounts', 'promotions'];
        
        for (const tableName of alternatives) {
          try {
            const { data: altData, error: altError } = await supabase
              .from(tableName)
              .select('*')
              .limit(5);
              
            if (!altError && altData) {
              console.log(`✅ Found data in ${tableName} table:`, altData);
              setDealsData(altData);
              setTableExists(true);
              if (altData.length > 0) {
                setColumns(Object.keys(altData[0]));
              }
              setError(`Using data from '${tableName}' table instead of 'deals'`);
              break;
            }
          } catch (e) {
            // Continue to next alternative
          }
        }
      } else {
        console.log('✅ Deals table exists:', data);
        setTableExists(true);
        setDealsData(data || []);
        
        if (data && data.length > 0) {
          setColumns(Object.keys(data[0]));
        }
      }

    } catch (err) {
      console.error('💥 Error checking deals table:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setTableExists(false);
    } finally {
      setLoading(false);
    }
  };

  const createSampleDeal = async () => {
    try {
      const sampleDeal = {
        title: 'Sample FTMO Deal',
        description: 'Get 30% off FTMO Challenge - perfect for testing the database integration',
        category: 'CFD',
        merchant_name: 'FTMO',
        discount_text: '30% OFF',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Published',
        terms: 'Sample deal for testing purposes',
        coupon_code: 'FTMO30',
        affiliate_link: 'https://ftmo.com/signup?ref=koocao',
        verification_badge: true
      };

      const { data, error } = await supabase
        .from('deals')
        .insert([sampleDeal])
        .select();

      if (error) {
        throw error;
      }

      console.log('✅ Sample deal created:', data);
      alert('✅ Sample deal created successfully!');
      checkDealsTable(); // Refresh data
    } catch (err) {
      console.error('❌ Failed to create sample deal:', err);
      alert(`❌ Failed to create sample deal: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  useEffect(() => {
    checkDealsTable();
  }, []);

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    if (typeof value === 'string' && value.length > 100) {
      return value.substring(0, 100) + '...';
    }
    return String(value);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Deals Table Inspector
            </CardTitle>
            <CardDescription>
              Inspect your deals table structure and data
            </CardDescription>
          </div>
          <Button onClick={checkDealsTable} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center gap-2">
          {tableExists === true && (
            <>
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-green-700 dark:text-green-300">Table exists</span>
              <Badge variant="outline">{dealsData.length} records</Badge>
            </>
          )}
          
          {tableExists === false && (
            <>
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700 dark:text-red-300">Table missing or inaccessible</span>
            </>
          )}

          {loading && (
            <>
              <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
              <span className="text-blue-700 dark:text-blue-300">Checking...</span>
            </>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant={error.includes('Using data from') ? 'default' : 'destructive'}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Table Structure */}
        {columns.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Table Columns ({columns.length})</h4>
            <div className="flex flex-wrap gap-2">
              {columns.map((col) => (
                <Badge key={col} variant="secondary" className="text-xs">
                  {col}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Sample Data */}
        {dealsData.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Sample Records</h4>
              <Badge variant="outline">{dealsData.length} shown</Badge>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 overflow-x-auto">
              <div className="space-y-4">
                {dealsData.slice(0, 3).map((deal, index) => (
                  <div key={index} className="border-b border-slate-200 dark:border-slate-600 pb-4 last:border-b-0">
                    <div className="font-medium text-sm mb-2">Record {index + 1}</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      {Object.entries(deal).map(([key, value]) => (
                        <div key={key} className="flex">
                          <span className="font-mono text-slate-500 w-24 shrink-0">{key}:</span>
                          <span className="text-slate-700 dark:text-slate-300 break-all">
                            {formatValue(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {tableExists && dealsData.length === 0 && (
          <div className="text-center py-8">
            <Database className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
              Table exists but is empty
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              No deals found in the database. Add some sample data to test the integration.
            </p>
            <Button onClick={createSampleDeal}>
              <Plus className="w-4 h-4 mr-2" />
              Create Sample Deal
            </Button>
          </div>
        )}

        {/* Missing Table Actions */}
        {tableExists === false && !loading && (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
              Deals table not found
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              The app is looking for a 'deals' table in your Supabase database. 
              You need to create this table first.
            </p>
            <Alert className="mt-4">
              <AlertDescription className="text-left">
                <strong>Quick Fix:</strong>
                <br />
                1. Go to your Supabase project dashboard
                <br />
                2. Open the SQL Editor
                <br />
                3. Create a deals table with columns like: title, description, category, merchant_name, status, end_date
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DealsTableInspector;