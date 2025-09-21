import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { Share2, Trophy, Clock, Copy, ExternalLink, Users, Gift, Crown, Medal, Award, Mail, ChevronDown, ChevronUp, Zap } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { SocialShareModal } from "./SocialShareModal";

// Types for giveaways
interface Giveaway {
  id: string;
  title: string;
  prize: string;
  description: string;
  firm?: string;
  logoUrl?: string;
  imageUrl?: string;
  bannerUrl?: string; // New banner image field
  status: 'running' | 'selecting-winner' | 'finished';
  startDate: string;
  endDate: string;
  finishedDate?: string;
  totalEntries: number;
  totalParticipants: number;
  userEntries?: number;
  userRank?: number;
  winner?: {
    name: string; // Anonymized like "Mark from Texas"
    entries: number;
  };
  shareUrl?: string;
  rules: string;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  entries: number;
  avatar?: string;
  country?: string;
  isCurrentUser?: boolean;
}

interface ShareHistory {
  platformId: string;
  timestamp: number;
  count: number;
}

// Mock data for giveaways
const mockGiveaways: Giveaway[] = [
  {
    id: '1',
    title: 'FTMO $100k Challenge',
    prize: '$100k Challenge FREE',
    description: 'Win a free FTMO $100k challenge. No purchase required, just share to enter and earn additional entries.',
    firm: 'FTMO',
    logoUrl: 'https://images.unsplash.com/photo-1642310290564-30033ff60334?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wYW55JTIwbG9nbyUyMHByb2Zlc3Npb25hbCUyMGZpbmFuY2V8ZW58MXx8fHwxNzU2NTQ2Nzg0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'running',
    startDate: '2025-09-01T00:00:00Z',
    endDate: '2025-09-15T23:59:59Z',
    totalEntries: 2847,
    totalParticipants: 1256,
    userEntries: 12,
    userRank: 47,
    shareUrl: 'https://coopung.com/giveaway/ftmo-100k',
    rules: 'Must be 18+ years old. One entry per person. Winner will be selected randomly. Prize must be claimed within 30 days. COOPUNG is not affiliated with FTMO - this is our own promotional giveaway.'
  },
  {
    id: '4',
    title: 'Apex Trader $200k Account',
    prize: '$200k Funded Account FREE',
    description: 'Win a fully funded $200k Apex Trader account with 90% profit split. The biggest giveaway of the year!',
    firm: 'Apex Trader',
    logoUrl: 'https://images.unsplash.com/photo-1664948962404-e699cfda2f80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGxvZ28lMjB0cmFkaW5nJTIwY29tcGFueXxlbnwxfHx8fDE3NTY1NDY3ODh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'running',
    startDate: '2025-09-05T00:00:00Z',
    endDate: '2025-09-20T23:59:59Z',
    totalEntries: 4521,
    totalParticipants: 2187,
    userEntries: 8,
    userRank: 89,
    shareUrl: 'https://coopung.com/giveaway/apex-200k',
    rules: 'Must be 18+ years old. One entry per person. Winner will be selected randomly from all valid entries. Account includes 90% profit split and monthly scaling opportunities. Prize must be claimed within 30 days.'
  },
  {
    id: '2',
    title: 'MyFundedFX $50k Account',
    prize: '$50k Funded Account',
    description: 'Win a fully funded $50k trading account with MyFundedFX. 80% profit split included.',
    firm: 'MyFundedFX',
    logoUrl: 'https://images.unsplash.com/photo-1588651157380-74fdc94da88a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaW50ZWNoJTIwc3RhcnR1cCUyMGxvZ28lMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzU2NTQ2Nzk0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'selecting-winner',
    startDate: '2024-12-15T00:00:00Z',
    endDate: '2024-12-31T23:59:59Z',
    totalEntries: 4521,
    totalParticipants: 1876,
    userEntries: 24,
    userRank: 123,
    shareUrl: 'https://coopung.com/giveaway/myfundedfx-50k',
    rules: 'Winner will receive a fully funded $50k account with 80% profit split. Must pass our basic trading assessment. Account includes monthly salary and scaling opportunities.'
  },
  {
    id: '3',
    title: 'TopStep Trading Package',
    prize: 'Free Combine + Reset',
    description: 'Complete TopStep trading package including Trader Combine and one free reset if needed.',
    firm: 'TopStep',
    logoUrl: 'https://images.unsplash.com/photo-1660071155921-7204712d7d1a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFkaW5nJTIwcGxhdGZvcm0lMjBsb2dvJTIwYnJhbmR8ZW58MXx8fHwxNzU2NTQ2ODAyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'finished',
    startDate: '2024-11-01T00:00:00Z',
    endDate: '2024-11-30T23:59:59Z',
    finishedDate: '2024-12-01T12:00:00Z',
    totalEntries: 3124,
    totalParticipants: 1543,
    winner: {
      name: 'Alex from California',
      entries: 45
    },
    shareUrl: 'https://coopung.com/giveaway/topstep-package',
    rules: 'Winner receives free Trader Combine access plus one reset. Must be used within 6 months of winning. Cannot be transferred or exchanged for cash value.'
  }
];

