import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Separator } from "./ui/separator";
import { Card, CardContent } from "./ui/card";
import { toast } from "sonner@2.0.3";
import { Target, Mail, Smartphone, User as UserIcon, ArrowLeft, CheckCircle2, Facebook, Smartphone as PhoneIcon, MessageSquare, Bell } from "lucide-react";
import { LoginMethod, User } from "./types";
import { SubscriptionPreferences } from "./SubscriptionPreferences";
import { supabase } from "../lib/supabase";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
}

export function LoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<LoginMethod | null>(null);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [gdprAccepted, setGdprAccepted] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSocialLogin = async (method: LoginMethod) => {
    if (method === 'email') {
      setSelectedMethod(method);
      return;
    }

    setIsLoading(true);
    
    try {
      let provider: 'google' | 'facebook' | 'apple';
      
      switch (method) {
        case 'google':
          provider = 'google';
          break;
        case 'facebook':
          provider = 'facebook';
          break;
        case 'apple':
          provider = 'apple';
          break;
        default:
          throw new Error('Unsupported provider');
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        throw error;
      }

      // The OAuth flow will redirect the user away from this page
      // When they return, the auth state change will be handled by the App component
      toast.success(`Redirecting to ${provider} login...`);
      
    } catch (error: any) {
      console.error('Social login error:', error);
      toast.error(`Failed to login with ${method}: ${error.message}`);
      
      // Fallback to mock login if social login fails
      toast.info("Using demo mode for now");
      setSelectedMethod(method);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedMethod) {
      toast.error("Please select a login method");
      return;
    }

    if (!phoneNumber.trim()) {
      toast.error("Phone number is required");
      return;
    }

    if (!termsAccepted) {
      toast.error("Please accept the Terms & Conditions");
      return;
    }

    if (!gdprAccepted) {
      toast.error("Please accept the GDPR consent");
      return;
    }

    if (!marketingConsent) {
      toast.error("Please accept marketing communications consent");
      return;
    }

    if (selectedMethod === 'email' && !email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (selectedMethod === 'email' && !name.trim()) {
      toast.error("Name is required");
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        loginMethod: selectedMethod,
        name: selectedMethod === 'email' ? name.trim() : undefined,
        phoneNumber: phoneNumber.trim(),
        email: selectedMethod === 'email' ? email.trim() : undefined,
        joinedAt: new Date().toISOString(),
        consents: {
          termsAccepted: termsAccepted,
          gdprAccepted: gdprAccepted,
          marketingConsent: marketingConsent,
          emailMarketing: marketingConsent,
          smsMarketing: marketingConsent,
          whatsappMarketing: marketingConsent,
          pushNotifications: marketingConsent,
          consentDate: new Date().toISOString()
        },
        notificationPreferences: {
          smsNotifications: marketingConsent, // Default to same as marketing consent
          whatsappNotifications: marketingConsent, // Default to same as marketing consent  
          updatedAt: new Date().toISOString()
        }
      };

      onLogin(newUser);
      setIsLoading(false);
      toast.success("Welcome to KOOCAO!");
      onClose();
    }, 1500);
  };

  const handleBack = () => {
    setSelectedMethod(null);
    setName("");
    setPhoneNumber("");
    setEmail("");
    setTermsAccepted(false);
    setGdprAccepted(false);
    setMarketingConsent(false);
  };

  const getSocialIcon = (method: LoginMethod) => {
    switch (method) {
      case 'facebook':
        return <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">f</div>;
      case 'google':
        return <div className="w-5 h-5 bg-white border border-gray-300 rounded flex items-center justify-center">
          <svg className="w-3 h-3" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        </div>;
      case 'apple':
        return <div className="w-5 h-5 bg-black rounded flex items-center justify-center text-white">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
        </div>;
      case 'email':
        return <Mail className="w-5 h-5 text-gray-600" />;
    }
  };

  const getSocialLabel = (method: LoginMethod) => {
    switch (method) {
      case 'facebook':
        return 'Continue with Facebook';
      case 'google':
        return 'Continue with Google';
      case 'apple':
        return 'Continue with Apple';
      case 'email':
        return 'Continue with Email';
    }
  };

  const renderMethodSelection = () => (
    <div className="space-y-8">
      {/* Modern Header with Gradient */}
      <div className="text-center">
        <div className="relative mb-6">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25">
            <Target className="w-8 h-8 text-white" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-background">
            <CheckCircle2 className="w-3 h-3 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to KOOCAO</h2>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
          Get instant access to exclusive deals from prop firms and brokers. We find the offers, you claim the savings.
        </p>
      </div>

      {/* Modern Login Options */}
      <div className="space-y-3">
        {(['facebook', 'google', 'apple', 'email'] as LoginMethod[]).map((method) => (
          <Button
            key={method}
            variant="outline"
            className="w-full h-12 justify-start gap-4 text-sm font-medium border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 group"
            onClick={() => handleSocialLogin(method)}
          >
            <div className="flex-shrink-0">
              {getSocialIcon(method)}
            </div>
            <span className="flex-1 text-left">{getSocialLabel(method)}</span>
          </Button>
        ))}
      </div>

      {/* Trust Indicators */}
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>100% Free</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Secure</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>No Spam</span>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-xs text-muted-foreground leading-relaxed">
            By continuing, you agree to our{" "}
            <a href="#" className="text-primary hover:underline font-medium">Terms & Conditions</a>
            {" "}and{" "}
            <a href="#" className="text-primary hover:underline font-medium">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );

  const renderDetailsForm = () => (
    <div className="space-y-6">
      {/* Modern Header with Back Button */}
      <div className="text-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="absolute left-4 top-4 flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            {getSocialIcon(selectedMethod!)}
          </div>
          <h3 className="text-xl font-bold text-foreground">Complete Setup</h3>
        </div>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Just a few quick details to get you started with KOOCAO
        </p>
      </div>

      {/* Modern Form Card */}
      <Card className="border-2 border-border/50">
        <CardContent className="p-6 space-y-4">
          {selectedMethod === 'email' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2 font-medium">
                  <UserIcon className="w-4 h-4 text-primary" />
                  Full Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 border-2 focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 font-medium">
                  <Mail className="w-4 h-4 text-primary" />
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 border-2 focus:border-primary"
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2 font-medium">
              <PhoneIcon className="w-4 h-4 text-primary" />
              Phone Number *
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="h-11 border-2 focus:border-primary"
            />
          </div>
        </CardContent>
      </Card>

      {/* Modern Checkboxes */}
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg border">
          <Checkbox
            id="terms"
            checked={termsAccepted}
            onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
            className="mt-0.5"
          />
          <Label htmlFor="terms" className="text-sm leading-relaxed font-medium">
            I agree to the{" "}
            <a href="#" className="text-primary hover:underline font-semibold">
              Terms & Conditions
            </a>
            {" "}*
          </Label>
        </div>

        <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg border">
          <Checkbox
            id="gdpr"
            checked={gdprAccepted}
            onCheckedChange={(checked) => setGdprAccepted(checked as boolean)}
            className="mt-0.5"
          />
          <Label htmlFor="gdpr" className="text-sm leading-relaxed font-medium">
            I consent to the processing of my personal data in accordance with the{" "}
            <a href="#" className="text-primary hover:underline font-semibold">
              Privacy Policy
            </a>
            {" "}*
          </Label>
        </div>

        <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700/30">
          <Checkbox
            id="marketing"
            checked={marketingConsent}
            onCheckedChange={(checked) => setMarketingConsent(checked as boolean)}
            className="mt-0.5"
          />
          <div className="space-y-2">
            <Label htmlFor="marketing" className="text-sm leading-relaxed font-medium flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Bell className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                <MessageSquare className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              </div>
              Marketing Communications *
            </Label>
            <p className="text-xs text-muted-foreground leading-relaxed">
              I agree to receive marketing communications from KOOCAO including:
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 ml-4">
              <li>• <strong>Email</strong> newsletters and deal alerts</li>
              <li>• <strong>SMS</strong> urgent deal notifications and updates</li>
              <li>• <strong>WhatsApp</strong> exclusive deals and account updates</li>
              <li>• <strong>Push notifications</strong> and promotional materials</li>
            </ul>
            <p className="text-xs text-muted-foreground italic">
              You can unsubscribe or change preferences anytime in Settings.
            </p>
          </div>
        </div>
      </div>

      {/* Modern Submit Button */}
      <Button
        className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg shadow-primary/25 transition-all duration-200"
        onClick={handleSubmit}
        disabled={isLoading || !termsAccepted || !gdprAccepted || !marketingConsent}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            Creating Account...
          </div>
        ) : (
          "Complete Registration"
        )}
      </Button>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-w-[95vw] p-0 gap-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>
            {selectedMethod ? "Complete Registration" : "Sign In"}
          </DialogTitle>
          <DialogDescription>
            {selectedMethod ? "Complete your account setup" : "Choose your preferred sign-in method"}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 relative">
          {selectedMethod ? renderDetailsForm() : renderMethodSelection()}
        </div>
      </DialogContent>
    </Dialog>
  );
}