import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner@2.0.3';
import { User as UserType, AppPage, Coupon } from '../components/types';

export function useAuth() {
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [postLoginDestination, setPostLoginDestination] = useState<AppPage | null>(null);

  // Listen for auth state changes
  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const newUser = convertSupabaseUserToUserType(session.user);
          setUser(newUser);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setIsAuthLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (event === 'SIGNED_IN' && session?.user) {
          const newUser = convertSupabaseUserToUserType(session.user);
          setUser(newUser);
          setIsLoginModalOpen(false);
          toast.success(`Welcome to KOOCAO, ${newUser.name}!`);
          
          // Handle post-login navigation
          if (postLoginDestination) {
            if (postLoginDestination === 'broker-register') {
              toast.success('Now you can register your company!');
            }
            // Return destination for parent component to handle
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setPostLoginDestination(null);
          toast.success("Logged out successfully");
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
      } finally {
        setIsAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [postLoginDestination]);

  const convertSupabaseUserToUserType = (supabaseUser: any): UserType => ({
    id: supabaseUser.id,
    loginMethod: supabaseUser.app_metadata?.provider as 'google' | 'facebook' | 'apple' || 'email',
    name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0],
    email: supabaseUser.email,
    phoneNumber: supabaseUser.phone,
    joinedAt: supabaseUser.created_at,
    consents: {
      termsAccepted: true,
      gdprAccepted: true,
      marketingConsent: true,
      emailMarketing: true,
      smsMarketing: true,
      whatsappMarketing: true,
      pushNotifications: true,
      consentDate: new Date().toISOString()
    },
    notificationPreferences: {
      smsNotifications: true,
      whatsappNotifications: true,
      updatedAt: new Date().toISOString()
    }
  });

  const handleLogin = (newUser: UserType) => {
    setUser(newUser);
    setIsLoginModalOpen(false);
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        toast.error('Failed to logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  const handleLoginRequired = () => {
    setIsLoginModalOpen(true);
  };

  const requireAuth = (page: AppPage) => {
    const protectedPages = ['profile', 'my-deals', 'preferences', 'broker-register', 'broker-dashboard'];
    if (protectedPages.includes(page) && !user) {
      if (page === 'broker-register') {
        setPostLoginDestination(page);
      }
      setIsLoginModalOpen(true);
      return false;
    }
    return true;
  };

  return {
    user,
    isAuthLoading,
    isLoginModalOpen,
    postLoginDestination,
    setIsLoginModalOpen,
    setPostLoginDestination,
    handleLogin,
    handleLogout,
    handleLoginRequired,
    requireAuth
  };
}