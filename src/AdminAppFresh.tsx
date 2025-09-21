import { useState } from "react";
import { AdminSidebar, AdminPage } from "./components/AdminSidebar";
import { CompaniesManagerSimple } from "./components/CompaniesManagerSimple";
import { AdminDashboard } from "./components/AdminDashboard";
import { AnalyticsDashboard } from "./components/AnalyticsDashboard";
import { StringProvider } from "./components/useStrings";
import { Button } from "./components/ui/button";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner@2.0.3";
import { ArrowLeft } from "lucide-react";

interface AdminAppProps {
  onBackToUser?: () => void;
}

// Simple mock data
const MOCK_COMPANIES = [
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
    description: 'Innovative crypto trading platform with advanced tools.',
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

const MOCK_BROKER_DEALS = [
  {
    id: '1',
    companyId: '1',
    title: '50% Off Trading Challenge',
    description: 'Get 50% discount on our $100K trading challenge.',
    category: 'CFD',
    startDate: '2025-01-01T00:00',
    endDate: '2025-03-31T23:59',
    terms: 'Valid for new customers only.',
    status: 'pending_approval' as const,
    createdAt: '2024-12-20T09:30:00Z',
    updatedAt: '2024-12-20T09:30:00Z'
  }
];

function AdminContent({ onBackToUser }: AdminAppProps) {
  const [currentPage, setCurrentPage] = useState<AdminPage>('dashboard');

  console.log("🔥 FRESH ADMIN - Current page:", currentPage);

  const handlePageChange = (page: AdminPage) => {
    console.log("🔥 FRESH ADMIN - Changing to page:", page);
    setCurrentPage(page);
  };

  // Simple handlers
  const handleApproveCompany = () => toast.success("Company approved!");
  const handleRejectCompany = () => toast.success("Company rejected!");
  const handleSuspendCompany = () => toast.success("Company suspended!");
  const handleUpdateCompany = () => toast.success("Company updated!");

  const renderPageContent = () => {
    console.log("🔥 FRESH ADMIN - Rendering content for:", currentPage);

    if (currentPage === 'companies') {
      return (
        <div>
          <div style={{ 
            backgroundColor: 'green', 
            color: 'white', 
            padding: '20px', 
            marginBottom: '20px',
            borderRadius: '10px',
            textAlign: 'center',
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            ✅ FRESH COMPANIES PAGE WORKING! ✅
            <br/>
            Current page: {currentPage}
          </div>
          <CompaniesManagerSimple
            companies={MOCK_COMPANIES}
            brokerDeals={MOCK_BROKER_DEALS}
            onApproveCompany={handleApproveCompany}
            onRejectCompany={handleRejectCompany}
            onSuspendCompany={handleSuspendCompany}
            onUpdateCompany={handleUpdateCompany}
          />
        </div>
      );
    }

    if (currentPage === 'analytics') {
      return (
        <div>
          <div style={{ 
            backgroundColor: 'purple', 
            color: 'white', 
            padding: '20px', 
            marginBottom: '20px',
            borderRadius: '10px',
            textAlign: 'center',
            fontSize: '18px'
          }}>
            📊 ANALYTICS PAGE 📊
          </div>
          <AnalyticsDashboard />
        </div>
      );
    }

    // Default dashboard
    return (
      <div>
        <div style={{ 
          backgroundColor: 'orange', 
          color: 'white', 
          padding: '20px', 
          marginBottom: '20px',
          borderRadius: '10px',
          textAlign: 'center',
          fontSize: '18px'
        }}>
          🏠 DASHBOARD PAGE 🏠
          <br/>
          Current page: {currentPage}
        </div>
        <AdminDashboard deals={[]} firms={[]} />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 flex">
      {/* Debug bar - fixed at top */}
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        backgroundColor: 'red', 
        color: 'white', 
        padding: '10px', 
        zIndex: 9999,
        fontSize: '16px',
        fontWeight: 'bold',
        textAlign: 'center'
      }}>
        🔥 FRESH ADMIN DEBUG: Page = "{currentPage}"
      </div>

      {/* Sidebar */}
      <AdminSidebar currentPage={currentPage} onPageChange={handlePageChange} />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8" style={{ marginTop: '50px' }}>
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
          
          {/* Admin Header */}
          <div className="mb-6">
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-700/30 shadow-lg px-6 py-4">
              <h1 className="text-lg font-bold">KOOCAO Admin - FRESH VERSION</h1>
              <p className="text-sm text-slate-500">Current: {currentPage}</p>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/30 shadow-lg p-6">
            {renderPageContent()}
          </div>
        </div>
      </div>

      <Toaster />
    </div>
  );
}

export default function AdminAppFresh({ onBackToUser }: AdminAppProps) {
  return (
    <StringProvider>
      <AdminContent onBackToUser={onBackToUser} />
    </StringProvider>
  );
}