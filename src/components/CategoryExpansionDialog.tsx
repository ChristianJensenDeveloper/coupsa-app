import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { AlertTriangle, Building2, CheckCircle, X } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { Company } from "./types";

interface CategoryExpansionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company;
  attemptedCategory: string;
  onCategoryAdded: (updatedCompany: Company) => void;
  onProceedAnyway: () => void;
}

export function CategoryExpansionDialog({
  isOpen,
  onClose,
  company,
  attemptedCategory,
  onCategoryAdded,
  onProceedAnyway
}: CategoryExpansionDialogProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [shouldUpdatePreferences, setShouldUpdatePreferences] = useState(true);

  const handleAddCategory = async () => {
    if (!shouldUpdatePreferences) {
      onProceedAnyway();
      return;
    }

    setIsUpdating(true);
    
    try {
      // Simulate API call to update company categories
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedCompany: Company = {
        ...company,
        categories: [...company.categories, attemptedCategory as any],
        updatedAt: new Date().toISOString()
      };
      
      onCategoryAdded(updatedCompany);
      toast.success(`Added ${attemptedCategory} to your business categories!`);
      onClose();
    } catch (error) {
      toast.error("Failed to update categories. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const getIcon = (category: string) => {
    switch (category) {
      case 'CFD': return "📈";
      case 'Futures': return "🔮";
      case 'Crypto': return "₿";
      case 'Brokers': return "🏦";
      case 'Casinos': return "🎰";
      default: return "📊";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md border-0 shadow-2xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden p-0">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 px-6 pt-6 pb-4 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Expand Your Business Categories?
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            You're creating a deal in <strong>{attemptedCategory}</strong>, but this category isn't in your current business profile.
          </DialogDescription>
        </div>
        
        {/* Current vs New Category Display */}
        <div className="px-6 py-4">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-3">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Your current categories:
              </p>
              <div className="flex flex-wrap gap-2">
                {company.categories.map(category => (
                  <Badge 
                    key={category} 
                    variant="outline" 
                    className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700"
                  >
                    {getIcon(category)} {category}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                New category you're adding a deal for:
              </p>
              <Badge 
                variant="outline" 
                className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700"
              >
                {getIcon(attemptedCategory)} {attemptedCategory} ✨
              </Badge>
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="px-6 pb-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <Checkbox
                id="update-preferences"
                checked={shouldUpdatePreferences}
                onCheckedChange={setShouldUpdatePreferences}
                className="mt-0.5"
              />
              <div className="flex-1">
                <label htmlFor="update-preferences" className="cursor-pointer text-sm font-medium text-slate-900 dark:text-slate-100">
                  Add {attemptedCategory} to my business categories
                </label>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  This helps us understand your business better and suggest relevant opportunities
                </p>
              </div>
            </div>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
              You can create deals in any category regardless of your choice here
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-6 space-y-3">
          <Button
            onClick={handleAddCategory}
            disabled={isUpdating}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] border-0"
          >
            {isUpdating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                {shouldUpdatePreferences ? 'Updating Profile...' : 'Creating Deal...'}
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                {shouldUpdatePreferences ? `Add ${attemptedCategory} & Continue` : 'Continue Without Adding'}
              </>
            )}
          </Button>
          
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full rounded-2xl border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 py-3"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>

        {/* Small disclaimer */}
        <div className="px-6 pb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-3">
            <div className="flex items-start gap-2">
              <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                <strong>Platform Insight:</strong> This helps KOOCAO understand which categories you're most active in, 
                allowing us to provide better insights and opportunities for your business.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}