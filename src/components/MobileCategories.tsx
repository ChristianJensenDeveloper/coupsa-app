import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { CouponCategory } from "./types";

interface MobileCategoriesProps {
  selectedCategory: CouponCategory;
  onCategoryChange: (category: CouponCategory) => void;
  isAuthenticated: boolean;
  onLoginRequired: () => void;
}

export function MobileCategories({
  selectedCategory,
  onCategoryChange,
  isAuthenticated,
  onLoginRequired
}: MobileCategoriesProps) {
  
  const categories = [
    { name: 'All' as CouponCategory, count: 35 },
    { name: 'CFD Prop' as CouponCategory, count: 12 },
    { name: 'Futures Prop' as CouponCategory, count: 8 },
    { name: 'Broker Bonuses' as CouponCategory, count: 15 }
  ];

  const handleCategoryClick = (category: CouponCategory) => {
    if (!isAuthenticated && category !== 'All') {
      onLoginRequired();
      return;
    }
    onCategoryChange(category);
  };

  return (
    <div className="w-full">
      {/* Mobile-First Category Grid */}
      <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-center sm:gap-3 sm:overflow-x-auto sm:pb-2">
        {categories.map((category) => {
          const isSelected = selectedCategory === category.name;
          
          return (
            <Button
              key={category.name}
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryClick(category.name)}
              className={`rounded-xl px-3 py-2.5 font-medium transition-all duration-200 flex-shrink-0 whitespace-nowrap min-h-[44px] ${
                isSelected 
                  ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg' 
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <span className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                <span className="text-sm font-medium">{category.name}</span>
                {category.count > 0 && (
                  <Badge 
                    variant={isSelected ? "secondary" : "default"} 
                    className={`text-xs px-2 py-0.5 ${
                      isSelected 
                        ? 'bg-white/20 text-white border-0' 
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-0'
                    }`}
                  >
                    {category.count}
                  </Badge>
                )}
                {category.name === "CFD Prop" && category.count > 10 && (
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                )}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}