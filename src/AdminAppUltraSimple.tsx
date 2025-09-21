import { useState } from "react";
import { AdminSidebar, AdminPage } from "./components/AdminSidebar";
import { CompaniesManagerSimple } from "./components/CompaniesManagerSimple";
import { StringProvider } from "./components/useStrings";
import { Button } from "./components/ui/button";
import { Toaster } from "./components/ui/sonner";
import { ArrowLeft } from "lucide-react";

interface AdminAppProps {
  onBackToUser?: () => void;
}

function AdminAppContent({ onBackToUser }: AdminAppProps) {
  const [currentPage, setCurrentPage] = useState<AdminPage>('dashboard');

  console.log("🔥 ULTRA SIMPLE - Current page is:", currentPage);

  const handlePageChange = (page: AdminPage) => {
    console.log("🔥 ULTRA SIMPLE - Page changing to:", page);
    setCurrentPage(page);
  };

  const renderContent = () => {
    console.log("🔥 ULTRA SIMPLE - Rendering content for page:", currentPage);
    
    if (currentPage === 'companies') {
      return (
        <CompaniesManagerSimple 
          companies={[]}
          brokerDeals={[]}
          onApproveCompany={() => {}}
          onRejectCompany={() => {}}
          onSuspendCompany={() => {}}
          onUpdateCompany={() => {}}
        />
      );
    }

    if (currentPage === 'analytics') {
      return (
        <div style={{ 
          backgroundColor: 'purple', 
          color: 'white', 
          padding: '50px', 
          fontSize: '30px',
          textAlign: 'center',
          borderRadius: '20px'
        }}>
          📊 ANALYTICS PAGE 📊
        </div>
      );
    }

    // Default dashboard
    return (
      <div style={{ 
        backgroundColor: 'orange', 
        color: 'white', 
        padding: '50px', 
        fontSize: '30px',
        textAlign: 'center',
        borderRadius: '20px'
      }}>
        🏠 DASHBOARD PAGE 🏠
        <br/>
        Current page: {currentPage}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20 flex">
      {/* Fixed debug bar */}
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        backgroundColor: 'black', 
        color: 'white', 
        padding: '15px', 
        zIndex: 9999,
        fontSize: '18px',
        fontWeight: 'bold',
        textAlign: 'center'
      }}>
        🔥 ULTRA SIMPLE DEBUG: Current Page = "{currentPage}"
      </div>

      {/* Sidebar */}
      <AdminSidebar currentPage={currentPage} onPageChange={handlePageChange} />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8" style={{ marginTop: '70px' }}>
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
          
          <div className="bg-white/50 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg p-8">
            {renderContent()}
          </div>
        </div>
      </div>

      <Toaster />
    </div>
  );
}

export default function AdminAppUltraSimple({ onBackToUser }: AdminAppProps) {
  return (
    <StringProvider>
      <AdminAppContent onBackToUser={onBackToUser} />
    </StringProvider>
  );
}