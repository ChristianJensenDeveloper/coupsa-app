import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Trophy, Medal, Star, Gift, Users, TrendingUp, Crown, Zap, Share2, Target } from 'lucide-react';

interface LeaderboardUser {
  id: string;
  name: string;
  shares: number;
  signups: number;
  rank: number;
  points: number;
  avatar?: string;
  badges: string[];
}

// Mock leaderboard data
const mockLeaderboard: LeaderboardUser[] = [
  {
    id: '1',
    name: 'TraderPro_Mike',
    shares: 127,
    signups: 23,
    rank: 1,
    points: 1850,
    badges: ['Top Sharer', 'Viral Champion', 'Deal Hunter']
  },
  {
    id: '2', 
    name: 'CryptoQueen_Sarah',
    shares: 98,
    signups: 18,
    rank: 2,
    points: 1540,
    badges: ['Rising Star', 'Deal Hunter']
  },
  {
    id: '3',
    name: 'PropTrader_Alex',
    shares: 89,
    signups: 15,
    rank: 3,
    points: 1320,
    badges: ['Consistent Sharer']
  },
  {
    id: '4',
    name: 'ForexMaster_John',
    shares: 76,
    signups: 12,
    rank: 4,
    points: 1180,
    badges: ['Deal Hunter']
  },
  {
    id: '5',
    name: 'You',
    shares: 12,
    signups: 3,
    rank: 47,
    points: 165,
    badges: ['New Sharer']
  }
];

const rewardTiers = [
  {
    name: 'Bronze Sharer',
    requirement: '10 shares',
    reward: 'COUPZA Pro badge',
    color: 'bg-amber-600',
    icon: <Medal className="w-5 h-5" />
  },
  {
    name: 'Silver Influencer', 
    requirement: '50 shares',
    reward: 'Early deal access',
    color: 'bg-slate-400',
    icon: <Star className="w-5 h-5" />
  },
  {
    name: 'Gold Ambassador',
    requirement: '100 shares',
    reward: 'Exclusive deals',
    color: 'bg-yellow-500',
    icon: <Trophy className="w-5 h-5" />
  },
  {
    name: 'Viral Champion',
    requirement: '25 signups',
    reward: 'Monthly deal credits',
    color: 'bg-purple-500',
    icon: <Crown className="w-5 h-5" />
  }
];

interface ShareLeaderboardProps {
  userStats?: {
    shares: number;
    signups: number;
    points: number;
    rank: number;
  };
}

export function ShareLeaderboard({ userStats }: ShareLeaderboardProps) {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'rewards'>('leaderboard');

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Trophy className="w-6 h-6 text-slate-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-slate-500">#{rank}</span>;
    }
  };

  const getBadgeColor = (badge: string) => {
    const colors = {
      'Top Sharer': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'Viral Champion': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      'Deal Hunter': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'Rising Star': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      'Consistent Sharer': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
      'New Sharer': 'bg-slate-100 text-slate-800 dark:bg-slate-800/30 dark:text-slate-300'
    };
    return colors[badge] || 'bg-slate-100 text-slate-800 dark:bg-slate-800/30 dark:text-slate-300';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/50 dark:border-slate-700/50 shadow-lg p-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <Share2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent mb-2">
            Share & Earn Rewards
          </h1>
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            Help fellow traders discover amazing deals and climb the leaderboard!
          </p>
        </div>
      </div>

      {/* User Stats */}
      {userStats && (
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/50 dark:border-slate-700/50 shadow-lg p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{userStats.shares}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Total Shares</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{userStats.signups}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Signups</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{userStats.points}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">#{userStats.rank}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Global Rank</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/50 dark:border-slate-700/50 shadow-lg overflow-hidden">
        <div className="flex">
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 px-6 py-4 text-center font-semibold transition-all duration-200 ${
              activeTab === 'leaderboard'
                ? 'bg-blue-500 text-white'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Trophy className="w-5 h-5 mx-auto mb-1" />
            Leaderboard
          </button>
          <button
            onClick={() => setActiveTab('rewards')}
            className={`flex-1 px-6 py-4 text-center font-semibold transition-all duration-200 ${
              activeTab === 'rewards'
                ? 'bg-blue-500 text-white'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Gift className="w-5 h-5 mx-auto mb-1" />
            Rewards
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'leaderboard' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Top Sharers This Month</h3>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <TrendingUp className="w-4 h-4" />
                  Updated live
                </div>
              </div>

              {mockLeaderboard.map((user, index) => (
                <div
                  key={user.id}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-200 hover:scale-[1.02] ${
                    user.name === 'You'
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 ring-2 ring-blue-200 dark:ring-blue-700/50'
                      : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {getRankIcon(user.rank)}
                  </div>

                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                    {user.name.charAt(0)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {user.name}
                      </span>
                      {user.name === 'You' && (
                        <Badge className="bg-blue-500 text-white text-xs">You</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                      <span>{user.shares} shares</span>
                      <span>{user.signups} signups</span>
                      <span>{user.points} points</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {user.badges.map((badge, badgeIndex) => (
                        <Badge
                          key={badgeIndex}
                          className={`text-xs ${getBadgeColor(badge)}`}
                        >
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {user.rank <= 3 && (
                    <div className="flex-shrink-0">
                      <Zap className="w-5 h-5 text-yellow-500 animate-pulse" />
                    </div>
                  )}
                </div>
              ))}

              <div className="text-center pt-4">
                <Button variant="outline" className="rounded-xl">
                  <Target className="w-4 h-4 mr-2" />
                  View Full Leaderboard
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'rewards' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Unlock Exclusive Rewards</h3>
                <p className="text-slate-600 dark:text-slate-400">Share deals to earn points and unlock amazing perks</p>
              </div>

              <div className="grid gap-4">
                {rewardTiers.map((tier, index) => (
                  <Card key={index} className="overflow-hidden border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 ${tier.color} rounded-xl flex items-center justify-center text-white shadow-md`}>
                          {tier.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">{tier.name}</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{tier.requirement}</p>
                          <div className="flex items-center gap-2">
                            <Gift className="w-4 h-4 text-green-500" />
                            <span className="text-sm font-medium text-green-700 dark:text-green-400">{tier.reward}</span>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <Button variant="outline" size="sm" className="rounded-xl">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200/50 dark:border-blue-700/30">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-3">How to Earn Points</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-blue-500" />
                    <span className="text-slate-700 dark:text-slate-300">5 points per share</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-500" />
                    <span className="text-slate-700 dark:text-slate-300">50 points per signup</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-purple-500" />
                    <span className="text-slate-700 dark:text-slate-300">Bonus for consistency</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}