import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Target, Bookmark, Heart, CheckCircle, ArrowLeft, Search, FolderOpen, Shield } from "lucide-react";

interface WhatIsReduzedProps {
  onLoginRequired: () => void;
  onNavigateToHome: () => void;
  onBack: () => void;
}

export function WhatIsReduzed({ onLoginRequired, onNavigateToHome, onBack }: WhatIsReduzedProps) {
  return (
    <div className="w-full max-w-md mx-auto px-4 py-6">
      {/* Enhanced Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4 leading-tight">
          What is COOPUNG?
        </h1>
      </div>

      {/* Enhanced Benefits */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl border border-white/40 dark:border-slate-700/40 shadow-2xl p-8 mb-8">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6 text-center">
           Why Traders Choose COOPUNG
         </h3>
        <div className="space-y-5">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div>
              <div className="font-medium text-slate-900 dark:text-slate-100 mb-1">
                Find the best deals across all categories
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Compare offers from top propfirms and brokers
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            </div>
            <div>
              <div className="font-medium text-slate-900 dark:text-slate-100 mb-1">
                Never miss valuable opportunities
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Get notified when new deals match your preferences
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            </div>
            <div>
              <div className="font-medium text-slate-900 dark:text-slate-100 mb-1">
                Save deals for later in your free wallet
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Organize and track your favorite offers easily
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Categories */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-700/30 shadow-xl p-8 mb-8">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-6 text-center text-lg">
          What We Cover
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/80 dark:bg-slate-700/50 backdrop-blur-sm rounded-2xl p-4 text-center shadow-md border border-white/50 dark:border-slate-600/30">
            <div className="font-semibold text-slate-900 dark:text-slate-100 mb-2">CFD</div>
          </div>
          
          <div className="bg-white/80 dark:bg-slate-700/50 backdrop-blur-sm rounded-2xl p-4 text-center shadow-md border border-white/50 dark:border-slate-600/30">
            <div className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Futures</div>
          </div>
          
          <div className="bg-white/80 dark:bg-slate-700/50 backdrop-blur-sm rounded-2xl p-4 text-center shadow-md border border-white/50 dark:border-slate-600/30">
            <div className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Crypto</div>
          </div>
          
          <div className="bg-white/80 dark:bg-slate-700/50 backdrop-blur-sm rounded-2xl p-4 text-center shadow-md border border-white/50 dark:border-slate-600/30">
            <div className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Brokers</div>
          </div>
        </div>
      </div>

      {/* Enhanced Call to Action */}
      <div className="space-y-4">
        <Button
          onClick={onNavigateToHome}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border-0"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            Start Finding Deals
          </div>
        </Button>
        
        <Button
          onClick={onBack}
          variant="ghost"
          className="w-full text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 py-3 rounded-xl transition-all duration-200"
        >
          ← Back to Home
        </Button>
      </div>
    </div>
  );
}