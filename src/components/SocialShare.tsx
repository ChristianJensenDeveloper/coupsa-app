import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner@2.0.3';
import { 
  Share2, 
  Copy, 
  Mail, 
  MessageCircle,
  X,
  Camera,
  Twitter,
  Linkedin,
  Facebook,
  Send,
  User,
  Play,
  Phone
} from 'lucide-react';
import { Coupon } from './types';

interface SocialShareProps {
  isOpen: boolean;
  onClose: () => void;
  deal: Coupon;
  userName?: string;
}

export function SocialShare({ isOpen, onClose, deal, userName = "a trader" }: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  // Generate share URL with referral tracking
  const shareUrl = `https://reduzed.com/deal/${deal.id}?ref=${encodeURIComponent(userName || 'reduzed')}`;
  
  // Share text templates
  const shareText = `🔥 Found an amazing ${deal.category.toLowerCase()} deal on REDUZED!\n\n💰 ${deal.title}\n🏷️ ${deal.discount}\n🏢 ${deal.merchant}\n\nCheck it out:`;
  
  const emailSubject = `Amazing ${deal.category} Deal: ${deal.discount} off ${deal.merchant}`;
  const emailBody = `Hi there!\n\nI found this incredible ${deal.category.toLowerCase()} deal on REDUZED and thought you'd be interested:\n\n${deal.title}\n${deal.discount} from ${deal.merchant}\n\n${deal.description}\n\nCheck it out here: ${shareUrl}\n\nHappy trading!\n${userName === 'a trader' ? 'Your friend' : userName}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleSocialShare = (platform: string) => {
    let url = '';
    
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}&hashtags=PropTradingDeals,TradingDiscounts,REDUZED`;
        break;
      case 'instagram':
        // Instagram doesn't support direct URL sharing, so copy text and open Instagram
        navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`).then(() => {
          toast.success('Text copied! Now paste it in Instagram');
          // Open Instagram mobile app if available, otherwise web
          const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
          const isAndroid = /Android/.test(navigator.userAgent);
          
          if (isIOS) {
            window.open('instagram://camera', '_blank');
          } else if (isAndroid) {
            window.open('intent://camera#Intent;package=com.instagram.android;scheme=instagram;end', '_blank');
          } else {
            window.open('https://www.instagram.com/', '_blank');
          }
        }).catch(() => {
          toast.error('Failed to copy text for Instagram');
        });
        return; // Don't proceed with URL opening
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(shareText)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
        break;
      case 'discord':
        // Discord doesn't support direct URL sharing, so copy text and show instructions
        navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`).then(() => {
          toast.success('Text copied! Now paste it in Discord');
          // Open Discord web app
          window.open('https://discord.com/channels/@me', '_blank');
        }).catch(() => {
          toast.error('Failed to copy text for Discord');
        });
        return; // Don't proceed with URL opening
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;
        break;
      case 'telegram':
        url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        break;
      case 'email':
        url = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        break;
      case 'sms':
        url = `sms:?body=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;
        break;
      case 'youtube':
        // YouTube doesn't support direct URL sharing, so copy text and open YouTube
        navigator.clipboard.writeText(`${shareText}\\n\\n${shareUrl}`).then(() => {
          toast.success('Text copied! Now paste it in YouTube');
          window.open('https://www.youtube.com/upload', '_blank');
        }).catch(() => {
          toast.error('Failed to copy text for YouTube');
        });
        return; // Don't proceed with URL opening
      case 'snapchat':
        // Snapchat doesn't support direct URL sharing, so copy text and open Snapchat
        navigator.clipboard.writeText(`${shareText}\\n\\n${shareUrl}`).then(() => {
          toast.success('Text copied! Now paste it in Snapchat');
          // Open Snapchat mobile app if available, otherwise web
          const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
          const isAndroid = /Android/.test(navigator.userAgent);
          
          if (isIOS) {
            window.open('snapchat://camera', '_blank');
          } else if (isAndroid) {
            window.open('intent://camera#Intent;package=com.snapchat.android;scheme=snapchat;end', '_blank');
          } else {
            window.open('https://web.snapchat.com/', '_blank');
          }
        }).catch(() => {
          toast.error('Failed to copy text for Snapchat');
        });
        return; // Don't proceed with URL opening
      case 'viber':
        url = `viber://forward?text=${encodeURIComponent(`${shareText}\\n${shareUrl}`)}`;
        // Fallback to web if Viber app not available
        setTimeout(() => {
          window.open(`https://www.viber.com/`, '_blank');
        }, 500);
        break;
      case 'wechat':
        // WeChat doesn't support direct URL sharing, so copy text and open WeChat
        navigator.clipboard.writeText(`${shareText}\\n\\n${shareUrl}`).then(() => {
          toast.success('Text copied! Now paste it in WeChat');
          // Try to open WeChat mobile app if available, otherwise show instructions
          const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
          const isAndroid = /Android/.test(navigator.userAgent);
          
          if (isIOS) {
            window.open('weixin://', '_blank');
          } else if (isAndroid) {
            window.open('intent://launch#Intent;package=com.tencent.mm;scheme=weixin;end', '_blank');
          } else {
            toast.info('Open WeChat app and paste the copied text');
          }
        }).catch(() => {
          toast.error('Failed to copy text for WeChat');
        });
        return; // Don't proceed with URL opening
      case 'line':
        url = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        break;
    }
    
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
      toast.success(`Shared to ${platform}!`);
    }
  };

  const socialButtons = [
    {
      name: 'Instagram',
      platform: 'instagram',
      icon: Camera,
      description: 'Story & posts'
    },
    {
      name: 'Facebook',
      platform: 'facebook',
      icon: Facebook,
      description: 'Share with friends'
    },
    {
      name: 'WeChat',
      platform: 'wechat',
      icon: MessageCircle,
      description: 'Share moments'
    },
    {
      name: 'YouTube',
      platform: 'youtube',
      icon: Play,
      description: 'Create videos'
    },
    {
      name: 'Snapchat',
      platform: 'snapchat',
      icon: Camera,
      description: 'Share snaps'
    },
    {
      name: 'Twitter',
      platform: 'twitter',
      icon: Twitter,
      description: 'Share with traders'
    },
    {
      name: 'Viber',
      platform: 'viber',
      icon: Phone,
      description: 'Message contacts'
    },
    {
      name: 'WhatsApp',
      platform: 'whatsapp',
      icon: MessageCircle,
      description: 'Message friends'
    },
    {
      name: 'LinkedIn',
      platform: 'linkedin', 
      icon: Linkedin,
      description: 'Professional network'
    },
    {
      name: 'Telegram',
      platform: 'telegram',
      icon: Send,
      description: 'Share instantly'
    },
    {
      name: 'LINE',
      platform: 'line',
      icon: MessageCircle,
      description: 'Share instantly'
    }
  ];

  const quickActions = [
    {
      name: 'Copy Link',
      action: handleCopyLink,
      icon: Copy,
      description: 'Share anywhere'
    },
    {
      name: 'Email',
      action: () => handleSocialShare('email'),
      icon: Mail,
      description: 'Send via email'
    },
    {
      name: 'SMS',
      action: () => handleSocialShare('sms'),
      icon: MessageCircle,
      description: 'Text message'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm border-0 shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl rounded-3xl overflow-hidden p-0 max-h-[90vh] overflow-y-auto [&>button]:hidden">
        {/* Modern Blue Header */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 px-5 pt-6 pb-4 relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute top-6 -left-4 w-16 h-16 bg-white/5 rounded-full blur-xl animate-pulse delay-700"></div>
            <div className="absolute bottom-2 right-6 w-12 h-12 bg-white/10 rounded-full blur-xl animate-pulse delay-1000"></div>
          </div>
          
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-white/30">
                <Share2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-white mb-1 leading-tight">
                  Share This Deal
                </DialogTitle>
                <DialogDescription className="text-white/90 text-sm">
                  Spread the savings with others
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="rounded-xl w-10 h-10 p-0 hover:bg-white/20 dark:hover:bg-white/10 backdrop-blur-sm border border-white/20 transition-all duration-200 hover:scale-110 relative z-10"
            >
              <X className="w-5 h-5 text-white" />
            </Button>
          </div>
        </div>

        {/* Deal Preview Card */}
        <div className="mx-5 -mt-2 mb-5">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl rounded-2xl border border-white/40 dark:border-slate-700/60 shadow-xl shadow-black/10 overflow-hidden">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 px-4 py-4 border-b border-blue-200/30 dark:border-blue-700/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {deal.merchant.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {deal.merchant}
                    </div>
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs px-3 py-1 rounded-full font-bold shadow-sm mt-1">
                      {deal.discount}
                    </div>
                  </div>
                </div>
                {deal.hasVerificationBadge && (
                  <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 p-2 rounded-xl shadow-sm">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="text-slate-800 dark:text-slate-200 font-medium text-sm leading-relaxed">
                {deal.title}
              </div>
            </div>
          </div>
        </div>

        {/* URL Copy Section */}
        <div className="mx-5 mb-5">
          <div className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-2xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-4 shadow-lg">
            <label className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 block tracking-wide flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Share Link
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  value={shareUrl}
                  readOnly
                  className="bg-white dark:bg-slate-800 border-slate-300/50 dark:border-slate-600/50 rounded-xl pr-20 text-xs font-mono backdrop-blur-sm shadow-inner h-10"
                />
                <Button
                  onClick={handleCopyLink}
                  size="sm"
                  className={`absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg text-xs font-bold transition-all duration-300 shadow-md hover:scale-105 ${
                    copied 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-green-500/30' 
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-blue-500/30'
                  }`}
                >
                  {copied ? '✓ Done' : <Copy className="w-3 h-3" />}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mx-5 mb-5">
          <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 tracking-wide flex items-center gap-2">
            <div className="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
            Quick Share
          </h4>
          <div className="grid grid-cols-3 gap-3">
            {quickActions.map((action, index) => {
              const gradients = [
                'from-blue-500 to-blue-600',
                'from-blue-600 to-indigo-600', 
                'from-indigo-500 to-blue-500'
              ];
              return (
                <Button
                  key={action.name}
                  onClick={action.action}
                  className={`bg-gradient-to-br ${gradients[index]} hover:scale-105 text-white rounded-2xl p-4 h-auto flex flex-col items-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300 border-0 group relative overflow-hidden`}
                >
                  {/* Subtle shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm relative z-10">
                    <action.icon className="w-5 h-5" />
                  </div>
                  <div className="text-center relative z-10">
                    <div className="text-xs font-bold">{action.name}</div>
                    <div className="text-xs opacity-90 mt-0.5">{action.description}</div>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Social Media Grid */}
        <div className="mx-5 mb-6">
          <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 tracking-wide flex items-center gap-2">
            <div className="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
            Social Platforms
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {socialButtons.map((social, index) => {
              const platformColors = {
                instagram: 'from-pink-500 via-purple-500 to-indigo-500',
                facebook: 'from-blue-700 to-blue-800',
                wechat: 'from-green-500 to-green-600',
                youtube: 'from-red-600 to-red-700',
                snapchat: 'from-yellow-400 to-yellow-500',
                twitter: 'from-gray-800 to-black',
                viber: 'from-purple-600 to-purple-700',
                whatsapp: 'from-green-500 to-emerald-600',
                linkedin: 'from-blue-600 to-blue-800',
                telegram: 'from-sky-500 to-blue-500',
                line: 'from-green-600 to-green-700'
              };
              return (
                <Button
                  key={social.platform}
                  onClick={() => handleSocialShare(social.platform)}
                  className={`bg-gradient-to-br ${platformColors[social.platform as keyof typeof platformColors] || 'from-slate-600 to-slate-800'} hover:scale-[1.02] text-white rounded-xl p-2.5 h-auto flex items-center gap-2.5 shadow-lg hover:shadow-xl transition-all duration-300 border-0 group relative overflow-hidden`}
                >
                  {/* Subtle shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm relative z-10">
                    <social.icon className="w-4 h-4" />
                  </div>
                  <div className="text-left flex-1 relative z-10">
                    <div className="text-xs font-bold">{social.name}</div>
                    <div className="text-xs opacity-90 truncate">{social.description}</div>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}