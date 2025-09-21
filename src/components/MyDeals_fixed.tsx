import { useState, useEffect } from "react";
import { Coupon, CouponCategory } from "./types";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Clock, ExternalLink, Copy, Trash2, ChevronDown, ChevronUp, Calendar, AlertCircle, Bookmark, Heart, Target, Filter, TrendingUp, Archive, Search, Star, Award, CheckCircle2, Zap, Timer, DollarSign, TrendingDown } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";

interface MyDealsProps {
  savedDeals: Coupon[];
  onClearExpired: () => void;
  onRemoveDeal?: (dealId: string) => void;
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

const CountdownTimer = ({ endDate, isCompact = false }: { endDate: string; isCompact?: boolean }) => {
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
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full border border-red-200 dark:border-red-800/50">
        <AlertCircle className="w-3.5 h-3.5" />
        <span className="text-xs font-semibold">EXPIRED</span>
      </div>
    );
  }

  const getUrgency = () => {
    if (timeRemaining.days > 7) return { 
      color: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/50', 
      label: 'Active',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />
    };
    if (timeRemaining.days > 3) return { 
      color: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50', 
      label: 'Ends Soon',
      icon: <Clock className="w-3.5 h-3.5" />
    };
    if (timeRemaining.days > 1) return { 
      color: 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800/50', 
      label: 'Urgent',
      icon: <Timer className="w-3.5 h-3.5 animate-pulse" />
    };
    return { 
      color: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50', 
      label: 'Critical',
      icon: <Zap className="w-3.5 h-3.5 animate-pulse" />
    };
  };

  const urgency = getUrgency();

  if (isCompact) {
    return (
      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${urgency.color}`}>
        {urgency.icon}
        <span className="text-xs font-semibold">{urgency.label}</span>
        {timeRemaining.days <= 7 && (
          <span className="text-xs">({timeRemaining.days}d)</span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center gap-3 px-4 py-3 rounded-xl border ${urgency.color}`}>
      <div className="flex items-center gap-2">
        {urgency.icon}
        <span className="text-sm font-bold">{urgency.label}</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <div className="flex flex-col items-center">
          <span className="font-bold">{timeRemaining.days}</span>
          <span className="text-xs opacity-80">days</span>
        </div>
        <span className="opacity-50">:</span>
        <div className="flex flex-col items-center">
          <span className="font-bold">{String(timeRemaining.hours).padStart(2, '0')}</span>
          <span className="text-xs opacity-80">hrs</span>
        </div>
      </div>
    </div>
  );
};

