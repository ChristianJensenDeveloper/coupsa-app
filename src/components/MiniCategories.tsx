import { Button } from "./ui/button";
import { CouponCategory } from "./types";
// Icons removed for cleaner mobile design

interface MiniCategoriesProps {
  selectedCategory: CouponCategory;
  onCategoryChange: (category: CouponCategory) => void;
  isAuthenticated: boolean;
  onLoginRequired: () => void;
}

export function MiniCategories({
  selectedCategory,
  onCategoryChange,
  isAuthenticated,
  onLoginRequired
}: MiniCategoriesProps) {
  
  const categories = [
    { 
      name: 'All' as CouponCategory, 
      color: 'default'
    },
    { 
      name: 'CFD' as CouponCategory, 
      color: 'blue'
    },
    { 
      name: 'Futures' as CouponCategory, 
      color: 'purple'
    },
    { 
      name: 'Crypto' as CouponCategory, 
      color: 'orange'
    },
    { 
      name: 'Brokers' as CouponCategory, 
      color: 'green'
    }
  ];

  const handleCategoryClick = (category: CouponCategory) => {
    // Handle Giveaways navigation - no login required
    if (category === 'Giveaways') {
      if (onNavigateToGiveaways) {
        onNavigateToGiveaways();
        return;
      }
    }
    
    // Handle other categories - require login for all except 'All'
    if (!isAuthenticated && category !== 'All') {
      onLoginRequired();
      return;
    }
    onCategoryChange(category);
  };

  return (
    <div className="w-full">
      {/* Categories without scrolling - fit all on screen */}
      <div className="flex gap-1.5">
        {categories.map((category) => {
          const isSelected = selectedCategory === category.name;
          const isAllCategory = category.name === 'All';
          
          return (
            <Button
              key={category.name}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategoryClick(category.name)}
              className={`
                h-8 text-xs font-semibold rounded-xl whitespace-nowrap overflow-hidden
                transition-all duration-200 ease-out
                ${isAllCategory ? 'px-3 flex-shrink-0' : 'px-1.5 flex-1'}
                ${isSelected 
                  ? 'bg-blue-500 hover:bg-blue-500 text-white border-blue-500 shadow-lg scale-[1.02]' 
                  : 'bg-white/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 border-slate-200/60 dark:border-slate-600/40 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-500 hover:scale-[1.01] hover:shadow-md'
                }
              `}
            >
              {category.name}
            </Button>
          );
        })}
      </div>
    </div>
  );
}