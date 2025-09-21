import { useState } from "react";
import { Company } from "./types";

interface CategoryValidationState {
  isDialogOpen: boolean;
  attemptedCategory: string | null;
  onProceedCallback: (() => void) | null;
}

export function useCategoryValidation() {
  const [validationState, setValidationState] = useState<CategoryValidationState>({
    isDialogOpen: false,
    attemptedCategory: null,
    onProceedCallback: null
  });

  const validateCategoryForDeal = (
    company: Company | null,
    selectedCategory: string,
    onProceed: () => void
  ): boolean => {
    // If no company or category is already registered, allow immediate proceed
    if (!company || company.categories.includes(selectedCategory as any)) {
      onProceed();
      return true;
    }

    // If category is not registered, show expansion dialog
    setValidationState({
      isDialogOpen: true,
      attemptedCategory: selectedCategory,
      onProceedCallback: onProceed
    });
    
    return false; // Indicates we need user interaction
  };

  const handleCategoryAdded = (updatedCompany: Company) => {
    // Company categories have been updated
    // The parent component should update its company state
    if (validationState.onProceedCallback) {
      validationState.onProceedCallback();
    }
    closeDialog();
  };

  const handleProceedAnyway = () => {
    // User chose to proceed without updating categories
    if (validationState.onProceedCallback) {
      validationState.onProceedCallback();
    }
    closeDialog();
  };

  const closeDialog = () => {
    setValidationState({
      isDialogOpen: false,
      attemptedCategory: null,
      onProceedCallback: null
    });
  };

  return {
    validationState,
    validateCategoryForDeal,
    handleCategoryAdded,
    handleProceedAnyway,
    closeDialog
  };
}