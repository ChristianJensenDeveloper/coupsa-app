import { useState, useEffect } from "react";
import { Coupon, CouponCategory } from "./types";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Clock, ExternalLink, Copy, Trash2, ChevronDown, ChevronUp, Calendar, AlertCircle, Bookmark, Heart, Target, Filter, TrendingUp, Archive, Search, Star, Award, CheckCircle2, Zap, Timer, DollarSign, TrendingDown } from "lucide-react";
import { ShareButton } from "./ShareButton";
import { toast } from "sonner@2.0.3";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";

interface MyDealsProps {
  savedDeals: Coupon[];
  onClearExpired: () => void;
  onRemoveDeal?: (dealId: string) => void;
  userName?: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const calculateTimeRemaining = (endDate: string): TimeRemaining | null => {
  const end = new Date(endDate);
  const now = new Date();
  const difference = end.getTime() - now.getTime();

  if (difference <= 0) {
    return null;
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
};

const CountdownTimer = ({ endDate }: { endDate: string }) => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(
    calculateTimeRemaining(endDate)
  );

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = calculateTimeRemaining(endDate);
      setTimeRemaining(remaining);
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  if (!timeRemaining) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg">
        <AlertCircle className="w-3.5 h-3.5" />
        <span className="text-xs font-medium">EXPIRED</span>
      </div>
    );
  }

  const isUrgent = timeRemaining.days <= 3;

  return (
    <div className={`px-4 py-3 rounded-lg border ${
      isUrgent 
        ? 'bg-blue-50/50 dark:bg-blue-900/30 border-blue-200/50 dark:border-blue-800/30' 
        : 'bg-slate-50/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50'
    }`}>
      <div className="flex items-center gap-2 mb-2">
        <Clock className="w-4 h-4 text-slate-600 dark:text-slate-400" />
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Expires in</span>
      </div>
      
      {/* Full Countdown Display */}
      <div className="grid grid-cols-4 gap-3">
        {/* Days */}
        <div className="text-center">
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-none">
            {timeRemaining.days}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            {timeRemaining.days === 1 ? 'day' : 'days'}
          </div>
        </div>
        
        {/* Hours */}
        <div className="text-center">
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-none">
            {String(timeRemaining.hours).padStart(2, '0')}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            {timeRemaining.hours === 1 ? 'hour' : 'hours'}
          </div>
        </div>
        
        {/* Minutes */}
        <div className="text-center">
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-none">
            {String(timeRemaining.minutes).padStart(2, '0')}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            {timeRemaining.minutes === 1 ? 'min' : 'mins'}
          </div>
        </div>
        
        {/* Seconds */}
        <div className="text-center">
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-none">
            {String(timeRemaining.seconds).padStart(2, '0')}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            {timeRemaining.seconds === 1 ? 'sec' : 'secs'}
          </div>
        </div>
      </div>
    </div>
  );
};

