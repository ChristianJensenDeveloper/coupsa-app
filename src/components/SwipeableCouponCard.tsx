import { useState, useRef, useEffect } from "react";
import { motion, PanInfo, useMotionValue, useTransform } from "motion/react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Heart, X, Calendar, Clock, ShieldCheck, ExternalLink, Copy, Star, TrendingUp, Shield, Zap } from "lucide-react";
import { ShareButton } from "./ShareButton";
import { Coupon } from "./types";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { toast } from "sonner@2.0.3";

interface SwipeableCouponCardProps {
  coupon: Coupon;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onClaim: (couponId: string) => void;
  isAuthenticated: boolean;
  onLoginRequired: () => void;
  userName?: string;
}

interface CountdownProps {
  endDate: string;
}

function Countdown({ endDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(endDate).getTime() - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
          isExpired: false
        });
      } else {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  if (timeLeft.isExpired) {
    return (
      <div className="h-[65px] flex flex-col items-center justify-center gap-2 text-slate-500">
        <Clock className="w-4 h-4" />
        <span className="text-sm font-medium">Expired</span>
      </div>
    );
  }

  return (
    <div className="h-[65px] flex flex-col justify-center">
      <div className="flex items-center justify-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-slate-600 dark:text-slate-400" />
        <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Expires in</span>
      </div>
      <div className="flex items-center justify-center gap-3">
        {timeLeft.days > 0 && (
          <div className="text-center bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-lg min-w-[50px]">
            <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{timeLeft.days}</div>
            <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">days</div>
          </div>
        )}
        {(timeLeft.days > 0 || timeLeft.hours > 0) && (
          <div className="text-center bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-lg min-w-[50px]">
            <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{timeLeft.hours}</div>
            <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">hrs</div>
          </div>
        )}
        {(timeLeft.days > 0 || timeLeft.hours > 0 || timeLeft.minutes > 0) && (
          <div className="text-center bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-lg min-w-[50px]">
            <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{timeLeft.minutes}</div>
            <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">min</div>
          </div>
        )}
        {/* Always show seconds */}
        <div className="text-center bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-lg min-w-[50px]">
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{timeLeft.seconds}</div>
          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">sec</div>
        </div>
      </div>
    </div>
  );
}

