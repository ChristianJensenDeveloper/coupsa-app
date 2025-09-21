import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Target, Menu, ArrowLeft, User, Bookmark, Settings, MessageCircle, HelpCircle, Zap, Shield } from "lucide-react";
import { User as UserType } from "./types";

interface SimpleHeaderProps {
  user: UserType | null;
  currentPage: string;
  savedDealsCount: number;
  totalDealsCount: number;
  onMenuItemClick: (page: string) => void;
  onBackToHome: () => void;
  onLoginRequired: () => void;
  onAdminMode: () => void;
}

export function SimpleHeader({ 
  user, 
  currentPage, 
  savedDealsCount, 
  totalDealsCount,
  onMenuItemClick, 
  onBackToHome, 
  onLoginRequired, 
  onAdminMode
}: SimpleHeaderProps) {
  return (
    <div className="mb-4">
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-700/30 shadow-lg px-4 py-4">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {currentPage !== 'home' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackToHome}
                className="rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-sm"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent tracking-tight">
                  REDUZED
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 -mt-1 font-medium">
                  AI Deal Finder
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {user && (
              <div className="flex items-center gap-2 mr-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              </div>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="relative rounded-xl border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 px-3 py-2">
                  <Menu className="w-4 h-4" />
                  {!user && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl border-0 shadow-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
                <div className="px-3 py-2 border-b border-slate-200/50 dark:border-slate-700/50">
                  <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                    REDUZED
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {totalDealsCount} deals available
                  </div>
                </div>
                
                <DropdownMenuItem onClick={() => onMenuItemClick('home')} className="rounded-lg">
                  <Target className="w-4 h-4 mr-2 text-blue-500" />
                  Browse Deals
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="bg-slate-200/50 dark:bg-slate-700/50" />
                
                {user ? (
                  <>
                    <DropdownMenuItem onClick={() => onMenuItemClick('profile')} className="rounded-lg">
                      <User className="w-4 h-4 mr-2 text-green-500" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onMenuItemClick('my-deals')} className="rounded-lg">
                      <Bookmark className="w-4 h-4 mr-2 text-purple-500" />
                      My Deals
                      {savedDealsCount > 0 && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {savedDealsCount}
                        </Badge>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onMenuItemClick('preferences')} className="rounded-lg">
                      <Settings className="w-4 h-4 mr-2 text-orange-500" />
                      Preferences
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-200/50 dark:bg-slate-700/50" />
                    <DropdownMenuItem onClick={onAdminMode} className="rounded-lg">
                      <Shield className="w-4 h-4 mr-2 text-indigo-500" />
                      Admin Panel
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem onClick={onLoginRequired} className="rounded-lg">
                      <User className="w-4 h-4 mr-2 text-green-500" />
                      Sign In
                      <Badge className="ml-auto text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                        Free
                      </Badge>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-200/50 dark:bg-slate-700/50" />
                  </>
                )}
                
                <DropdownMenuItem onClick={() => onMenuItemClick('contact')} className="rounded-lg">
                  <MessageCircle className="w-4 h-4 mr-2 text-emerald-500" />
                  Support
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onMenuItemClick('faq')} className="rounded-lg">
                  <HelpCircle className="w-4 h-4 mr-2 text-cyan-500" />
                  FAQ
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Value Proposition */}
        <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl px-4 py-3 border border-blue-100/50 dark:border-blue-800/30">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Find Exclusive Trading Deals
                </h2>
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs px-2 py-1 rounded-full border-0">
                  <Zap className="w-3 h-3 mr-1" />
                  LIVE
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Real-time tracking</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  <span>Verified only</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {totalDealsCount}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                deals found
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}