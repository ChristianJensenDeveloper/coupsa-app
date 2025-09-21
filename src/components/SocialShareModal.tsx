import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { toast } from "sonner@2.0.3";
import { X, Share2, ExternalLink, CheckCircle2, Users, Target, Trophy } from 'lucide-react';
import { Giveaway } from './types';

interface SocialPlatform {
  id: string;
  name: string;
  icon: string;
  color: string;
  shareUrl: (text: string, url: string) => string;
  trackingPixel?: string;
}

const socialPlatforms: SocialPlatform[] = [
  {
    id: 'twitter',
    name: 'Twitter',
    icon: '𝕏',
    color: 'bg-black hover:bg-gray-800',
    shareUrl: (text: string, url: string) => 
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=PropTrading,TradingGiveaway,REDUZED`
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: '📘',
    color: 'bg-blue-600 hover:bg-blue-700',
    shareUrl: (text: string, url: string) => 
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: '📸',
    color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
    shareUrl: (text: string, url: string) => 
      `https://www.instagram.com/?url=${encodeURIComponent(url)}`
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: '💼',
    color: 'bg-blue-700 hover:bg-blue-800',
    shareUrl: (text: string, url: string) => 
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`
  },
  {
    id: 'discord',
    name: 'Discord',
    icon: '🎮',
    color: 'bg-indigo-600 hover:bg-indigo-700',
    shareUrl: (text: string, url: string) => 
      `https://discord.com/channels/@me?text=${encodeURIComponent(text + ' ' + url)}`
  },
  {
    id: 'telegram',
    name: 'Telegram',
    icon: '✈️',
    color: 'bg-sky-500 hover:bg-sky-600',
    shareUrl: (text: string, url: string) => 
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: '💬',
    color: 'bg-green-600 hover:bg-green-700',
    shareUrl: (text: string, url: string) => 
      `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`
  }
];

interface ShareHistory {
  platformId: string;
  timestamp: number;
  count: number;
}

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  giveaway: Giveaway;
  onShareComplete: (platform: string) => void;
  // Track sharing history with timestamps for time-based sharing
  shareHistory?: ShareHistory[];
}