export function SwipeableCouponCard({ 
  coupon, 
  onSwipeLeft, 
  onSwipeRight, 
  onClaim,
  isAuthenticated,
  onLoginRequired,
  userName
}: SwipeableCouponCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  // Helper function to determine effective button configuration
  const getEffectiveButtonConfig = () => {
    const hasCode = coupon.code && coupon.code.trim() !== '';
    
    // If buttonConfig is explicitly set, use it (but validate it makes sense)
    if (coupon.buttonConfig) {
      // Prevent 'code-only' when no code exists - fallback to 'claim-only'
      if (coupon.buttonConfig === 'code-only' && !hasCode) {
        console.warn(`Deal ${coupon.id}: 'code-only' config but no code provided. Fallback to 'claim-only'.`);
        return 'claim-only';
      }
      return coupon.buttonConfig;
    }
    
    // Auto-configuration based on available data
    return hasCode ? 'both' : 'claim-only';
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false);
    const threshold = 100;
    const velocity = Math.abs(info.velocity.x);
    
    if (info.offset.x > threshold || (info.offset.x > 50 && velocity > 500)) {
      // Swipe right - claim/like
      onSwipeRight();
    } else if (info.offset.x < -threshold || (info.offset.x < -50 && velocity > 500)) {
      // Swipe left - dismiss
      onSwipeLeft();
    }
  };



  const getCategoryColor = (category: string) => {
    // Use consistent primary blue theme for all categories
    return 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary';
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <motion.div
        ref={cardRef}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        style={{ x, rotate, opacity }}
        className="w-full max-w-sm cursor-grab active:cursor-grabbing"
        whileTap={{ scale: 0.98 }}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <Card className="relative overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl bg-white dark:bg-slate-900 h-[400px] flex flex-col">
          {/* Category Badge - Top Left Corner of Card */}
          <div className="absolute top-3 left-3 z-20">
            <Badge className={`${getCategoryColor(coupon.category)} shadow-sm border-0`} variant="secondary">
              {coupon.category}
            </Badge>
          </div>
          
          {/* Discount Badge - Top Right Corner of Card - Prominent */}
          <div className="absolute top-3 right-3 z-20">
            <Badge className="bg-gradient-to-r from-blue-500 to-blue-500 text-white font-bold px-4 py-2.5 text-base shadow-lg border-0 rounded-xl transform hover:scale-105 transition-transform">
              {coupon.discount}
            </Badge>
          </div>

          {/* Header Section with Logo */}
          <div className="relative p-3 border-b border-slate-200/50 dark:border-slate-700/50 h-[120px] flex-shrink-0 overflow-hidden">
            {/* Default Light Grey Background */}
            <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800" />
            
            {/* Content Overlay */}
            <div className="relative z-10">

            {/* Company Logo and Info */}
            <div className="flex items-center justify-center mt-4 mb-2">
              <div className="flex flex-col items-center space-y-2">
                {/* Company Logo */}
                <div className="w-16 h-16 rounded-xl bg-white dark:bg-slate-800 shadow-lg p-2 flex items-center justify-center border border-slate-200/50 dark:border-slate-700/50 relative">
                  {coupon.logoUrl ? (
                    <ImageWithFallback
                      src={coupon.logoUrl}
                      alt={`${coupon.merchant} logo`}
                      className={`w-full h-full object-contain rounded-lg ${!isAuthenticated ? 'blur-md' : ''}`}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-lg flex items-center justify-center">
                      <span className={`font-bold text-slate-600 dark:text-slate-400 text-xs ${!isAuthenticated ? 'blur-sm' : ''}`}>
                        {coupon.merchant.charAt(0)}
                      </span>
                    </div>
                  )}
                  {!isAuthenticated && (
                    <div className="absolute inset-0 bg-black/10 rounded-lg" />
                  )}
                </div>

                {/* Company Name with Verification */}
                <div className="flex items-center gap-2">
                  <h4 className={`text-base font-semibold text-slate-900 dark:text-slate-100 tracking-tight text-center ${!isAuthenticated ? 'blur-sm' : ''}`}>
                    {coupon.merchant}
                  </h4>
                  {coupon.hasVerificationBadge && isAuthenticated && (
                    <div className="flex items-center bg-blue-50 dark:bg-blue-900/30 p-1 rounded-full">
                      <ShieldCheck className="w-4 h-4 text-blue-500" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Login CTA Overlay for non-authenticated users */}
            {!isAuthenticated && (
              <div className="absolute inset-0 flex items-center justify-center rounded-t-2xl z-20">
                <Button
                  onClick={onLoginRequired}
                  variant="default"
                  size="sm"
                  className="bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-600 hover:to-blue-600 text-white shadow-lg border-0 rounded-full px-4 py-2 text-xs font-medium transition-all duration-200 hover:scale-105"
                >
                  Login/Signup - It's FREE!
                </Button>
              </div>
            )}


            </div>
          </div>
          
          {/* Content Section */}
          <CardContent className="px-5 pt-1 pb-4 flex-1 flex flex-col h-[280px] relative">
            {/* Saved Overlay - positioned in content section */}
            {coupon.isClaimed && isAuthenticated && (
              <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20">
                <Badge className="text-xs px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-500 text-white shadow-md border-0 rounded-full">
                  ✓ Saved in my folder
                </Badge>
              </div>
            )}
            
            {/* Deal Title */}
            <div className="flex items-center justify-center mb-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 leading-tight tracking-tight line-clamp-2 text-center">
                {coupon.title}
              </h3>
            </div>
            
            {/* Description */}
            <div className="flex items-start justify-center mb-2">
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2 text-center">
                {coupon.description}
              </p>
            </div>



            {/* Countdown Section */}
            <div className="flex-1 flex items-center justify-center">
              <Countdown endDate={coupon.endDate} />
            </div>

            {/* Action Buttons - Enhanced CTAs */}
            <div className={`flex gap-2 pt-3 pb-2 flex-shrink-0 ${
              // Dynamic layout based on which buttons are actually shown
              (() => {
                const effectiveButtonConfig = getEffectiveButtonConfig();
                const hasCode = coupon.code && coupon.code.trim() !== '';
                
                const hasClaimButton = effectiveButtonConfig === 'both' || effectiveButtonConfig === 'claim-only';
                const hasCodeButton = (effectiveButtonConfig === 'both' || effectiveButtonConfig === 'code-only') && hasCode;
                
                if (hasClaimButton && hasCodeButton) {
                  return 'grid grid-cols-[1fr_1fr_auto]'; // Two buttons + share
                } else if (hasClaimButton || hasCodeButton) {
                  return 'grid grid-cols-[1fr_auto]'; // One button + share
                } else {
                  return 'flex'; // Just share button
                }
              })()
            }`}>
              {/* Claim Deal Button */}
              {(() => {
                const effectiveButtonConfig = getEffectiveButtonConfig();
                return effectiveButtonConfig === 'both' || effectiveButtonConfig === 'claim-only';
              })() && (
                <Button
                  onClick={() => {
                    if (!isAuthenticated) {
                      onLoginRequired();
                      return;
                    }
                    if (coupon.affiliateLink) {
                      window.open(coupon.affiliateLink, '_blank', 'noopener,noreferrer');
                      toast.success("Opening offer page...");
                    } else {
                      toast.error("No offer link available");
                    }
                  }}
                  className={`bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-600 hover:to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] border-0 ${
                    getEffectiveButtonConfig() === 'claim-only' ? 'col-span-1' : ''
                  }`}
                  size="sm"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {getEffectiveButtonConfig() === 'claim-only' ? 'Get This Deal' : 'Claim This Deal'}
                </Button>
              )}
              
              {/* Copy Code Button */}
              {(() => {
                const effectiveButtonConfig = getEffectiveButtonConfig();
                const hasCode = coupon.code && coupon.code.trim() !== '';
                return (effectiveButtonConfig === 'both' || effectiveButtonConfig === 'code-only') && hasCode;
              })() && (
                <Button
                  onClick={async () => {
                    if (!isAuthenticated) {
                      onLoginRequired();
                      return;
                    }
                    try {
                      await navigator.clipboard.writeText(coupon.code);
                      toast.success(`Code "${coupon.code}" copied to clipboard!`);
                    } catch (err) {
                      // Fallback for older browsers
                      const textArea = document.createElement('textarea');
                      textArea.value = coupon.code;
                      document.body.appendChild(textArea);
                      textArea.select();
                      document.execCommand('copy');
                      document.body.removeChild(textArea);
                      toast.success(`Code "${coupon.code}" copied to clipboard!`);
                    }
                  }}
                  variant="outline"
                  className={`rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 ${
                    getEffectiveButtonConfig() === 'code-only' ? 'col-span-1' : ''
                  }`}
                  size="sm"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  {getEffectiveButtonConfig() === 'code-only' ? 'Get Code' : 'Copy Code'}
                </Button>
              )}
              
              {/* Share Button */}
              <ShareButton
                deal={coupon}
                userName={userName || "a trader"}
                variant="icon"
                size="sm"
                isAuthenticated={isAuthenticated}
                onLoginRequired={onLoginRequired}
                className="flex-shrink-0"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Swipe indicators */}
      {isDragging && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: x.get() > 50 ? 1 : 0 }}
            className="absolute top-1/2 left-8 transform -translate-y-1/2 z-10"
          >
            <div className="bg-gradient-to-r from-blue-500 to-blue-500 text-white p-4 rounded-full shadow-xl backdrop-blur-sm border-2 border-white/20">
              <Heart className="w-7 h-7" />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: x.get() < -50 ? 1 : 0 }}
            className="absolute top-1/2 right-8 transform -translate-y-1/2 z-10"
          >
            <div className="bg-gradient-to-r from-slate-500 to-slate-600 text-white p-4 rounded-full shadow-xl backdrop-blur-sm border-2 border-white/20">
              <X className="w-7 h-7" />
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}