import { useState } from "react";
import { AdminSidebar, AdminPage } from "./components/AdminSidebar";
import { AdminDashboard } from "./components/AdminDashboard";
import { AnalyticsDashboard } from "./components/AnalyticsDashboard";
import { CompaniesManagerSimple } from "./components/CompaniesManagerSimple";
import { DealsManager } from "./components/DealsManager";
import { UsersManager } from "./components/UsersManager";
import { RevenueManager } from "./components/RevenueManager";
import { AdminCompliance } from "./components/AdminCompliance";
import { AdminGDPR } from "./components/AdminGDPR";
import { AdminNotifications } from "./components/AdminNotifications";
import { AdminLanguages } from "./components/AdminLanguages";
import { LanguageSetupMVP } from "./components/LanguageSetupMVP";
import { TrackingAnalytics } from "./components/TrackingAnalytics";
import { AdminChatSupport } from "./components/AdminChatSupport";
import { EmailManagement } from "./components/EmailManagement";
import { AdminGiveaways } from "./components/AdminGiveaways";
import { BrokerDealsManager } from "./components/BrokerDealsManager";
import { StringProvider } from "./components/useStrings";
import { Button } from "./components/ui/button";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner@2.0.3";
import { ArrowLeft } from "lucide-react";

interface AdminAppProps {
  onBackToUser?: () => void;
}

// Mock data
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

const mockAdminDeals = [
  {
    id: '1',
    firmId: '1',
    title: '30% off Challenge Fee',
    discountPercentage: 30,
    couponCode: 'FTMO30',
    category: 'CFD',
    startDate: '2025-01-01T00:00',
    endDate: '2026-03-15T23:59',
    status: 'Published',
    hasVerificationBadge: true,
    cardNotes: 'Perfect for experienced traders looking to get funded.',
    affiliateLink: 'https://ftmo.com/signup?ref=koocao',
    discountType: 'percentage'
  }
];

const mockFirms = [
  { 
    id: '1', 
    name: 'FTMO', 
    logo: 'https://images.unsplash.com/photo-1642310290564-30033ff60334?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wYW55JTIwbG9nbyUyMHByb2Zlc3Npb25hbCUyMGZpbmFuY2V8ZW58MXx8fHwxNzU2NTQ2Nzg0fDA&ixlib=rb-4.1.0&q=80&w=100',
    affiliateLink: 'https://ftmo.com/signup?ref=reduzed',
    couponCode: 'FTMO30',
    category: 'CFD Prop',
    createdAt: '2024-01-15T10:30:00Z',
    status: 'Active'
  }
];

const mockUsers = [
  {
    id: '1',
    loginMethod: 'email',
    name: 'John Doe',
    phoneNumber: '+1234567890',
    email: 'john.doe@example.com',
    joinedAt: '2024-12-15T10:30:00Z',
    country: 'United States',
    status: 'active',
    lastActive: '2025-01-01T14:30:00Z'
  }
];

function AdminAppContent({ onBackToUser }: AdminAppProps) {
  const [currentPage, setCurrentPage] = useState<AdminPage>('dashboard');

  const handlePageChange = (page: AdminPage) => {
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

  const renderContent = () => {
    switch (currentPage) {
      case 'companies':
        return (
          <CompaniesManagerSimple
            companies={mockCompanies}
            brokerDeals={mockBrokerDeals}
            onApproveCompany={handleApproveCompany}
            onRejectCompany={handleRejectCompany}
            onSuspendCompany={handleSuspendCompany}
            onUpdateCompany={handleUpdateCompany}
          />
        );
      
      case 'analytics':
        return <AnalyticsDashboard />;
      
      case 'deals':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Deals Management</h2>
              <p className="text-slate-600 dark:text-slate-400">Manage admin-created deals and company-submitted deals</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Admin Created Deals */}
              <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/30 shadow-lg p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Admin Created Deals</h3>
                <p>Admin deals manager would go here</p>
              </div>
              
              {/* Company Submitted Deals */}
              <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/30 shadow-lg p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Company Submitted Deals</h3>
                <BrokerDealsManager
                  brokerDeals={mockBrokerDeals}
                  companies={mockCompanies}
                  onApproveDeal={() => toast.success("Deal approved!")}
                  onRejectDeal={() => toast.success("Deal rejected!")}
                  onUpdateDeal={() => toast.success("Deal updated!")}
                />
              </div>
            </div>
          </div>
        );
      
      case 'users':
        return (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Users Management</h2>
            <p className="text-slate-600 dark:text-slate-400">Users: {mockUsers.length}</p>
          </div>
        );
      
      case 'revenue':
        return <RevenueManager firms={mockFirms} />;
      
      case 'compliance':
        return <AdminCompliance />;
      
      case 'gdpr':
        return <AdminGDPR />;
      
      case 'notifications':
        return <AdminNotifications />;
      
      case 'languages':
        return <AdminLanguages />;
      
      case 'language-setup':
        return <LanguageSetupMVP />;
      
      case 'tracking':
        return <TrackingAnalytics />;
      
      case 'chat-support':
        return <AdminChatSupport />;
      
      case 'giveaways':
        return <AdminGiveaways />;
      
      case 'email-management':
        return <div><h2>Email Management</h2><p>Email management would go here</p></div>;
      
      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">System Settings</h2>
            <p className="text-muted-foreground">Advanced system configuration and API settings would be implemented here.</p>
          </div>
        );
      
      default:
        return <AdminDashboard deals={mockAdminDeals} firms={mockFirms} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 flex">
      {/* Sidebar */}
      <AdminSidebar currentPage={currentPage} onPageChange={handlePageChange} />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8">
          {onBackToUser && (
            <div className="mb-6">
              <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/30 shadow-lg p-4">
                <Button 
                  variant="outline" 
                  onClick={onBackToUser}
                  className="flex items-center gap-2 rounded-xl border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to User App
                </Button>
              </div>
            </div>
          )}
          
          {/* Admin Header */}
          <div className="mb-6">
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-700/30 shadow-lg px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-blue-500 rounded-2xl flex items-center justify-center shadow-md">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent tracking-tight">
                    KOOCAO Admin
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 -mt-0.5 font-medium">
                    Deal Management Portal - Current: {currentPage}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Container */}
          <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/30 shadow-lg">
            <div className="p-6 lg:p-8">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>

      <Toaster />
    </div>
  );
}

export default function AdminApp({ onBackToUser }: AdminAppProps) {
  return (
    <StringProvider>
      <AdminAppContent onBackToUser={onBackToUser} />
    </StringProvider>
  );
}