export function SocialShareModal({ isOpen, onClose, giveaway, onShareComplete, shareHistory = [] }: SocialShareModalProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [sharedPlatforms, setSharedPlatforms] = useState<Set<string>>(new Set());
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Time-based sharing logic
  const SHARE_COOLDOWN_HOURS = 24; // Allow sharing once per day
  const now = Date.now();
  
  // Helper function to get platform share status
  const getPlatformShareStatus = (platformId: string) => {
    const platformHistory = shareHistory.filter(h => h.platformId === platformId);
    if (platformHistory.length === 0) {
      return { canShare: true, status: 'never', lastShared: null, shareCount: 0 };
    }
    
    const lastShare = Math.max(...platformHistory.map(h => h.timestamp));
    const totalShares = platformHistory.reduce((sum, h) => sum + h.count, 0);
    const timeSinceLastShare = now - lastShare;
    const hoursAgo = Math.floor(timeSinceLastShare / (1000 * 60 * 60));
    const canShare = timeSinceLastShare >= (SHARE_COOLDOWN_HOURS * 60 * 60 * 1000);
    
    return {
      canShare,
      status: canShare ? 'ready' : 'cooldown',
      lastShared: lastShare,
      shareCount: totalShares,
      hoursAgo,
      hoursUntilNext: Math.max(0, SHARE_COOLDOWN_HOURS - hoursAgo)
    };
  };
  
  // Helper function to format time ago
  const formatTimeAgo = (timestamp: number) => {
    const hoursAgo = Math.floor((now - timestamp) / (1000 * 60 * 60));
    if (hoursAgo < 1) return 'Just now';
    if (hoursAgo < 24) return `${hoursAgo}h ago`;
    const daysAgo = Math.floor(hoursAgo / 24);
    return `${daysAgo}d ago`;
  };

  // Safety check - don't render if giveaway is null
  if (!giveaway) {
    return null;
  }

  const shareContent = {
    text: `🎯 I just entered to win ${giveaway.prize} on REDUZED - the AI Deal Finder for Traders! 🚀 Free to join and win trading challenges & bonuses. No purchase required! Get your FREE access: #PropTrading #TradingGiveaway #REDUZED`,
    url: giveaway.shareUrl || 'https://reduzed.com/giveaways?ref=social'
  };

  const handlePlatformShare = (platform: SocialPlatform) => {
    const shareStatus = getPlatformShareStatus(platform.id);
    
    // Check if platform is on cooldown
    if (!shareStatus.canShare) {
      toast.error(`Wait ${shareStatus.hoursUntilNext}h before sharing on ${platform.name} again`, {
        description: `You last shared ${shareStatus.hoursAgo}h ago. Cool down: ${SHARE_COOLDOWN_HOURS}h`
      });
      return;
    }
    
    // Track the share attempt
    setSharedPlatforms(prev => new Set(prev).add(platform.id));
    
    // Special handling for Instagram (copy link + show instructions)
    if (platform.id === 'instagram') {
      navigator.clipboard.writeText(shareContent.url);
      toast.success("Link copied for Instagram!", {
        description: "Paste this link in your Instagram story or post to share the giveaway!"
      });
      return;
    }
    
    // Special handling for Discord (copy link + show instructions)
    if (platform.id === 'discord') {
      const discordMessage = `${shareContent.text}\n${shareContent.url}`;
      navigator.clipboard.writeText(discordMessage);
      toast.success("Message copied for Discord!", {
        description: "Paste this message in your Discord server or DM to share the giveaway!"
      });
      return;
    }
    
    // Open the share URL for other platforms
    const shareUrl = platform.shareUrl(shareContent.text, shareContent.url);
    const shareWindow = window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
    
    // Start tracking for share completion
    if (shareWindow) {
      // Move to verification step after opening share window
      setTimeout(() => {
        setCurrentStep(3);
      }, 1000);
      
      // Monitor if window is closed (indicates sharing might be complete)
      const checkClosed = setInterval(() => {
        if (shareWindow.closed) {
          clearInterval(checkClosed);
          // Give user a moment to complete the share, then show verification
          setTimeout(() => {
            setIsVerifying(false);
          }, 500);
        }
      }, 1000);
    }
  };

  const handleVerifyShares = () => {
    setIsVerifying(true);
    
    // Enhanced verification process - require user confirmation
    setTimeout(() => {
      const shareCount = sharedPlatforms.size;
      
      if (shareCount === 0) {
        toast.error("Please share on at least one platform first!");
        setIsVerifying(false);
        return;
      }
      
      // In production, this would verify via social APIs or manual review
      // For now, we add a confirmation step to reduce false claims
      const platforms = Array.from(sharedPlatforms).map(id => 
        socialPlatforms.find(p => p.id === id)?.name
      ).join(', ');
      
      toast.success(`🎉 ${shareCount} ${shareCount === 1 ? 'entry' : 'entries'} pending verification!`, {
        description: `Your shares on ${platforms} will be verified within 24 hours. Thanks for spreading the word about REDUZED!`
      });
      
      // Award entries (in production, these would be pending until verified)
      sharedPlatforms.forEach(platformId => {
        onShareComplete(platformId);
      });
      
      setIsVerifying(false);
      onClose();
      
      // Reset modal state
      setCurrentStep(1);
      setSharedPlatforms(new Set());
    }, 2000);
  };

  const handleSkipAndCopy = () => {
    navigator.clipboard.writeText(shareContent.url);
    toast.info("Link copied!", {
      description: "Share this link manually on any platform to spread the word!"
    });
    onClose();
    setCurrentStep(1);
    setSharedPlatforms(new Set());
  };

  const resetModal = () => {
    setCurrentStep(1);
    setSharedPlatforms(new Set());
    setIsVerifying(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg border-0 shadow-2xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden p-0 max-h-[90vh] overflow-y-auto [&>button]:hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 px-6 pt-6 pb-4 relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="absolute top-4 right-4 w-10 h-10 p-0 rounded-xl hover:bg-white/20 dark:hover:bg-white/10 backdrop-blur-sm border border-white/20 transition-all duration-200 hover:scale-110 relative z-10"
          >
            <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </Button>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
              <Share2 className="w-8 h-8 text-white" />
            </div>
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Share to Earn Entries
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400 text-sm">
              Share = +1 entry • More shares = better odds!
            </DialogDescription>
          </div>
        </div>

        {/* Steps Progress */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStep >= step 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                }`}>
                  {currentStep > step ? <CheckCircle2 className="w-4 h-4" /> : step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-0.5 ${
                    currentStep > step ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-600 dark:text-slate-400">
            <span>Choose</span>
            <span>Share</span>
            <span>Earn</span>
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6">
          {/* Step 1: Instructions */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                  3 Steps to Participate
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
                  Follow these simple steps to earn extra entries and increase your chances of winning!
                </p>
              </div>

              {/* Giveaway Preview */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl shadow-sm flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100">
                      {giveaway.prize}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {giveaway.firm} • {giveaway.totalEntries} entries
                    </div>
                  </div>
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">Choose Platform</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Select one or more social media platforms to share on
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Share2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">Share the Giveaway</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Post about this giveaway to help spread the word
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Trophy className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">Earn Extra Entries</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Get +1 entry for each platform you share on
                    </div>
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => setCurrentStep(2)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-2xl font-bold border-0"
              >
                Continue to Social Platforms
              </Button>
            </div>
          )}

          {/* Step 2: Platform Selection */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                  Choose Your Platform
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Click platforms to share. Check marks show completed shares for this giveaway.
                </p>
                
                {/* Enhanced Status Legend */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-xs">
                  <div className="text-center text-slate-500 dark:text-slate-400 mb-2 font-medium">
                    Sharing Status Legend
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </div>
                      <span>Just shared</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </div>
                      <span>Ready to share</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span>On cooldown</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
                      <span>Never shared</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700 text-center">
                    <span className="text-slate-500 dark:text-slate-400">
                      💡 Share once every 24 hours per platform
                    </span>
                  </div>
                </div>
              </div>

              {/* Platforms Grid */}
              <div className="grid grid-cols-2 gap-3">
                {socialPlatforms.map((platform) => {
                  const shareStatus = getPlatformShareStatus(platform.id);
                  const isNewlyShared = sharedPlatforms.has(platform.id);
                  
                  return (
                    <div key={platform.id} className="relative">
                      <Button
                        onClick={() => handlePlatformShare(platform)}
                        disabled={!shareStatus.canShare && !isNewlyShared}
                        className={`w-full ${platform.color} text-white border-0 rounded-2xl py-6 font-semibold relative overflow-hidden group transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                          !shareStatus.canShare && !isNewlyShared ? 'opacity-75 cursor-not-allowed' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3 relative z-10">
                          <span className="text-2xl">{platform.icon}</span>
                          <div className="text-left flex-1">
                            <div className="font-bold">{platform.name}</div>
                            
                            {/* Show sharing status */}
                            {isNewlyShared && (
                              <div className="text-xs opacity-90 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Just Shared
                              </div>
                            )}
                            {!isNewlyShared && shareStatus.status === 'cooldown' && (
                              <div className="text-xs opacity-90 flex items-center gap-1">
                                <div className="w-3 h-3 rounded-full bg-orange-400 flex items-center justify-center">
                                  <div className="w-1 h-1 bg-white rounded-full"></div>
                                </div>
                                Wait {shareStatus.hoursUntilNext}h
                              </div>
                            )}
                            {!isNewlyShared && shareStatus.status === 'ready' && shareStatus.shareCount > 0 && (
                              <div className="text-xs opacity-90 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                {shareStatus.shareCount}x shared • Ready
                              </div>
                            )}
                            {!isNewlyShared && shareStatus.status === 'never' && (
                              <div className="text-xs opacity-75">
                                Tap to share
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Show share count badge if multiple shares */}
                        {shareStatus.shareCount > 0 && (
                          <div className="absolute top-2 left-2 z-20">
                            <div className="bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                              {shareStatus.shareCount}x
                            </div>
                          </div>
                        )}
                        
                        {/* Overlay for different states */}
                        {!shareStatus.canShare && !isNewlyShared && (
                          <div className="absolute inset-0 bg-white/20 border-2 border-orange-400 rounded-2xl backdrop-blur-sm"></div>
                        )}
                        {isNewlyShared && (
                          <div className="absolute inset-0 bg-white/10 border-2 border-green-400 rounded-2xl backdrop-blur-sm"></div>
                        )}
                        {shareStatus.status === 'ready' && shareStatus.shareCount > 0 && !isNewlyShared && (
                          <div className="absolute inset-0 bg-white/10 border-2 border-blue-400 rounded-2xl backdrop-blur-sm"></div>
                        )}
                      </Button>
                      
                      {/* Status indicator overlay */}
                      {(isNewlyShared || shareStatus.shareCount > 0) && (
                        <div className="absolute -top-2 -right-2 z-20">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-3 border-white ${
                            isNewlyShared ? 'bg-green-500' : 
                            shareStatus.canShare ? 'bg-blue-500' : 'bg-orange-500'
                          }`}>
                            {isNewlyShared || shareStatus.canShare ? 
                              <CheckCircle2 className="w-5 h-5 text-white" /> :
                              <div className="w-3 h-3 rounded-full bg-white"></div>
                            }
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Share Count Summary */}
              {(sharedPlatforms.size > 0 || shareHistory.length > 0) && (
                <div className="space-y-3">
                  {/* New Shares This Session */}
                  {sharedPlatforms.size > 0 && (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4 text-center">
                      <div className="text-green-700 dark:text-green-300 font-bold">
                        🎉 {sharedPlatforms.size} New Share{sharedPlatforms.size !== 1 ? 's' : ''}!
                      </div>
                      <div className="text-sm text-green-600 dark:text-green-400">
                        You'll earn +{sharedPlatforms.size} entr{sharedPlatforms.size !== 1 ? 'ies' : 'y'} when verified
                      </div>
                    </div>
                  )}
                  
                  {/* Previous Shares Summary */}
                  {shareHistory.length > 0 && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4">
                      <div className="text-blue-700 dark:text-blue-300 font-bold text-center mb-3">
                        📈 Your Sharing History
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {socialPlatforms.map(platform => {
                          const status = getPlatformShareStatus(platform.id);
                          if (status.shareCount === 0) return null;
                          
                          return (
                            <div key={platform.id} className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-lg p-2">
                              <span>{platform.icon}</span>
                              <div>
                                <div className="font-medium text-slate-700 dark:text-slate-300">
                                  {status.shareCount}x shared
                                </div>
                                <div className="text-blue-600 dark:text-blue-400">
                                  {status.lastShared ? formatTimeAgo(status.lastShared) : 'Never'}
                                </div>
                              </div>
                            </div>
                          );
                        }).filter(Boolean)}
                      </div>
                      <div className="text-center text-blue-600 dark:text-blue-400 mt-3 text-sm">
                        Total entries earned: +{shareHistory.reduce((sum, h) => sum + h.count, 0)}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  onClick={handleSkipAndCopy}
                  variant="outline"
                  className="w-full border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 py-3 rounded-2xl"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Just Copy Link Instead
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Verification */}
          {currentStep === 3 && (
            <div className="space-y-6 text-center">
              <div>
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                  Confirm Your Shares
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Confirm you've actually posted/shared on the selected platforms. False claims may result in disqualification.
                </p>
              </div>

              {/* Shared Platforms Summary */}
              <div className="space-y-4">
                {/* New Shares to Confirm */}
                {sharedPlatforms.size > 0 && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4">
                    <div className="font-medium text-slate-900 dark:text-slate-100 mb-3">
                      🆕 New Shares to Confirm:
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {Array.from(sharedPlatforms).map(platformId => {
                        const platform = socialPlatforms.find(p => p.id === platformId);
                        return platform ? (
                          <Badge key={platformId} className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-0">
                            {platform.icon} {platform.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400 mt-2">
                      +{sharedPlatforms.size} entr{sharedPlatforms.size !== 1 ? 'ies' : 'y'} (pending verification)
                    </div>
                  </div>
                )}
                
                {/* Previous Shares History (if any) */}
                {shareHistory.length > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4">
                    <div className="font-medium text-slate-900 dark:text-slate-100 mb-3">
                      📊 Your Sharing History:
                    </div>
                    <div className="space-y-2">
                      {socialPlatforms.map(platform => {
                        const status = getPlatformShareStatus(platform.id);
                        if (status.shareCount === 0) return null;
                        
                        return (
                          <div key={platform.id} className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-lg p-3">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{platform.icon}</span>
                              <div>
                                <div className="font-medium text-slate-700 dark:text-slate-300">
                                  {platform.name}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                  Last shared: {status.lastShared ? formatTimeAgo(status.lastShared) : 'Never'}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-0">
                                {status.shareCount}x shared
                              </Badge>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {status.canShare ? '✅ Ready' : `⏳ ${status.hoursUntilNext}h left`}
                              </div>
                            </div>
                          </div>
                        );
                      }).filter(Boolean)}
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-400 mt-3 text-center">
                      Total entries earned: +{shareHistory.reduce((sum, h) => sum + h.count, 0)}
                    </div>
                  </div>
                )}
              </div>

              <Button 
                onClick={handleVerifyShares}
                disabled={isVerifying || sharedPlatforms.size === 0}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-2xl font-bold border-0 disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Verifying Shares...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    I Confirm I Shared ({sharedPlatforms.size} entr{sharedPlatforms.size !== 1 ? 'ies' : 'y'})
                  </>
                )}
              </Button>

              <Button 
                onClick={() => setCurrentStep(2)}
                variant="outline"
                className="w-full border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 py-3 rounded-2xl"
              >
                Share on More Platforms
              </Button>
              
              {/* Integrity Warning */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-xl p-3 mt-4">
                <p className="text-xs text-yellow-800 dark:text-yellow-200 text-center">
                  ⚠️ Only confirm if you actually shared! We may verify shares and remove entries for false claims.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}