import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { CouponCategory } from "./types";

interface SimpleCategoriesProps {
  selectedCategory: CouponCategory;
  onCategoryChange: (category: CouponCategory) => void;
  isAuthenticated: boolean;
  onLoginRequired: () => void;
}

export function SimpleCategories({
  selectedCategory,
  onCategoryChange,
  isAuthenticated,
  onLoginRequired
}: SimpleCategoriesProps) {
  
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
      {/* Simple Category Pills */}
      <div className="flex justify-center gap-2 mb-3 overflow-x-auto pb-2">
        {categories.map((category) => {
          const isSelected = selectedCategory === category.name;
          
          return (
            <Button
              key={category.name}
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryClick(category.name)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 flex-shrink-0 whitespace-nowrap ${
                isSelected 
                  ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg' 
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <span className="flex items-center gap-2">
                {category.name}
                {category.count > 0 && (
                  <Badge 
                    variant={isSelected ? "secondary" : "default"} 
                    className={`text-xs ${
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

      {/* Coming Soon Preview */}
      {selectedCategory === 'All' && (
        <div className="text-center mb-3">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            Coming soon: Casino, Sports Betting & Lifestyle deals
          </p>
          <div className="flex justify-center gap-2">
            {['Casino', 'Sports', 'Travel', 'Fitness'].map((category) => (
              <Badge 
                key={category} 
                variant="outline" 
                className="text-xs opacity-60 border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400"
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}