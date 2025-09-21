import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { AlertTriangle, CheckCircle, Database, RefreshCw, Eye } from 'lucide-react';
import { Alert, AlertDescription } from "./ui/alert";
import { supabase } from "../lib/supabase";

interface TableInfo {
  name: string;
  exists: boolean;
  count?: number;
  columns?: string[];
  sample?: any[];
  error?: string;
}

const DatabaseDiagnostic: React.FC = () => {
  const [tableInfo, setTableInfo] = useState<TableInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedTable, setExpandedTable] = useState<string | null>(null);

  const tablesToCheck = [
    'deals',
    'coupons', 
    'offers',
    'discounts',
    'companies',
    'users',
    'profiles'
  ];

  const checkTables = async () => {
    setLoading(true);
    const results: TableInfo[] = [];

    for (const tableName of tablesToCheck) {
      const info: TableInfo = {
        name: tableName,
        exists: false
      };

      try {
        // Try to fetch a few records to see if table exists and get structure
        const { data, error, count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact' })
          .limit(3);

        if (error) {
          info.error = error.message;
        } else {
          info.exists = true;
          info.count = count || 0;
          info.sample = data || [];
          
          // Extract column names from first row
          if (data && data.length > 0) {
            info.columns = Object.keys(data[0]);
          }
        }
      } catch (err) {
        info.error = err instanceof Error ? err.message : 'Unknown error';
      }

      results.push(info);
    }

    setTableInfo(results);
    setLoading(false);
  };

  useEffect(() => {
    checkTables();
  }, []);

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'object') return JSON.stringify(value);
    if (typeof value === 'string' && value.length > 50) {
      return value.substring(0, 50) + '...';
    }
    return String(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Database Diagnostic</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Check your Supabase database structure and identify issues
          </p>
        </div>
        <Button onClick={checkTables} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Checking...' : 'Refresh'}
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-500" />
              Tables Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {tableInfo.filter(t => t.exists).length}
            </div>
            <p className="text-sm text-slate-600">of {tablesToCheck.length} checked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Total Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {tableInfo.reduce((sum, t) => sum + (t.count || 0), 0)}
            </div>
            <p className="text-sm text-slate-600">across all tables</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Issues Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {tableInfo.filter(t => t.error).length}
            </div>
            <p className="text-sm text-slate-600">tables with errors</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Table Details</h3>
        
        {tableInfo.map((table) => (
          <Card key={table.name} className="overflow-hidden">
            <CardHeader className="cursor-pointer" onClick={() => 
              setExpandedTable(expandedTable === table.name ? null : table.name)
            }>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-3">
                  {table.exists ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  )}
                  {table.name}
                  <Badge variant={table.exists ? "default" : "secondary"}>
                    {table.exists ? 'Exists' : 'Missing'}
                  </Badge>
                </CardTitle>
                <div className="flex items-center gap-2">
                  {table.count !== undefined && (
                    <Badge variant="outline">{table.count} records</Badge>
                  )}
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {table.error && (
                <CardDescription className="text-red-600">
                  Error: {table.error}
                </CardDescription>
              )}
            </CardHeader>

            {expandedTable === table.name && table.exists && (
              <CardContent className="pt-0">
                {/* Columns */}
                {table.columns && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Columns ({table.columns.length})</h4>
                    <div className="flex flex-wrap gap-2">
                      {table.columns.map((col) => (
                        <Badge key={col} variant="outline" className="text-xs">
                          {col}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sample Data */}
                {table.sample && table.sample.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Sample Data</h4>
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 overflow-x-auto">
                      <table className="min-w-full text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-600">
                            {table.columns?.slice(0, 6).map((col) => (
                              <th key={col} className="text-left py-2 pr-4 font-medium">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {table.sample.slice(0, 3).map((row, idx) => (
                            <tr key={idx} className="border-b border-slate-100 dark:border-slate-700">
                              {table.columns?.slice(0, 6).map((col) => (
                                <td key={col} className="py-2 pr-4 text-slate-600 dark:text-slate-400">
                                  {formatValue(row[col])}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {table.sample && table.sample.length === 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      This table exists but has no data
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Recommendations */}
      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-800 dark:text-blue-200">
            💡 Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
            {!tableInfo.find(t => t.name === 'deals' && t.exists) && (
              <p>• Create a 'deals' table to store your discount offers</p>
            )}
            {!tableInfo.find(t => t.name === 'companies' && t.exists) && (
              <p>• Create a 'companies' table to store broker/prop firm information</p>
            )}
            {tableInfo.find(t => t.name === 'deals' && t.exists && (t.count || 0) === 0) && (
              <p>• Add some sample deals to your 'deals' table</p>
            )}
            <p>• Make sure your deals table has columns: title, description, category, merchant_name, end_date, status</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseDiagnostic;