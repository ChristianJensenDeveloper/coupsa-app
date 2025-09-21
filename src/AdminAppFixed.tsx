import { useState } from "react";
import { AdminSidebar, AdminPage } from "./components/AdminSidebar";
import { AdminDashboard } from "./components/AdminDashboard";
import { AnalyticsDashboard } from "./components/AnalyticsDashboard";
import { CompaniesManagerSimple } from "./components/CompaniesManagerSimple";
import { DealsManager } from "./components/DealsManager";
import { UsersManager } from "./components/UsersManager";
import { StringProvider } from "./components/useStrings";
import { Button } from "./components/ui/button";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner@2.0.3";
import { ArrowLeft } from "lucide-react";

interface AdminAppProps {
  onBackToUser?: () => void;
}

// Minimal mock data
const mockCompanies = [
  {
    id: '1',
    name: 'FundedNext',
    description: 'Leading prop trading firm offering funded accounts up to $300K.',
    website: 'https://fundednext.com',
    categories: ['CFD'],
    country: 'United Arab Emirates',
    contactEmail: 'partnerships@fundednext.com',
    contactPhone: '+971 4 123 4567',
    createdAt: '2024-12-20T09:30:00Z',
    status: 'pending' as const,
    userId: 'user123'
  },
  {
    id: '2',
    name: 'TradeForge Pro',
    description: 'Innovative crypto trading platform with advanced tools and 24/7 support.',
    website: 'https://tradeforge.pro',
    categories: ['Crypto'],
    country: 'Estonia',
    contactEmail: 'hello@tradeforge.pro',
    createdAt: '2024-12-18T14:20:00Z',
    status: 'approved' as const,
    userId: 'user456',
    approvedBy: 'admin1',
    approvedAt: '2024-12-19T10:15:00Z'
  }
];

const mockBrokerDeals = [
  {
    id: '1',
    companyId: '1',
    title: '50% Off Trading Challenge',
    description: 'Get 50% discount on our $100K trading challenge.',
    category: 'CFD',
    startDate: '2025-01-01T00:00',
    endDate: '2025-03-31T23:59',
    terms: 'Valid for new customers only. One-time use per account.',
    status: 'pending_approval' as const,
    createdAt: '2024-12-20T09:30:00Z',
    updatedAt: '2024-12-20T09:30:00Z'
  }
];

function AdminAppContent({ onBackToUser }: AdminAppProps) {
  const [currentPage, setCurrentPage] = useState<AdminPage>('dashboard');

  const handlePageChange = (page: AdminPage) => {
    console.log('🟢 FIXED - Page change to:', page);
    setCurrentPage(page);
  };

  const handleApproveCompany = (companyId: string) => {
    toast.success("Company approved!");
  };

  const handleRejectCompany = (companyId: string, reason: string) => {
    toast.success("Company rejected!");
  };

  const handleSuspendCompany = (companyId: string) => {
    toast.success("Company suspended!");
  };

  const handleUpdateCompany = (company: any) => {
    toast.success("Company updated!");
  };

  const renderPage = () => {
    console.log('🟢 FIXED - Rendering page:', currentPage);
    
    switch (currentPage) {
      case 'companies':
        return (
          <div>
            <div style={{ backgroundColor: 'green', color: 'white', padding: '20px', marginBottom: '20px', borderRadius: '10px' }}>
              <h1>✅ COMPANIES PAGE WORKING!</h1>
              <p>Current page: {currentPage}</p>
              <p>Companies: {mockCompanies.length}</p>
            </div>
            <CompaniesManagerSimple
              companies={mockCompanies}
              brokerDeals={mockBrokerDeals}
              onApproveCompany={handleApproveCompany}
              onRejectCompany={handleRejectCompany}
              onSuspendCompany={handleSuspendCompany}
              onUpdateCompany={handleUpdateCompany}
            />
          </div>
        );
      
      case 'analytics':
        return <AnalyticsDashboard />;
      
      case 'deals':
        return (
          <div>
            <h2>Deals Management</h2>
            <p>Deals management would go here</p>
          </div>
        );
      
      case 'users':
        return (
          <div>
            <h2>Users Management</h2>
            <p>Users management would go here</p>
          </div>
        );
      
      default:
        return <AdminDashboard deals={[]} firms={[]} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 flex">
      {/* DEBUG BAR */}
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        backgroundColor: 'green', 
        color: 'white', 
        padding: '10px', 
        zIndex: 9999,
        fontWeight: 'bold'
      }}>
        ✅ FIXED VERSION - Current Page: "{currentPage}"
      </div>

      {/* Sidebar */}
      <AdminSidebar currentPage={currentPage} onPageChange={handlePageChange} />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8" style={{ marginTop: '60px' }}>
          {onBackToUser && (
            <div className="mb-6">
              <Button 
                variant="outline" 
                onClick={onBackToUser}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to User App
              </Button>
            </div>
          )}
          
          {/* Content */}
          <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/30 shadow-lg p-6">
            {renderPage()}
          </div>
        </div>
      </div>

      <Toaster />
    </div>
  );
}

export default function AdminAppFixed({ onBackToUser }: AdminAppProps) {
  return (
    <StringProvider>
      <AdminAppContent onBackToUser={onBackToUser} />
    </StringProvider>
  );
}