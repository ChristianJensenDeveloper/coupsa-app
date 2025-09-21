import { useState } from "react";
import { AdminSidebar, AdminPage } from "./components/AdminSidebar";
import { Button } from "./components/ui/button";
import { ArrowLeft } from "lucide-react";

interface AdminAppTestProps {
  onBackToUser?: () => void;
}

export default function AdminAppTest({ onBackToUser }: AdminAppTestProps) {
  const [currentPage, setCurrentPage] = useState<AdminPage>('dashboard');

  console.log('🟢 TEST - Current page:', currentPage);

  const handlePageChange = (page: AdminPage) => {
    console.log('🟢 TEST - Page change requested:', page);
    setCurrentPage(page);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'companies':
        return (
          <div style={{ backgroundColor: 'green', color: 'white', padding: '40px', borderRadius: '10px' }}>
            <h1>✅ COMPANIES PAGE WORKING!</h1>
            <p>Current page: {currentPage}</p>
            <p>Time: {new Date().toLocaleTimeString()}</p>
          </div>
        );
      case 'dashboard':
        return (
          <div style={{ backgroundColor: 'blue', color: 'white', padding: '40px', borderRadius: '10px' }}>
            <h1>📊 DASHBOARD PAGE</h1>
            <p>Current page: {currentPage}</p>
            <p>Time: {new Date().toLocaleTimeString()}</p>
          </div>
        );
      case 'users':
        return (
          <div style={{ backgroundColor: 'purple', color: 'white', padding: '40px', borderRadius: '10px' }}>
            <h1>👥 USERS PAGE</h1>
            <p>Current page: {currentPage}</p>
            <p>Time: {new Date().toLocaleTimeString()}</p>
          </div>
        );
      default:
        return (
          <div style={{ backgroundColor: 'gray', color: 'white', padding: '40px', borderRadius: '10px' }}>
            <h1>❓ DEFAULT PAGE</h1>
            <p>Current page: {currentPage}</p>
            <p>Time: {new Date().toLocaleTimeString()}</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 flex">
      {/* DEBUG OVERLAY */}
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        backgroundColor: 'orange', 
        color: 'white', 
        padding: '10px', 
        zIndex: 9999,
        fontSize: '16px',
        fontWeight: 'bold',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>🧪 TEST MODE - Current Page = "{currentPage}" | Time: {new Date().toLocaleTimeString()}</span>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => handlePageChange('companies')}
            style={{ 
              backgroundColor: 'white', 
              color: 'orange', 
              padding: '5px 10px', 
              border: 'none', 
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            TEST COMPANIES
          </button>
          <button 
            onClick={() => handlePageChange('users')}
            style={{ 
              backgroundColor: 'white', 
              color: 'orange', 
              padding: '5px 10px', 
              border: 'none', 
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            TEST USERS
          </button>
          <button 
            onClick={() => handlePageChange('dashboard')}
            style={{ 
              backgroundColor: 'white', 
              color: 'orange', 
              padding: '5px 10px', 
              border: 'none', 
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            TEST DASHBOARD
          </button>
        </div>
      </div>
      
      {/* Sidebar */}
      <AdminSidebar currentPage={currentPage} onPageChange={handlePageChange} />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8" style={{ marginTop: '60px' }}>
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
          
          {/* Content Container */}
          <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/30 shadow-lg">
            <div className="p-6 lg:p-8">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}