interface GiveawaysProps {
  user: any;
  onLoginRequired: () => void;
}

export function Giveaways({ user, onLoginRequired }: GiveawaysProps) {
  const [giveaways, setGiveaways] = useState<Giveaway[]>(mockGiveaways);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState<'active' | 'expired'>('active');
  const [expandedGiveaways, setExpandedGiveaways] = useState<Set<string>>(new Set());
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedGiveaway, setSelectedGiveaway] = useState<Giveaway | null>(null);
  
  // Track sharing history per giveaway with timestamps: giveawayId -> ShareHistory[]
  const [sharingHistory, setSharingHistory] = useState<Map<string, ShareHistory[]>>(() => {
    // Demo data: user has already shared giveaway '1' on Facebook and Twitter with timestamps
    const demoHistory = new Map();
    if (user) {
      const now = Date.now();
      // Simulate user shared on Facebook 2 hours ago and Twitter 5 hours ago
      demoHistory.set('1', [
        { platformId: 'facebook', timestamp: now - (2 * 60 * 60 * 1000), count: 1 },
        { platformId: 'twitter', timestamp: now - (5 * 60 * 60 * 1000), count: 1 }
      ]);
    }
    return demoHistory;
  });

  // Update time every second for countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Function to get actual status based on dates
  const getActualStatus = (giveaway: Giveaway): Giveaway['status'] => {
    try {
      const now = currentTime.getTime();
      const endDate = new Date(giveaway.endDate).getTime();
      const startDate = new Date(giveaway.startDate).getTime();

      if (giveaway.status === 'finished') return 'finished';
      if (now < startDate) return 'running'; // Not started yet, but show as running
      if (now > endDate && giveaway.status !== 'finished') return 'selecting-winner';
      return giveaway.status;
    } catch (error) {
      console.error('Error in getActualStatus:', error);
      return giveaway.status; // fallback to original status
    }
  };

  // Countdown calculation
  const getCountdown = (endDate: string, status: Giveaway['status']) => {
    const defaultReturn = { days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: true, isUrgent: false };
    
    if (status !== 'running') return defaultReturn;
    
    try {
      const now = currentTime.getTime();
      const end = new Date(endDate).getTime();
      const timeDiff = end - now;

      if (timeDiff <= 0) {
        return defaultReturn;
      }

      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

      // Urgent if less than 24 hours remaining
      const isUrgent = timeDiff < (24 * 60 * 60 * 1000);

      return { days, hours, minutes, seconds, isEnded: false, isUrgent };
    } catch (error) {
      console.error('Error in getCountdown:', error);
      return defaultReturn;
    }
  };

  const handleEnterAndShare = (giveaway: Giveaway) => {
    if (!user) {
      onLoginRequired();
      return;
    }

    // Open the social share modal
    setSelectedGiveaway(giveaway);
    setShareModalOpen(true);
  };

  const handleShareComplete = (platform: string) => {
    if (!selectedGiveaway) return;

    // Update sharing history for this giveaway with timestamp
    setSharingHistory(prev => {
      const newHistory = new Map(prev);
      const giveawayShares = newHistory.get(selectedGiveaway.id) || [];
      
      // Check if this platform has been shared recently (within 24 hours)
      const now = Date.now();
      const recentShare = giveawayShares.find(share => 
        share.platformId === platform && 
        (now - share.timestamp) < (24 * 60 * 60 * 1000)
      );
      
      if (!recentShare) {
        // Add new share or update existing platform share count
        const existingShareIndex = giveawayShares.findIndex(share => share.platformId === platform);
        
        if (existingShareIndex >= 0) {
          // Update existing platform share
          giveawayShares[existingShareIndex] = {
            ...giveawayShares[existingShareIndex],
            timestamp: now,
            count: giveawayShares[existingShareIndex].count + 1
          };
        } else {
          // Add new platform share
          giveawayShares.push({
            platformId: platform,
            timestamp: now,
            count: 1
          });
        }
        
        newHistory.set(selectedGiveaway.id, giveawayShares);
        
        // Award entry for each successful share
        setGiveaways(prevGiveaways => 
          prevGiveaways.map(g => 
            g.id === selectedGiveaway.id 
              ? { 
                  ...g, 
                  userEntries: (g.userEntries || 0) + 1,
                  totalEntries: g.totalEntries + 1,
                  // Simulate improved rank
                  userRank: Math.max(1, (g.userRank || 100) - Math.floor(Math.random() * 10))
                }
              : g
          )
        );
      } else {
        // Platform recently shared for this giveaway - this should be handled by the modal
        toast.info(`You recently shared this giveaway on ${platform}! Wait 24 hours to share again.`);
      }
      
      return newHistory;
    });
  };

  const toggleExpanded = (giveawayId: string) => {
    setExpandedGiveaways(prev => {
      const newSet = new Set(prev);
      if (newSet.has(giveawayId)) {
        newSet.delete(giveawayId);
      } else {
        newSet.add(giveawayId);
      }
      return newSet;
    });
  };

  const renderGiveawayCard = (giveaway: Giveaway) => {
    const displayGiveaway = {
      ...giveaway,
      status: getActualStatus(giveaway)
    };
    
    const isExpanded = expandedGiveaways.has(displayGiveaway.id);
    
    return (
      <div 
        key={displayGiveaway.id} 
        className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-white/30 dark:border-slate-700/30 shadow-xl shadow-black/5 overflow-hidden"
      >
        <div className="p-6 space-y-6">
          {/* Header - EXACT frontpage style */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl shadow-sm flex items-center justify-center p-2 flex-shrink-0">
                {displayGiveaway.logoUrl ? (
                  <img 
                    src={displayGiveaway.logoUrl} 
                    alt={displayGiveaway.firm} 
                    className="w-full h-full object-contain" 
                  />
                ) : (
                  <Trophy className="w-6 h-6 text-blue-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
                  {displayGiveaway.title}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {displayGiveaway.prize}
                </div>
              </div>
            </div>
            
            {/* Status Badge */}
            <Badge 
              className={`
                ${displayGiveaway.status === 'running' ? 'bg-green-500 hover:bg-green-500' : ''}
                ${displayGiveaway.status === 'selecting-winner' ? 'bg-blue-500 hover:bg-blue-500' : ''}
                ${displayGiveaway.status === 'finished' ? 'bg-slate-500 hover:bg-slate-500' : ''}
                text-white border-0 text-xs px-3 py-1 flex-shrink-0
              `}
            >
              {displayGiveaway.status === 'running' && 'LIVE'}
              {displayGiveaway.status === 'selecting-winner' && 'SELECTING WINNER'}
              {displayGiveaway.status === 'finished' && 'FINISHED'}
            </Badge>
          </div>

          {/* RUNNING GIVEAWAYS */}
          {displayGiveaway.status === 'running' && (() => {
            const countdown = getCountdown(displayGiveaway.endDate, displayGiveaway.status);
            return (
              <div className="space-y-4">
                {/* Countdown Timer - Light minimal style */}
                {!countdown.isEnded && (
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-4 text-center border border-slate-200/50 dark:border-slate-700/30">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">Expires in</span>
                    </div>
                    
                    {/* Clean countdown style */}
                    <div className="flex items-center justify-center gap-3">
                      {countdown.days > 0 && (
                        <div className="text-center">
                          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{countdown.days}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">days</div>
                        </div>
                      )}
                      {countdown.days > 0 && <div className="text-slate-300 dark:text-slate-600">•</div>}
                      <div className="text-center">
                        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{countdown.hours.toString().padStart(2, '0')}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">hours</div>
                      </div>
                      <div className="text-slate-300 dark:text-slate-600">•</div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{countdown.minutes.toString().padStart(2, '0')}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">minutes</div>
                      </div>
                      <div className="text-slate-300 dark:text-slate-600">•</div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{countdown.seconds.toString().padStart(2, '0')}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">sec</div>
                      </div>
                    </div>
                  </div>
                )}



                {/* Main CTA Button - EXACT frontpage style */}
                <Button 
                  onClick={() => handleEnterAndShare(displayGiveaway)}
                  size="lg"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white border-0 py-4 rounded-3xl font-bold"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  {user ? (
                    displayGiveaway.userEntries ? 'SHARE ON SOCIAL FOR +1 ENTRY' : 'ENTER GIVEAWAY & SHARE'
                  ) : (
                    'CLAIM YOUR FREE ENTRY'
                  )}
                </Button>

                {/* Sharing Help Text */}
                {user && (
                  <div className="text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      💡 Share = +1 entry • More shares = better odds!
                    </p>
                  </div>
                )}

                {/* User Stats (if entered) OR Browse message (if not logged in) */}
                {user && displayGiveaway.userEntries ? (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-3xl p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-blue-700 dark:text-blue-300">
                        Your Entries: <span className="font-bold">{displayGiveaway.userEntries}</span>
                      </span>
                      <span className="text-blue-700 dark:text-blue-300">
                        Rank: <span className="font-bold">#{displayGiveaway.userRank}</span>
                      </span>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })()}

          {/* SELECTING WINNER */}
          {displayGiveaway.status === 'selecting-winner' && (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-3xl p-6 text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div className="font-bold text-blue-700 dark:text-blue-300 mb-2">
                  🎯 Selecting Winner
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  Entries closed • Announcement coming soon
                </div>
              </div>
              
              {user && displayGiveaway.userEntries && (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Trophy className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Your Final Stats
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-4 text-sm">
                    <span className="text-slate-600 dark:text-slate-400">
                      <span className="font-bold">{displayGiveaway.userEntries}</span> entries
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600 dark:text-slate-400">
                      Rank <span className="font-bold">#{displayGiveaway.userRank}</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* FINISHED */}
          {displayGiveaway.status === 'finished' && displayGiveaway.winner && (
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-3xl p-6 text-center">
              <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div className="font-bold text-amber-700 dark:text-amber-300 mb-2">
                🏆 Winner: {displayGiveaway.winner.name}
              </div>
              {displayGiveaway.finishedDate && (
                <div className="text-sm text-amber-600 dark:text-amber-400">
                  Announced on {new Date(displayGiveaway.finishedDate).toLocaleDateString()}
                </div>
              )}
            </div>
          )}

          {/* Expandable Details Section - EXACT frontpage style */}
          <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(displayGiveaway.id)}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-between rounded-3xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 py-4"
              >
                <span>
                  {isExpanded ? 'Hide Details' : 'View Details'}
                </span>
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-4 pt-4">
              {/* Description */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6">
                <div className="font-bold text-slate-900 dark:text-slate-100 mb-3">About This Giveaway</div>
                <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {displayGiveaway.description}
                </div>
              </div>

              {/* Winner Notification */}  
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-3xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Mail className="w-4 h-4 text-blue-500" />
                  <span className="font-bold text-blue-700 dark:text-blue-300">Winner Notification</span>
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400 leading-relaxed">
                  Winners will be contacted directly by the COOPUNG team via email within 48 hours of giveaway completion. Make sure to check your inbox and spam folder regularly.
                </div>
              </div>

              {/* Rules */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6">
                <div className="font-bold text-slate-900 dark:text-slate-100 mb-3">Rules & Terms</div>
                <div className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {displayGiveaway.rules}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    );
  };

  // Filter giveaways based on category
  const filteredGiveaways = React.useMemo(() => {
    try {
      return giveaways.filter(giveaway => {
        const actualStatus = getActualStatus(giveaway);
        
        if (selectedCategory === 'active') {
          return actualStatus === 'running';
        } else {
          return actualStatus === 'selecting-winner' || actualStatus === 'finished';
        }
      });
    } catch (error) {
      console.error('Error filtering giveaways:', error);
      return giveaways; // fallback to show all giveaways
    }
  }, [giveaways, selectedCategory, currentTime]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-white/30 dark:border-slate-700/30 shadow-xl shadow-black/5 p-8 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
          Free Giveaways
        </h2>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          {!user ? (
            <>
              Browse free giveaways and see what's available. <button 
                onClick={onLoginRequired}
                className="font-medium text-blue-500 hover:text-blue-600 transition-colors underline cursor-pointer bg-transparent border-none p-0"
              >
                Sign up for free
              </button> to enter and win prop firm challenges & trading rewards.
            </>
          ) : (
            'Enter to win free prop firm challenges & trading rewards. Share to earn more entries and increase your chances of winning.'
          )}
        </p>
      </div>

      {/* Category Tabs */}
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-white/30 dark:border-slate-700/30 shadow-xl shadow-black/5 p-2">
        <div className="flex gap-2">
          <Button
            onClick={() => setSelectedCategory('active')}
            className={`flex-1 py-4 rounded-2xl font-semibold transition-all duration-200 ${
              selectedCategory === 'active'
                ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg'
                : 'bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-0'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Active ({giveaways.filter(g => getActualStatus(g) === 'running').length})
            </div>
          </Button>
          <Button
            onClick={() => setSelectedCategory('expired')}
            className={`flex-1 py-4 rounded-2xl font-semibold transition-all duration-200 ${
              selectedCategory === 'expired'
                ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg'
                : 'bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-0'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
              Expired ({giveaways.filter(g => {
                const status = getActualStatus(g);
                return status === 'selecting-winner' || status === 'finished';
              }).length})
            </div>
          </Button>
        </div>
      </div>

      {/* Giveaways Grid */}
      <div className="grid gap-8 max-w-2xl mx-auto">
        {filteredGiveaways.map(renderGiveawayCard)}
      </div>

      {/* Empty State */}
      {filteredGiveaways.length === 0 && (
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-white/30 dark:border-slate-700/30 shadow-xl shadow-black/5 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
            {selectedCategory === 'active' ? 'No Active Giveaways' : 'No Expired Giveaways'}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {selectedCategory === 'active' 
              ? "We're preparing exciting new giveaways for our community. Check back soon!"
              : "No finished or ended giveaways to show yet."
            }
          </p>
          <div className="flex gap-3 justify-center">
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="rounded-xl"
            >
              Refresh Page
            </Button>
            {selectedCategory === 'expired' && (
              <Button 
                onClick={() => setSelectedCategory('active')} 
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl border-0"
              >
                View Active Giveaways
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Social Share Modal */}
      {selectedGiveaway && (
        <SocialShareModal
          isOpen={shareModalOpen}
          onClose={() => {
            setShareModalOpen(false);
            setSelectedGiveaway(null);
          }}
          giveaway={selectedGiveaway}
          onShareComplete={handleShareComplete}
          shareHistory={sharingHistory.get(selectedGiveaway.id) || []}
        />
      )}
    </div>
  );
}