import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Target, Menu, ArrowLeft, User, Bookmark, Settings, MessageCircle, HelpCircle, Zap, Shield, Trophy, Database, Building2, Plus, Palette } from "lucide-react";
import reduzedLogo from 'figma:asset/a0b45ca8bac95969a7b8a0eeb3e84088a15a1fb9.png';
import { User as UserType } from "./types";

interface CompactHeaderProps {
  user: UserType | null;
  currentPage: string;
  savedDealsCount: number;
  totalDealsCount: number;
  onMenuItemClick: (page: string) => void;
  onBackToHome: () => void;
  onLoginRequired: () => void;
  onAdminMode: () => void;
  onNavigateToGiveaways?: () => void;
  hasCurrentDeal?: boolean;
  onTestSupabase?: () => void;
  onDatabaseDebug?: () => void;
}

export function CompactHeader({ 
  user, 
  currentPage, 
  savedDealsCount, 
  totalDealsCount,
  onMenuItemClick, 
  onBackToHome, 
  onLoginRequired, 
  onAdminMode,
  onNavigateToGiveaways,
  hasCurrentDeal,
  onTestSupabase,
  onDatabaseDebug
}: CompactHeaderProps) {
  return (
    <div className="mb-4">
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-700/30 shadow-lg px-4 py-3">
        {/* Main Header Row */}
        <div className="flex items-center justify-between">
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
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">C</span>
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-sm"></div>
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-blue-800 dark:from-white dark:via-blue-100 dark:to-blue-200 bg-clip-text text-transparent tracking-tight">
                   COUPSA
                 </h1>
                <div className="flex items-center gap-2 -mt-0.5">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Deal Finder for Traders
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {user && (
              <div className="flex items-center gap-2 mr-1">
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg border border-white/20">
                    <User className="w-4 h-4" />
                  </div>
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
                    COUPSA
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {totalDealsCount} trading deals found
                  </div>
                </div>
                
                <DropdownMenuItem onClick={() => onMenuItemClick('home')} className="rounded-lg">
                  <Target className="w-4 h-4 mr-2 text-blue-500 dark:text-blue-400" />
                  Browse Deals
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="bg-slate-200/50 dark:bg-slate-700/50" />
                
                {user ? (
                  <>
                    <DropdownMenuItem onClick={() => onMenuItemClick('profile')} className="rounded-lg">
                      <User className="w-4 h-4 mr-2 text-slate-600 dark:text-slate-400" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onMenuItemClick('my-deals')} className="rounded-lg">
                      <Bookmark className="w-4 h-4 mr-2 text-blue-500 dark:text-blue-400" />
                      My Saved Deals
                      {savedDealsCount > 0 && (
                        <Badge variant="secondary" className="ml-auto text-xs bg-blue-100 text-blue-500 dark:bg-blue-900/30 dark:text-blue-400">
                          {savedDealsCount}
                        </Badge>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onMenuItemClick('preferences')} className="rounded-lg">
                      <Settings className="w-4 h-4 mr-2 text-slate-600 dark:text-slate-400" />
                      Preferences
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-200/50 dark:bg-slate-700/50" />
                    <DropdownMenuItem onClick={onAdminMode} className="rounded-lg">
                      <Shield className="w-4 h-4 mr-2 text-slate-600 dark:text-slate-400" />
                      Admin Panel
                    </DropdownMenuItem>
                    {onTestSupabase && (
                      <DropdownMenuItem onClick={onTestSupabase} className="rounded-lg">
                        <Database className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
                        Test Supabase
                        <Badge className="ml-auto text-xs bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                          DB
                        </Badge>
                      </DropdownMenuItem>
                    )}
                    {onDatabaseDebug && (
                      <DropdownMenuItem onClick={onDatabaseDebug} className="rounded-lg">
                        <Database className="w-4 h-4 mr-2 text-red-600 dark:text-red-400" />
                        Debug Database
                        <Badge className="ml-auto text-xs bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                          DB
                        </Badge>
                      </DropdownMenuItem>
                    )}
                  </>
                ) : (
                  <>
                    <DropdownMenuItem onClick={onLoginRequired} className="rounded-lg">
                      <User className="w-4 h-4 mr-2 text-blue-500 dark:text-blue-400" />
                      Sign In to Save Deals
                      <Badge className="ml-auto text-xs bg-blue-100 text-blue-500 dark:bg-blue-900/30 dark:text-blue-400">
                        FREE
                      </Badge>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-200/50 dark:bg-slate-700/50" />
                  </>
                )}
                
                <DropdownMenuItem onClick={() => onMenuItemClick('giveaways')} className="rounded-lg">
                  <Trophy className="w-4 h-4 mr-2 text-amber-500 dark:text-amber-400" />
                  Giveaways
                  <Badge className="ml-auto text-xs bg-amber-100 text-amber-500 dark:bg-amber-900/30 dark:text-amber-400">
                    NEW
                  </Badge>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="bg-slate-200/50 dark:bg-slate-700/50" />
                
                {/* Broker/Company Section */}
                <div className="px-3 py-1">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    For Companies
                  </div>
                </div>
                <DropdownMenuItem onClick={() => onMenuItemClick('broker-register')} className="rounded-lg">
                  <Building2 className="w-4 h-4 mr-2 text-purple-500 dark:text-purple-400" />
                  Register Company
                  <Badge className="ml-auto text-xs bg-purple-100 text-purple-500 dark:bg-purple-900/30 dark:text-purple-400">
                    FREE
                  </Badge>
                </DropdownMenuItem>
                {user && (
                  <DropdownMenuItem onClick={() => onMenuItemClick('broker-dashboard')} className="rounded-lg">
                    <Plus className="w-4 h-4 mr-2 text-purple-500 dark:text-purple-400" />
                    Manage Deals
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator className="bg-slate-200/50 dark:bg-slate-700/50" />
                
                <DropdownMenuItem onClick={() => onMenuItemClick('what-is-coupsa')} className="rounded-lg">
                  <Target className="w-4 h-4 mr-2 text-slate-600 dark:text-slate-400" />
                  What is COUPSA
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onMenuItemClick('logo-ideas')} className="rounded-lg">
                  <Palette className="w-4 h-4 mr-2 text-purple-500 dark:text-purple-400" />
                  Logo Ideas
                  <Badge className="ml-auto text-xs bg-purple-100 text-purple-500 dark:bg-purple-900/30 dark:text-purple-400">
                    NEW
                  </Badge>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onMenuItemClick('contact')} className="rounded-lg">
                  <MessageCircle className="w-4 h-4 mr-2 text-slate-600 dark:text-slate-400" />
                  Support
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onMenuItemClick('faq')} className="rounded-lg">
                  <HelpCircle className="w-4 h-4 mr-2 text-slate-600 dark:text-slate-400" />
                  FAQ
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Compact Stats Row */}
        <div className="flex items-center justify-center gap-4 text-xs text-slate-600 dark:text-slate-400 mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span>Real-time</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            <span>Verified</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold text-blue-500 dark:text-blue-400">{totalDealsCount}</span>
            <span>deals found</span>
          </div>
          {hasCurrentDeal && (
            <button 
              onClick={() => {
                if (onNavigateToGiveaways) {
                  onNavigateToGiveaways();
                } else {
                  onLoginRequired();
                }
              }}
              className="flex items-center gap-1 text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 transition-colors cursor-pointer"
            >
              <Trophy className="w-3 h-3" />
              <span>Giveaways</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}