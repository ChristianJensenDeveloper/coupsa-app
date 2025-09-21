import { useState, useEffect } from 'react';
import { toast } from 'sonner@2.0.3';
import { Company, User as UserType } from '../components/types';

export function useCompanyManager(user: UserType | null) {
  const [userCompany, setUserCompany] = useState<Company | null>(null);

  // Clear company data when user logs out
  useEffect(() => {
    if (!user) {
      setUserCompany(null);
    }
  }, [user]);

  const handleRegisterSuccess = (company: Company, onNavigate: (page: any) => void) => {
    setUserCompany(company);
    onNavigate('broker-dashboard');
    toast.success('Company registration submitted for review!');
  };

  const handleClaimSubmitted = (claimData: any) => {
    console.log('Company access request submitted:', claimData);
    toast.success("Access request submitted! Our team will review and get back to you within 1-3 business days.");
  };

  const handleCompanyUpdated = (company: Company) => {
    setUserCompany(company);
  };

  return {
    userCompany,
    setUserCompany,
    handleRegisterSuccess,
    handleClaimSubmitted,
    handleCompanyUpdated
  };
}