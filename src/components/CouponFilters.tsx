import { MiniCategories } from "./MiniCategories";
import { CouponCategory } from "./types";

interface CouponFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: CouponCategory;
  onCategoryChange: (category: CouponCategory) => void;
  isAuthenticated: boolean;
  onLoginRequired: () => void;
}

export function CouponFilters({ 
  searchQuery, 
  onSearchChange, 
  selectedCategory, 
  onCategoryChange,
  isAuthenticated,
  onLoginRequired
}: CouponFiltersProps) {
  return (
    <div className="relative z-10">
      <MiniCategories
        selectedCategory={selectedCategory}
        onCategoryChange={onCategoryChange}
        isAuthenticated={isAuthenticated}
        onLoginRequired={onLoginRequired}
      />
    </div>
  );
}