import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { CouponCategory } from "./types";
import { Sparkles, TrendingUp, Zap, Gift } from "lucide-react";

interface CompactCategoriesProps {
  selectedCategory: CouponCategory;
  onCategoryChange: (category: CouponCategory) => void;
  isAuthenticated: boolean;
  onLoginRequired: () => void;
}

export function CompactCategories({
  selectedCategory,
  onCategoryChange,
  isAuthenticated,
  onLoginRequired
}: CompactCategoriesProps) {
  
  const categories = [
    { 
      name: 'All' as CouponCategory, 
      count: 35, 
      icon: Sparkles,
      color: 'slate'
    },
    { 
      name: 'CFD Prop' as CouponCategory, 
      count: 12, 
      icon: TrendingUp,
      color: 'blue'
    },
    { 
      name: 'Futures Prop' as CouponCategory, 
      count: 8, 
      icon: Zap,
      color: 'purple'
    },
    { 
      name: 'Broker Bonuses' as CouponCategory, 
      count: 15, 
      icon: Gift,
      color: 'green'
    }
  ];

  const handleCategoryClick = (category: CouponCategory) => {
    if (!isAuthenticated && category !== 'All') {
      onLoginRequired();
      return;
    }
    onCategoryChange(category);
  };

  const getColorClasses = (color: string, isSelected: boolean) => {
    if (isSelected) {
      switch (color) {
        case 'blue':
          return 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500';
        case 'purple':
          return 'bg-purple-500 hover:bg-purple-600 text-white border-purple-500';
        case 'green':
          return 'bg-green-500 hover:bg-green-600 text-white border-green-500';
        default:
          return 'bg-slate-600 hover:bg-slate-700 text-white border-slate-600';
      }
    } else {
      return 'bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const getBadgeClasses = (color: string, isSelected: boolean) => {
    if (isSelected) {
      return 'bg-white/20 text-white border-0';
    } else {
      switch (color) {
        case 'blue':
          return 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-0';
        case 'purple':
          return 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-0';
        case 'green':
          return 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-0';
        default:
          return 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border-0';
      }
    }
  };

  return (
    <div className="w-full">
      {/* Compact Horizontal Chip Layout */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {categories.map((category) => {
          const isSelected = selectedCategory === category.name;
          const IconComponent = category.icon;
          
          return (
            <Button
              key={category.name}
              variant="outline"
              size="sm"
              onClick={() => handleCategoryClick(category.name)}
              className={`relative flex-shrink-0 rounded-full px-4 py-2 h-auto transition-all duration-200 hover:scale-105 active:scale-95 ${getColorClasses(category.color, isSelected)}`}
            >
              <div className="flex items-center gap-2">
                <IconComponent className="w-4 h-4" />
                <span className="font-medium whitespace-nowrap">{category.name}</span>
                <Badge 
                  variant="secondary" 
                  className={`text-xs px-2 py-0.5 rounded-full ml-1 ${getBadgeClasses(category.color, isSelected)}`}
                >
                  {category.count}
                </Badge>
                
                {/* Hot indicator for popular categories */}
                {category.name === "CFD Prop" && category.count > 10 && (
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse ml-1"></div>
                )}
              </div>
            </Button>
          );
        })}
      </div>

      {/* Compact Save Feature Tip */}
      <div className="mt-3 text-center">
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="w-4 h-4 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center">
            <span className="text-pink-600 dark:text-pink-400 text-xs">💡</span>
          </div>
          <span>
            <strong>Tip:</strong> Save deals you like for later - no rush to claim immediately!
          </span>
        </div>
      </div>
    </div>
  );
}