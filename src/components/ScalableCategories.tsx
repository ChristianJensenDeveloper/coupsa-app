import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "./ui/dropdown-menu";
import { ChevronDown, Zap, TrendingUp, Clock, Shield, Gamepad2, Car, Utensils, Dumbbell, Plane, ShoppingBag } from "lucide-react";
import { CouponCategory } from "./types";

// Category configuration for multi-vertical expansion
const categoryConfig = {
  "Trading": {
    icon: TrendingUp,
    color: "blue",
    categories: ["CFD Prop", "Futures Prop", "Broker Bonuses"] as CouponCategory[],
    description: "Trading challenges & bonuses",
    dealCounts: { "CFD Prop": 12, "Futures Prop": 8, "Broker Bonuses": 15 }
  },
  "Gaming": {
    icon: Gamepad2,
    color: "purple",
    categories: ["Casino", "Sports Betting", "Poker"] as CouponCategory[],
    description: "Gaming & betting offers",
    dealCounts: { "Casino": 0, "Sports Betting": 0, "Poker": 0 }
  },
  "Lifestyle": {
    icon: ShoppingBag,
    color: "green",
    categories: ["Travel", "Dining", "Fashion", "Fitness", "Tech"] as CouponCategory[],
    description: "Lifestyle & entertainment",
    dealCounts: { "Travel": 0, "Dining": 0, "Fashion": 0, "Fitness": 0, "Tech": 0 }
  }
};

interface ScalableCategoriesProps {
  selectedCategory: CouponCategory;
  onCategoryChange: (category: CouponCategory) => void;
  isAuthenticated: boolean;
  onLoginRequired: () => void;
  totalDealsCount: number;
}

export function ScalableCategories({
  selectedCategory,
  onCategoryChange,
  isAuthenticated,
  onLoginRequired,
  totalDealsCount
}: ScalableCategoriesProps) {
  const [showAllCategories, setShowAllCategories] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Get current category group
  const getCurrentGroup = () => {
    for (const [groupName, config] of Object.entries(categoryConfig)) {
      if (config.categories.includes(selectedCategory)) {
        return { groupName, config };
      }
    }
    return { groupName: "Trading", config: categoryConfig.Trading };
  };

  const { groupName: currentGroup, config: currentConfig } = getCurrentGroup();

  // Get active trading categories (categories with deals)
  const activeCategories = Object.entries(categoryConfig.Trading.dealCounts)
    .filter(([_, count]) => count > 0)
    .map(([category]) => category as CouponCategory);

  const handleCategoryClick = (category: CouponCategory) => {
    if (!isAuthenticated && category !== 'All') {
      onLoginRequired();
      return;
    }
    onCategoryChange(category);
  };

  const getColorClasses = (color: string, isSelected: boolean) => {
    const colorMap = {
      blue: {
        selected: "bg-blue-500 text-white shadow-lg",
        unselected: "hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
      },
      purple: {
        selected: "bg-purple-500 text-white shadow-lg",
        unselected: "hover:bg-purple-50 dark:hover:bg-purple-900/20 text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400"
      },
      green: {
        selected: "bg-green-500 text-white shadow-lg",
        unselected: "hover:bg-green-50 dark:hover:bg-green-900/20 text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400"
      }
    };
    return colorMap[color as keyof typeof colorMap][isSelected ? 'selected' : 'unselected'];
  };

  return (
    <div className="w-full">
      {/* Main Category Navigation */}
      <div className="flex items-center gap-2 mb-3">
        {/* All Categories Button */}
        <Button
          variant={selectedCategory === 'All' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleCategoryClick('All')}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
            selectedCategory === 'All' 
              ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-lg' 
              : 'hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'
          }`}
        >
          All
          <Badge variant="secondary" className="ml-2 text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {totalDealsCount}
          </Badge>
        </Button>

        {/* Active Trading Categories */}
        <div className="flex items-center gap-2 flex-1">
          <ScrollArea className="w-full">
            <div className="flex items-center gap-2 pb-1" ref={scrollRef}>
              {activeCategories.map((category) => {
                const dealCount = categoryConfig.Trading.dealCounts[category] || 0;
                const isSelected = selectedCategory === category;
                
                return (
                  <Button
                    key={category}
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleCategoryClick(category)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 flex-shrink-0 ${
                      isSelected 
                        ? getColorClasses('blue', true)
                        : `${getColorClasses('blue', false)} border-slate-200 dark:border-slate-700`
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {category}
                      {dealCount > 0 && (
                        <Badge 
                          variant={isSelected ? "secondary" : "default"} 
                          className={`text-xs ${
                            isSelected 
                              ? 'bg-white/20 text-white border-0' 
                              : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-0'
                          }`}
                        >
                          {dealCount}
                        </Badge>
                      )}
                      {category === "CFD Prop" && dealCount > 10 && (
                        <Zap className="w-3 h-3 text-yellow-400 animate-pulse" />
                      )}
                    </span>
                  </Button>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Coming Soon Categories Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-full px-3 py-2 border-dashed border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
            >
              <span className="text-sm">More</span>
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 rounded-xl border-0 shadow-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
            <DropdownMenuLabel className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Coming Soon
            </DropdownMenuLabel>
            
            {Object.entries(categoryConfig).slice(1).map(([groupName, config]) => (
              <div key={groupName}>
                <DropdownMenuItem className="rounded-lg opacity-60 cursor-not-allowed">
                  <config.icon className={`w-4 h-4 mr-3 text-${config.color}-500`} />
                  <div className="flex-1">
                    <div className="font-medium text-slate-700 dark:text-slate-300">
                      {groupName}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {config.description}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs border-slate-200 dark:border-slate-700 text-slate-500">
                    Soon
                  </Badge>
                </DropdownMenuItem>
                
                <div className="px-3 pb-2">
                  <div className="flex flex-wrap gap-1">
                    {config.categories.map((cat) => (
                      <Badge 
                        key={cat} 
                        variant="secondary" 
                        className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-0 opacity-60"
                      >
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            
            <DropdownMenuSeparator className="bg-slate-200/50 dark:bg-slate-700/50" />
            <DropdownMenuItem className="rounded-lg text-center justify-center text-blue-600 dark:text-blue-400 font-medium">
              <Clock className="w-4 h-4 mr-2" />
              Request Category
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Category Insights Bar */}
      {selectedCategory !== 'All' && (
        <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-lg px-3 py-2 border border-blue-100/50 dark:border-blue-800/20">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="text-slate-600 dark:text-slate-400">
                {selectedCategory} deals
              </span>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-green-500" />
                <span className="text-green-600 dark:text-green-400 font-medium">
                  Verified offers only
                </span>
              </div>
            </div>
            <div className="text-slate-500 dark:text-slate-400">
              Updated 2min ago
            </div>
          </div>
        </div>
      )}
    </div>
  );
}