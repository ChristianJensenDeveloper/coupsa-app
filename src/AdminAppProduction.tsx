import { useState, useEffect } from "react";
import { AdminSidebar, AdminPage } from "./components/AdminSidebar";
import { AdminDashboard } from "./components/AdminDashboard";
import { AnalyticsDashboard } from "./components/AnalyticsDashboard";
import { UnifiedAnalyticsDashboard } from "./components/UnifiedAnalyticsDashboard"; // Added this import
import { CompaniesManagerImproved } from "./components/CompaniesManagerImproved";
import { UnifiedDealsManagerImproved } from "./components/UnifiedDealsManagerImproved";
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
import { DatabaseDebugger } from "./components/DatabaseDebugger";
import { StringProvider } from "./components/useStrings";
import { Button } from "./components/ui/button";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner@2.0.3";
import { ArrowLeft } from "lucide-react";
import { 
  fetchCompanies, 
  fetchBrokerDeals, 
  approveCompany, 
  rejectCompany, 
  suspendCompany, 
  updateCompany,
  createCompany 
} from "./lib/admin-companies";
import { Company, BrokerDeal, AdminDeal } from "./components/types";

interface AdminAppProps {
  onBackToUser?: () => void;
}

function AdminContent({ onBackToUser }: AdminAppProps) {
  const [currentPage, setCurrentPage] = useState<AdminPage>('dashboard');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [brokerDeals, setBrokerDeals] = useState<BrokerDeal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mockAdminDeals, setMockAdminDeals] = useState([
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
  ]);

  const [mockFirms, setMockFirms] = useState([
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
  ]);

  const [mockUsers, setMockUsers] = useState([
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
  ]);

  // Load data on component mount
  useEffect(() => {
    loadCompaniesData();
  }, []);

  const loadCompaniesData = async () => {
    setIsLoading(true);
    try {
      const [companiesResult, dealsResult] = await Promise.all([
        fetchCompanies(),
        fetchBrokerDeals()
      ]);

      if (companiesResult.error) {
        if (companiesResult.error.includes('Database tables not set up')) {
          toast.error('Database not set up. Please run the SQL setup script first.', {
            duration: 8000,
            description: 'Check the SETUP_COMPANIES_DATABASE.sql file'
          });
        } else {
          toast.error(`Failed to load companies: ${companiesResult.error}`);
        }
      } else {
        setCompanies(companiesResult.companies);
      }

      if (dealsResult.error) {
        if (dealsResult.error.includes('Database tables not set up')) {
          // Don't show duplicate error message for deals if companies already showed it
          if (!companiesResult.error?.includes('Database tables not set up')) {
            toast.error(`Failed to load deals: ${dealsResult.error}`);
          }
        } else {
          toast.error(`Failed to load deals: ${dealsResult.error}`);
        }
      } else {
        setBrokerDeals(dealsResult.deals);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: AdminPage) => {
    setCurrentPage(page);
  };

  // Event handlers with real database operations
  const handleApproveCompany = async (companyId: string) => {
    try {
      // For now, use a placeholder admin ID. In production, get from auth context
      const adminId = 'current-admin-id';
      const result = await approveCompany(companyId, adminId);
      
      if (result.success) {
        toast.success("Company approved!");
        loadCompaniesData(); // Refresh data
      } else {
        toast.error(`Failed to approve company: ${result.error}`);
      }
    } catch (error) {
      console.error('Error approving company:', error);
      toast.error('Failed to approve company');
    }
  };

  const handleRejectCompany = async (companyId: string, reason: string) => {
    try {
      const adminId = 'current-admin-id';
      const result = await rejectCompany(companyId, adminId, reason);
      
      if (result.success) {
        toast.success("Company rejected!");
        loadCompaniesData(); // Refresh data
      } else {
        toast.error(`Failed to reject company: ${result.error}`);
      }
    } catch (error) {
      console.error('Error rejecting company:', error);
      toast.error('Failed to reject company');
    }
  };

  const handleSuspendCompany = async (companyId: string) => {
    try {
      const adminId = 'current-admin-id';
      const result = await suspendCompany(companyId, adminId);
      
      if (result.success) {
        toast.success("Company suspended!");
        loadCompaniesData(); // Refresh data
      } else {
        toast.error(`Failed to suspend company: ${result.error}`);
      }
    } catch (error) {
      console.error('Error suspending company:', error);
      toast.error('Failed to suspend company');
    }
  };

  const handleUpdateCompany = async (company: Company) => {
    try {
      const result = await updateCompany(company);
      
      if (result.success) {
        toast.success("Company updated!");
        loadCompaniesData(); // Refresh data
      } else {
        toast.error(`Failed to update company: ${result.error}`);
      }
    } catch (error) {
      console.error('Error updating company:', error);
      toast.error('Failed to update company');
    }
  };

  const handleAddCompany = async (companyData: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const result = await createCompany(companyData);
      
      if (result.success) {
        toast.success("Company created successfully!");
        loadCompaniesData(); // Refresh data
      } else {
        toast.error(`Failed to create company: ${result.error}`);
      }
    } catch (error) {
      console.error('Error creating company:', error);
      toast.error('Failed to create company');
    }
  };  

  const handleConnectCompany = async (existingCompanyId: string, applicantData: any) => {
    try {
      // In a real implementation, this would call an API to connect the companies
      console.log('Connecting company:', existingCompanyId, 'with applicant:', applicantData);
      
      // For now, just approve the existing company and set status to 'connected'
      const result = await updateCompany({
        ...companies.find(c => c.id === existingCompanyId)!,
        status: 'connected'
      });
      
      if (result.success) {
        toast.success("Company connected successfully!");
        loadCompaniesData(); // Refresh data
      } else {
        toast.error(`Failed to connect company: ${result.error}`);
      }
    } catch (error) {
      console.error('Error connecting company:', error);
      toast.error('Failed to connect company');
    }
  };

  const handleCreateAdminDeal = (dealData: Omit<AdminDeal, 'id'>) => {
    // In a real implementation, this would call an API to create the deal
    const newDeal: AdminDeal = {
      ...dealData,
      id: `admin-deal-${Date.now()}` // Generate a temporary ID
    };
    
    setMockAdminDeals(prev => [...prev, newDeal]);
    toast.success("Deal created successfully!");
  };

  const handleEditAdminDeal = (deal: AdminDeal) => {
    setMockAdminDeals(prev => prev.map(d => d.id === deal.id ? deal : d));
    toast.success("Deal updated successfully!");
  };

  const handleDeleteAdminDeal = (dealId: string) => {
    setMockAdminDeals(prev => prev.filter(d => d.id !== dealId));
    toast.success("Deal deleted successfully!");
  };

  const handleApproveBrokerDeal = (dealId: string) => {
    setBrokerDeals(prev => prev.map(deal => 
      deal.id === dealId 
        ? { ...deal, status: 'approved' }
        : deal
    ));
    toast.success("Broker deal approved and moved to live!");
  };

  const handleRejectBrokerDeal = (dealId: string) => {
    setBrokerDeals(prev => prev.map(deal => 
      deal.id === dealId 
        ? { ...deal, status: 'rejected' }
        : deal
    ));
    toast.success("Broker deal rejected!");
  };

  const handleEditBrokerDeal = (deal: BrokerDeal) => {
    setBrokerDeals(prev => prev.map(d => d.id === deal.id ? deal : d));
    toast.success("Broker deal updated successfully!");
  };

  const renderPageContent = () => {
    switch (currentPage) {
      case 'companies':
        return (
          <CompaniesManagerImproved
            companies={companies}
            brokerDeals={brokerDeals}
            onApproveCompany={handleApproveCompany}
            onRejectCompany={handleRejectCompany}
            onSuspendCompany={handleSuspendCompany}
            onUpdateCompany={handleUpdateCompany}
            onAddCompany={handleAddCompany}
            onConnectCompany={handleConnectCompany}
            isLoading={isLoading}
            onRefresh={loadCompaniesData}
          />
        );
      
      case 'analytics':
        return <UnifiedAnalyticsDashboard deals={mockAdminDeals} firms={mockFirms} />; // Added this case
      
      case 'unified-analytics':
        return <UnifiedAnalyticsDashboard />; // Added this case

      case 'deals':
        return (
          <UnifiedDealsManagerImproved
            adminDeals={mockAdminDeals}
            brokerDeals={brokerDeals}
            companies={companies}
            onCreateAdminDeal={handleCreateAdminDeal}
            onEditAdminDeal={handleEditAdminDeal}
            onDeleteAdminDeal={handleDeleteAdminDeal}
            onApproveBrokerDeal={handleApproveBrokerDeal}
            onRejectBrokerDeal={handleRejectBrokerDeal}
            onEditBrokerDeal={handleEditBrokerDeal}
          />
        );
      
      case 'users':
        return (
          <UsersManager
            users={mockUsers}
            onUpdateUser={() => toast.success("User updated!")}
            onSuspendUser={() => toast.success("User suspended!")}
          />
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
        return <EmailManagement deals={mockAdminDeals.map(deal => ({
          id: deal.id,
          title: deal.title,
          description: `${deal.discountPercentage}% off ${deal.category} deals`,
          discount: `${deal.discountPercentage}% OFF`,
          category: deal.category as any,
          merchant: 'Admin Deal',
          validUntil: new Date(deal.endDate).toLocaleDateString(),
          startDate: deal.startDate,
          endDate: deal.endDate,
          terms: 'Admin created deal',
          code: deal.couponCode,
          isClaimed: false,
          affiliateLink: deal.affiliateLink,
          logoUrl: 'https://images.unsplash.com/photo-1642310290564-30033ff60334?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wYW55JTIwbG9nbyUyMHByb2Zlc3Npb25hbCUyMGZpbmFuY2V8ZW58MXx8fHwxNzU2NTQ2Nzg0fDA&ixlib=rb-4.0&q=80&w=1080',
          hasVerificationBadge: deal.hasVerificationBadge
        }))} />;
      case 'settings':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">System Settings</h2>
              <p className="text-slate-600 dark:text-slate-400">Advanced system configuration and database debugging</p>
            </div>
            
            {/* Database Debugger */}
            <DatabaseDebugger />
            
            <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/30 shadow-lg p-6">
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/50 dark:to-blue-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="w-8 h-8 text-blue-500 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Additional Settings</h3>
                <p className="text-slate-600 dark:text-slate-400">More configuration options will be available here.</p>
              </div>
            </div>
          </div>
        );
      
      default:
        return <UnifiedAnalyticsDashboard deals={mockAdminDeals} firms={mockFirms} />;
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
                    Deal Management Portal
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Container */}
          <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/30 shadow-lg">
            <div className="p-6 lg:p-8">
              {renderPageContent()}
            </div>
          </div>
        </div>
      </div>

      <Toaster />
    </div>
  );
}

export default function AdminAppProduction({ onBackToUser }: AdminAppProps) {
  return (
    <StringProvider>
      <AdminContent onBackToUser={onBackToUser} />
    </StringProvider>
  );
}