const EnhancedDealCard = ({ 
  deal, 
  isExpired, 
  onRemove,
  index 
}: { 
  deal: Coupon; 
  isExpired: boolean;
  onRemove?: (dealId: string) => void;
  index: number;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [justCopied, setJustCopied] = useState(false);
  const [justOpened, setJustOpened] = useState(false);

  const handleCopyCode = async () => {
    const code = deal.code || 'N/A';
    try {
      await navigator.clipboard.writeText(code);
      setJustCopied(true);
      toast.success("Code copied! Ready to claim your deal 🎉");
      setTimeout(() => setJustCopied(false), 2000);
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setJustCopied(true);
      toast.success("Code copied! Ready to claim your deal 🎉");
      setTimeout(() => setJustCopied(false), 2000);
    }
  };

  const handleGoToOffer = () => {
    if (deal.affiliateLink) {
      setJustOpened(true);
      window.open(deal.affiliateLink, '_blank', 'noopener,noreferrer');
      toast.success("Opening deal page - time to claim! 🚀");
      setTimeout(() => setJustOpened(false), 3000);
    } else {
      toast.error("No offer link available");
    }
  };

  return (
    <div 
      className={`group relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden animate-in slide-in-from-bottom-4 fade-in-0 ${isExpired ? 'opacity-75 grayscale-[0.3]' : 'hover:scale-[1.01]'} ${isExpanded ? 'ring-2 ring-blue-500/30' : ''}`}
      style={{
        animationDelay: `${index * 150}ms`
      }}
    >
      {/* Urgency Pulse for Critical Deals */}
      {!isExpired && (
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
      )}
      
      {/* Header Section */}
      <div className="relative p-6">
        <div className="flex items-start gap-4">
          {/* Enhanced Logo & Verification */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white dark:bg-slate-800 shadow-xl ring-2 ring-white/80 dark:ring-slate-700/80 group-hover:scale-105 transition-transform duration-300">
              {deal.logoUrl ? (
                <ImageWithFallback
                  src={deal.logoUrl}
                  alt={`${deal.merchant || 'Merchant'} logo`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900/40 dark:to-indigo-900/40 flex items-center justify-center">
                  <span className="font-bold text-blue-600 dark:text-blue-400 text-xl">
                    {deal.merchant ? deal.merchant.charAt(0) : 'M'}
                  </span>
                </div>
              )}
            </div>
            {deal.hasVerificationBadge && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-green-400 to-green-500 rounded-full shadow-lg flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
            )}
            {!isExpired && (
              <div className="absolute -top-1 -left-1 w-5 h-5 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full shadow-md flex items-center justify-center animate-pulse">
                <Star className="w-3 h-3 text-white fill-current" />
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg mb-1">
                  {deal.merchant || 'Unknown Merchant'}
                </h3>
                <div className="flex items-center gap-2">
                  <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs px-2.5 py-1 rounded-lg border-0">
                    {deal.category || 'Uncategorized'}
                  </Badge>
                  {!isExpired && (
                    <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs px-2.5 py-1 rounded-lg border-0">
                      ACTIVE
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md group-hover:from-blue-600 group-hover:to-blue-700 transition-all duration-300">
                  {deal.discount || 'N/A'}
                </div>
                <CountdownTimer endDate={deal.endDate} isCompact />
              </div>
            </div>
            
            <div className="mb-4">
              <p className="font-semibold text-slate-800 dark:text-slate-200 mb-2 line-clamp-1">
                {deal.title || 'No Title Available'}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {deal.description || 'No description available'}
              </p>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleGoToOffer}
                  size="sm"
                  className={`flex-1 h-11 font-semibold transition-all duration-300 relative overflow-hidden ${
                    isExpired 
                      ? "bg-slate-200 dark:bg-slate-700 text-slate-500 cursor-not-allowed" 
                      : justOpened
                      ? "bg-green-500 hover:bg-green-600 text-white shadow-lg border-0"
                      : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl hover:scale-105 border-0"
                  }`}
                  disabled={isExpired}
                  style={{ borderRadius: '0.75rem' }}
                >
                  {justOpened ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Opening Deal!
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Claim Deal Now
                    </>
                  )}
                  {!isExpired && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  )}
                </Button>
                
                <Button
                  onClick={handleCopyCode}
                  variant="outline"
                  size="sm"
                  className={`h-11 px-4 font-semibold transition-all duration-300 relative overflow-hidden ${
                    isExpired 
                      ? "border-slate-300 dark:border-slate-600 text-slate-500 cursor-not-allowed" 
                      : justCopied
                      ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                      : "border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 hover:scale-105"
                  }`}
                  disabled={isExpired}
                  style={{ borderRadius: '0.75rem' }}
                >
                  {justCopied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Code
                    </>
                  )}
                </Button>
              </div>

              {/* Quick Code Display */}
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 rounded-xl p-3 border border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Quick Copy:</span>
                  <div className="flex items-center gap-2">
                    <code className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 px-3 py-1 rounded-lg border">
                      {deal.code || 'N/A'}
                    </code>
                    <Button
                      onClick={handleCopyCode}
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                      disabled={isExpired}
                      style={{ borderRadius: '0.5rem' }}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Expand Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className={`w-full h-10 transition-all duration-300 ${
                  isExpanded 
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30" 
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
                style={{ borderRadius: '0.75rem' }}
              >
                <span className="text-sm font-medium">
                  {isExpanded ? "Hide Details" : "View Full Details"}
                </span>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 ml-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-2" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-slate-50/80 to-slate-100/80 dark:from-slate-800/50 dark:to-slate-700/50 p-6 space-y-4">
          {/* Full Countdown Display */}
          {!isExpired && (
            <div className="bg-white/80 dark:bg-slate-800/80 rounded-xl p-4 border border-slate-200/50 dark:border-slate-700/50">
              <div className="text-center">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">Time Remaining to Claim</h4>
                <CountdownTimer endDate={deal.endDate} />
              </div>
            </div>
          )}

          {/* Terms */}
          <div className="bg-white/80 dark:bg-slate-800/80 rounded-xl p-4 border border-slate-200/50 dark:border-slate-700/50">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-500" />
              Terms & Conditions
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {deal.terms || 'No terms available'}
            </p>
          </div>

          {/* Expiration */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Deal Expires</p>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  {new Date(deal.endDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Remove Button */}
          {onRemove && (
            <div className="pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 h-10 font-medium transition-all duration-200 hover:scale-[1.02]"
                    style={{ borderRadius: '0.75rem' }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove from My Deals
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl border-0 shadow-xl">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                      <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
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
                      className="flex-1 bg-red-500 hover:bg-red-600"
                      style={{ borderRadius: '0.75rem' }}
                    >
                      Remove
                    </AlertDialogAction>
                  </div>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export function MyDeals({ savedDeals, onClearExpired, onRemoveDeal }: MyDealsProps) {
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
            <div className="mb-6">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent mb-2">
                My Saved Deals
              </h1>
              <p className="text-slate-600 dark:text-slate-400 font-medium">
                Ready to claim? Copy codes & start trading! 🚀
              </p>
            </div>
            
            {/* Enhanced Stats Dashboard */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-4 relative overflow-hidden hover:scale-105 transition-transform duration-200 shadow-sm">
                <div className="absolute top-2 right-2">
                  <TrendingUp className="w-4 h-4 text-blue-500 opacity-60" />
                </div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{activeDeals.length}</div>
                <div className="text-sm text-blue-700 dark:text-blue-300">Ready to Claim</div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 rounded-xl p-4 relative overflow-hidden hover:scale-105 transition-transform duration-200 shadow-sm">
                <div className="absolute top-2 right-2">
                  <Timer className="w-4 h-4 text-orange-500 opacity-60" />
                </div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{urgentDeals.length}</div>
                <div className="text-sm text-orange-700 dark:text-orange-300">Expiring Soon</div>
              </div>
              
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/30 dark:to-slate-700/30 rounded-xl p-4 relative overflow-hidden hover:scale-105 transition-transform duration-200 shadow-sm">
                <div className="absolute top-2 right-2">
                  <TrendingDown className="w-4 h-4 text-slate-500 opacity-60" />
                </div>
                <div className="text-2xl font-bold text-slate-600 dark:text-slate-400">{expiredDeals.length}</div>
                <div className="text-sm text-slate-700 dark:text-slate-300">Expired</div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl p-4 relative overflow-hidden hover:scale-105 transition-transform duration-200 shadow-sm">
                <div className="absolute top-2 right-2">
                  <DollarSign className="w-4 h-4 text-green-500 opacity-60" />
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{savedDeals.length}</div>
                <div className="text-sm text-green-700 dark:text-green-300">Total Value</div>
              </div>
            </div>

            {/* Action Encouragement Banner */}
            {activeDeals.length > 0 && (
              <div className="mt-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]">
                <div className="flex items-center justify-center gap-3">
                  <Zap className="w-5 h-5 animate-pulse" />
                  <span className="font-semibold">
                    You have {activeDeals.length} active deal{activeDeals.length !== 1 ? 's' : ''} waiting!
                  </span>
                  <Zap className="w-5 h-5 animate-pulse" />
                </div>
                <p className="text-center text-sm mt-1 opacity-90">
                  Copy codes below and start claiming your trading advantages
                </p>
              </div>
            )}
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
            
            {/* Category Filter - iPhone 16 Optimized */}
            <div className="relative">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 snap-x snap-mandatory scroll-smooth" 
                   style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {categories.map((category, index) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={`flex-shrink-0 whitespace-nowrap px-4 py-2.5 transition-all duration-200 snap-start hover:scale-105 active:scale-95 ${
                      selectedCategory === category 
                        ? "bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-lg" 
                        : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                    style={{ minWidth: 'fit-content', borderRadius: '0.75rem' }}
                  >
                    {category}
                  </Button>
                ))}
              </div>
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
                      <EnhancedDealCard
                        key={deal.id}
                        deal={deal}
                        isExpired={false}
                        onRemove={onRemoveDeal}
                        index={index}
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
                        <EnhancedDealCard
                          key={deal.id}
                          deal={deal}
                          isExpired={true}
                          onRemove={onRemoveDeal}
                          index={index}
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