const CompactDealCard = ({ 
  deal, 
  isExpired, 
  onRemove,
  index,
  userName
}: { 
  deal: Coupon; 
  isExpired: boolean;
  onRemove?: (dealId: string) => void;
  index: number;
  userName?: string;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [justCopied, setJustCopied] = useState(false);
  const [justOpened, setJustOpened] = useState(false);

  // Helper function to determine effective button configuration
  const getEffectiveButtonConfig = () => {
    const hasCode = deal.code && deal.code.trim() !== '';
    
    // If buttonConfig is explicitly set, use it (but validate it makes sense)
    if (deal.buttonConfig) {
      // Prevent 'code-only' when no code exists - fallback to 'claim-only'
      if (deal.buttonConfig === 'code-only' && !hasCode) {
        console.warn(`Deal ${deal.id}: 'code-only' config but no code provided. Fallback to 'claim-only'.`);
        return 'claim-only';
      }
      return deal.buttonConfig;
    }
    
    // Auto-configuration based on available data
    return hasCode ? 'both' : 'claim-only';
  };

  const handleCopyCode = async () => {
    const code = deal.code || 'N/A';
    try {
      await navigator.clipboard.writeText(code);
      setJustCopied(true);
      toast.success("Code copied! 🎉");
      setTimeout(() => setJustCopied(false), 2000);
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setJustCopied(true);
      toast.success("Code copied! 🎉");
      setTimeout(() => setJustCopied(false), 2000);
    }
  };

  const handleGoToOffer = () => {
    if (deal.affiliateLink) {
      setJustOpened(true);
      window.open(deal.affiliateLink, '_blank', 'noopener,noreferrer');
      toast.success("Opening deal! 🚀");
      setTimeout(() => setJustOpened(false), 2000);
    } else {
      toast.error("No offer link available");
    }
  };

  return (
    <div 
      className={`bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${isExpired ? 'opacity-60' : 'hover:shadow-lg'}`}
      style={{
        animationDelay: `${index * 50}ms`
      }}
    >
      {/* Clean Header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          {/* Logo & Company */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-sm flex-shrink-0">
              {deal.logoUrl ? (
                <ImageWithFallback
                  src={deal.logoUrl}
                  alt={`${deal.merchant || 'Merchant'} logo`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-400/10 dark:to-blue-500/10 flex items-center justify-center">
                  <span className="font-semibold text-blue-600 dark:text-blue-400 text-sm">
                    {deal.merchant ? deal.merchant.charAt(0) : 'M'}
                  </span>
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {deal.merchant || 'Unknown Merchant'}
                </h3>
                {deal.hasVerificationBadge && (
                  <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                )}
              </div>
              <h4 className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">
                {deal.title || 'No Title Available'}
              </h4>
            </div>
          </div>

          {/* Discount Badge */}
          <div className="flex-shrink-0">
            <Badge className="bg-blue-500 hover:bg-blue-500 text-white px-3 py-1 text-sm font-medium">
              {deal.discount || 'N/A'}
            </Badge>
          </div>
        </div>

        {/* Countdown Timer - Only for active deals */}
        {!isExpired && (
          <div className="mb-4">
            <CountdownTimer endDate={deal.endDate} />
          </div>
        )}
      </div>

      {/* Action Row - Clean Design with Dynamic Layout */}
      <div className="px-4 pb-4">
        <div className={`flex gap-2 ${
          // Dynamic layout based on which buttons are actually shown
          (() => {
            const effectiveButtonConfig = getEffectiveButtonConfig();
            const hasCode = deal.code && deal.code.trim() !== '';
            
            const hasClaimButton = effectiveButtonConfig === 'both' || effectiveButtonConfig === 'claim-only';
            const hasCodeButton = (effectiveButtonConfig === 'both' || effectiveButtonConfig === 'code-only') && hasCode;
            
            if (hasClaimButton && hasCodeButton) {
              return 'grid grid-cols-2'; // Two equal buttons
            } else {
              return 'flex'; // Single button takes full width
            }
          })()
        }`}>
          
          {/* Copy Code Button - Only show if has code and config allows it */}
          {(() => {
            const effectiveButtonConfig = getEffectiveButtonConfig();
            const hasCode = deal.code && deal.code.trim() !== '';
            return (effectiveButtonConfig === 'both' || effectiveButtonConfig === 'code-only') && hasCode;
          })() && (
            <Button
              onClick={handleCopyCode}
              variant="outline"
              className={`${
                getEffectiveButtonConfig() === 'code-only' ? 'w-full' : 'flex-1'
              } h-10 font-medium transition-all duration-200 ${
                isExpired 
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border-slate-200 dark:border-slate-700" 
                  : justCopied
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 border-blue-200 dark:border-blue-700"
                  : "border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
              disabled={isExpired}
            >
              {justCopied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  {getEffectiveButtonConfig() === 'code-only' ? 'Get Code' : deal.code || 'Copy Code'}
                </>
              )}
            </Button>
          )}

          {/* Claim Deal Button - Only show if config allows it */}
          {(() => {
            const effectiveButtonConfig = getEffectiveButtonConfig();
            return effectiveButtonConfig === 'both' || effectiveButtonConfig === 'claim-only';
          })() && (
            <Button
              onClick={handleGoToOffer}
              className={`${
                getEffectiveButtonConfig() === 'claim-only' ? 'w-full' : 'flex-1'
              } h-10 font-medium transition-all duration-200 ${
                isExpired 
                  ? "bg-slate-200 dark:bg-slate-700 text-slate-500 cursor-not-allowed" 
                  : justOpened
                  ? "bg-blue-500 hover:bg-blue-500 text-white"
                  : "bg-blue-500 hover:bg-blue-500 text-white"
              }`}
              disabled={isExpired}
            >
              {justOpened ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Opening!
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  {getEffectiveButtonConfig() === 'claim-only' ? 'Get This Deal' : 'Claim Deal'}
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Details Toggle - Clean */}
      <div className="px-4 pb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full h-8 text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 justify-center"
        >
          {isExpanded ? (
            <>
              Hide Details <ChevronUp className="w-4 h-4 ml-1" />
            </>
          ) : (
            <>
              Show Details <ChevronDown className="w-4 h-4 ml-1" />
            </>
          )}
        </Button>
      </div>

      {/* Expanded Details - Clean */}
      {isExpanded && (
        <div className="border-t border-slate-200/50 dark:border-slate-700/50 bg-slate-50/30 dark:bg-slate-800/20 p-4 space-y-4">
          {/* Description */}
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {deal.description || 'No description available'}
            </p>
          </div>

          {/* Terms */}
          <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-3">
            <h5 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
              <Award className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              Terms & Conditions
            </h5>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {deal.terms || 'No terms available'}
            </p>
          </div>

          {/* Actions Row - Clean */}
          <div className="flex gap-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
            <ShareButton
              deal={deal}
              userName={userName}
              variant="outline"
              size="sm"
              isAuthenticated={true}
              className="flex-1 h-9 border-slate-300 dark:border-slate-600"
            />
            
            {onRemove && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-9 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl border-0 shadow-xl">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                      <Trash2 className="w-8 h-8 text-slate-600 dark:text-slate-400" />
                    </div>
                    <AlertDialogTitle className="text-xl font-bold mb-2">Remove Deal?</AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-600 dark:text-slate-400 mb-6">
                      This will remove <strong>{deal.merchant || 'this deal'}</strong> from your saved deals.
                    </AlertDialogDescription>
                  </div>
                  <div className="flex gap-3">
                    <AlertDialogCancel className="flex-1" style={{ borderRadius: '0.75rem' }}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onRemove(deal.id)}
                      className="flex-1 bg-slate-600 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-800"
                      style={{ borderRadius: '0.75rem' }}
                    >
                      Remove
                    </AlertDialogAction>
                  </div>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export function MyDeals({ savedDeals, onClearExpired, onRemoveDeal, userName }: MyDealsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CouponCategory>('All');
  const [activeTab, setActiveTab] = useState('active');

  const filterDeals = (deals: Coupon[]) => {
    return deals.filter(deal => {
      const matchesSearch = (deal.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (deal.merchant || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (deal.code || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || deal.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  };

  const filteredDeals = filterDeals(savedDeals);
  const now = new Date();
  const activeDeals = filteredDeals.filter(deal => new Date(deal.endDate) > now);
  const expiredDeals = filteredDeals.filter(deal => new Date(deal.endDate) <= now);

  const categories: CouponCategory[] = ['All', 'CFD Prop', 'Futures Prop', 'Broker Bonuses'];

  // Calculate urgency stats
  const urgentDeals = activeDeals.filter(deal => {
    const timeRemaining = calculateTimeRemaining(deal.endDate);
    return timeRemaining && timeRemaining.days <= 3;
  });

  const EmptyState = ({ type }: { type: 'empty' | 'no-results' | 'expired' }) => {
    const states = {
      empty: {
        icon: <Bookmark className="w-12 h-12 text-slate-400" />,
        title: "No deals saved yet",
        description: "Start swiping right on deals to save them here and claim amazing trading offers!",
        action: null
      },
      'no-results': {
        icon: <Search className="w-12 h-12 text-slate-400" />,
        title: "No matching deals",
        description: "Try adjusting your search or category filters to find your saved deals",
        action: (
          <Button 
            onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
            variant="outline"
            style={{ borderRadius: '0.75rem' }}
          >
            Clear Filters
          </Button>
        )
      },
      expired: {
        icon: <Archive className="w-12 h-12 text-slate-400" />,
        title: "No expired deals",
        description: "All your saved deals are still active and ready to claim!",
        action: null
      }
    };

    const state = states[type];

    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
          {state.icon}
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          {state.title}
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-sm mx-auto">
          {state.description}
        </p>
        {state.action}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 -m-3 p-3">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Enhanced Header */}
        <div className="text-center">
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/50 dark:border-slate-700/50 shadow-lg p-6">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent mb-3">
                My Saved Deals
              </h1>
              <p className="text-slate-600 dark:text-slate-400 font-medium">
                Ready to claim? Copy codes & start trading! 🚀
              </p>
            </div>


          </div>
        </div>

        {/* Enhanced Search & Filters */}
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/50 dark:border-slate-700/50 shadow-lg p-5">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search your deals, merchants, or codes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500/20"
                style={{ borderRadius: '0.75rem' }}
              />
            </div>
            
            {/* Category Filter - Compact for iPhone 16 */}
            <div className="flex gap-2 px-1 py-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={`flex-1 whitespace-nowrap px-2 py-2 text-xs font-medium transition-all duration-200 ${
                    selectedCategory === category 
                      ? "bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-lg" 
                      : "border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300"
                  }`}
                  style={{ 
                    borderRadius: '0.75rem'
                  }}
                >
                  {category === 'Broker Bonuses' ? 'Broker' : category}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Custom Tabs for Active and Expired Deals */}
        <div className="w-full">
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 shadow-lg overflow-hidden" style={{ borderRadius: '1rem' }}>
            <div className="w-full bg-transparent border-b border-slate-200 dark:border-slate-700 p-0 h-auto flex" style={{ borderRadius: '1rem 1rem 0 0' }}>
              <button 
                onClick={() => setActiveTab('active')}
                className={`flex-1 h-16 text-base font-semibold transition-all duration-200 ${
                  activeTab === 'active'
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                    : 'border-b-2 border-transparent hover:bg-blue-25 dark:hover:bg-blue-900/10'
                }`}
                style={{ borderRadius: '1rem 0 0 0' }}
              >
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div>Ready to Claim</div>
                    <div className="text-xs opacity-70">({activeDeals.length} deals)</div>
                  </div>
                </div>
              </button>
              <button 
                onClick={() => setActiveTab('expired')}
                className={`flex-1 h-16 text-base font-semibold transition-all duration-200 ${
                  activeTab === 'expired'
                    ? 'bg-slate-50 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400 border-b-2 border-slate-500'
                    : 'border-b-2 border-transparent hover:bg-slate-25 dark:hover:bg-slate-800/10'
                }`}
                style={{ borderRadius: '0 1rem 0 0' }}
              >
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200">
                    <Archive className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div>Expired</div>
                    <div className="text-xs opacity-70">({expiredDeals.length} deals)</div>
                  </div>
                </div>
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'active' && (
                <div className="space-y-6">
                  {activeDeals.length === 0 ? (
                    filteredDeals.length === 0 ? (
                      savedDeals.length === 0 ? (
                        <EmptyState type="empty" />
                      ) : (
                        <EmptyState type="no-results" />
                      )
                    ) : (
                      <EmptyState type="expired" />
                    )
                  ) : (
                    activeDeals.map((deal, index) => (
                      <CompactDealCard
                        key={deal.id}
                        deal={deal}
                        isExpired={false}
                        onRemove={onRemoveDeal}
                        index={index}
                        userName={userName}
                      />
                    ))
                  )}
                </div>
              )}

              {activeTab === 'expired' && (
                <div className="space-y-6">
                  {expiredDeals.length === 0 ? (
                    <EmptyState type="expired" />
                  ) : (
                    <>
                      <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-red-200/50 dark:border-red-800/30 mb-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center">
                              <Archive className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                {expiredDeals.length} Expired Deal{expiredDeals.length !== 1 ? 's' : ''}
                              </p>
                              <p className="text-xs text-red-600 dark:text-red-400">
                                These deals are no longer available
                              </p>
                            </div>
                          </div>
                          <Button
                            onClick={onClearExpired}
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20"
                            style={{ borderRadius: '0.75rem' }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Clear All
                          </Button>
                        </div>
                      </div>

                      {expiredDeals.map((deal, index) => (
                        <CompactDealCard
                          key={deal.id}
                          deal={deal}
                          isExpired={true}
                          onRemove={onRemoveDeal}
                          index={index}
                          userName={userName}
                        />
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}