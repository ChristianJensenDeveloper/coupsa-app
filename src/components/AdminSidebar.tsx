import { cn } from "./ui/utils";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { 
  LayoutDashboard, 
  Building2, 
  Ticket, 
  Users, 
  DollarSign,
  Shield, 
  FileText, 
  Bell, 
  Settings,
  Package2,
  Languages,
  BarChart3,
  MessageCircle,
  Mail,
  Trophy
} from "lucide-react";

export type AdminPage = 'dashboard' | 'analytics' | 'companies' | 'deals' | 'users' | 'email-management' | 'giveaways' | 'chat-support' | 'revenue' | 'compliance' | 'gdpr' | 'notifications' | 'languages' | 'language-setup' | 'tracking' | 'settings';

interface AdminSidebarProps {
  currentPage: AdminPage;
  onPageChange: (page: AdminPage) => void;
}

const menuItems = [
  { id: 'dashboard' as AdminPage, label: 'Dashboard', icon: LayoutDashboard, description: 'Overview of platform performance and key metrics' },
  { id: 'analytics' as AdminPage, label: 'Analytics', icon: BarChart3, description: 'Detailed user behavior and business analytics' },
  { id: 'companies' as AdminPage, label: 'Companies', icon: Building2, description: 'Manage prop firms, brokers, and trading companies' },
  { id: 'deals' as AdminPage, label: 'Deals', icon: Ticket, description: 'Manage all deals and offers' },
  { id: 'users' as AdminPage, label: 'Users', icon: Users, description: 'View and manage user accounts' },
  { id: 'email-management' as AdminPage, label: 'Email Campaigns', icon: Mail, description: 'Manage weekly email templates and automation' },
  { id: 'giveaways' as AdminPage, label: 'Giveaways', icon: Trophy, description: 'Create and manage trading giveaways and competitions' },
  { id: 'chat-support' as AdminPage, label: 'Chat Support', icon: MessageCircle, description: 'Manage customer support conversations' },
  { id: 'revenue' as AdminPage, label: 'Revenue', icon: DollarSign, description: 'Track affiliate earnings and commission rates' },
  { id: 'compliance' as AdminPage, label: 'Compliance', icon: Shield, description: 'Control which regions can see specific offers' },
  { id: 'gdpr' as AdminPage, label: 'GDPR', icon: FileText, description: 'Handle user data requests and manage consent records' },
  { id: 'notifications' as AdminPage, label: 'Notifications', icon: Bell, description: 'Manage system notifications and alerts' },
  { id: 'language-setup' as AdminPage, label: 'Language Setup', icon: Languages, description: 'Choose which languages KOOCAO will support' },
  { id: 'languages' as AdminPage, label: 'Languages (Advanced)', icon: Languages, description: 'Full language management and translations' },
  { id: 'tracking' as AdminPage, label: 'Tracking & Analytics', icon: BarChart3, description: 'Manage tracking codes for analytics platforms' },
  { id: 'settings' as AdminPage, label: 'Settings', icon: Settings, description: 'System configuration and preferences' },
];

export function AdminSidebar({ currentPage, onPageChange }: AdminSidebarProps) {
  return (
    <TooltipProvider>
      <div className="w-64 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-r border-white/20 dark:border-slate-700/30 h-full flex flex-col shadow-lg">
        {/* Logo */}
        <div className="p-6 border-b border-white/20 dark:border-slate-700/30">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center shadow-md">
                <Package2 className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-blue-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent tracking-tight">
                KOOCAO
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 -mt-0.5 font-medium">
                Admin Portal
              </p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-3 h-11 rounded-xl transition-all duration-200",
                        isActive 
                          ? "bg-blue-500 text-white hover:bg-blue-600 shadow-lg" 
                          : "hover:bg-white/50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300"
                      )}
                      onClick={() => onPageChange(item.id)}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{item.label}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <p>{item.description}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </nav>
        
        {/* Footer */}
        <div className="p-4 border-t border-white/20 dark:border-slate-700/30">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-3">
            <div className="flex items-center justify-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="font-medium">System Online</span>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}