import { useState } from "react";
import { AdminCompanyCreator } from "./AdminCompanyCreator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Building2, CheckCircle, Clock, Users, Zap, Target } from "lucide-react";
import { Company } from "./types";

export function AdminCompanyPreRegistrationDemo() {
  const [preRegisteredCompanies, setPreRegisteredCompanies] = useState<Company[]>([
    {
      id: 'ftmo-demo',
      name: 'FTMO',
      description: 'Leading prop trading firm offering funded trading accounts.',
      website: 'https://ftmo.com',
      categories: ['CFD', 'Futures'],
      contactEmail: 'info@ftmo.com',
      createdAt: '2024-01-15T10:00:00Z',
      status: 'admin_created',
      createdBy: 'admin',
      originalCreatorId: 'admin_001'
    }
  ]);

  const handleCompanyCreated = (company: Company) => {
    setPreRegisteredCompanies(prev => [...prev, company]);
  };

  const getStatusBadge = (status: Company['status']) => {
    switch (status) {
      case 'admin_created':
        return <Badge className="bg-blue-500 text-white"><Building2 className="w-3 h-3 mr-1" />Pre-Registered</Badge>;
      case 'claim_pending':
        return <Badge className="bg-amber-500 text-white"><Clock className="w-3 h-3 mr-1" />Claim Pending</Badge>;
      case 'claimed':
        return <Badge className="bg-green-500 text-white"><CheckCircle className="w-3 h-3 mr-1" />Claimed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Affiliate Partnership Management
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Set up companies as affiliate partners and manage their deal promotions on KOOCAO
          </p>
        </div>
        <AdminCompanyCreator 
          onCompanyCreated={handleCompanyCreated}
          adminUserId="admin_001"
        />
      </div>

      {/* Strategy Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">1. Setup Partnership</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Add companies you want to work with as affiliate partners and start promoting their deals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">2. Promote Deals</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              List and promote their deals as their affiliate to build platform content and relationships
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">3. Invite Collaboration</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Show them their performance, invite them to take direct control of their deal listings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pre-Registered Companies */}
      <Card>
        <CardHeader>
          <CardTitle>Affiliate Partners ({preRegisteredCompanies.length})</CardTitle>
          <CardDescription>
            Companies you're promoting as affiliate partners that can request direct access
          </CardDescription>
        </CardHeader>
        <CardContent>
          {preRegisteredCompanies.length > 0 ? (
            <div className="grid gap-4">
              {preRegisteredCompanies.map((company) => (
                <div key={company.id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-xl flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                          {company.name}
                        </h3>
                        {getStatusBadge(company.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                        <span>{company.website}</span>
                        <span>•</span>
                        <div className="flex gap-1">
                          {company.categories.map(cat => (
                            <Badge key={cat} variant="outline" className="text-xs">{cat}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      View Profile
                    </Button>
                    <Button variant="outline" size="sm">
                      Add Deals
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No affiliate partners yet</p>
              <p className="text-sm">Start by adding companies you want to promote as affiliate partners</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Tips */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Pro Tips for Affiliate Partnership Strategy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slave-400">
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <p><strong>Research First:</strong> Use accurate company information from their official website and social media</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <p><strong>Start With Popular Companies:</strong> FTMO, TopstepTrader, The5%ers, etc. - companies traders recognize</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <p><strong>Promote Quality Deals:</strong> List 2-3 realistic deals per company to build credibility and relationships</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <p><strong>Transparent Outreach:</strong> "We're your affiliate partners promoting you - want to collaborate directly?"</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <p><strong>Show Performance:</strong> Share analytics showing how their deals perform on your platform</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}