import { useState } from 'react';
import { Button } from './ui/button';
import { Share2, ExternalLink } from 'lucide-react';
import { SocialShare } from './SocialShare';
import { Coupon } from './types';

interface ShareButtonProps {
  deal: Coupon;
  userName?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
  isAuthenticated?: boolean;
  onLoginRequired?: () => void;
}

export function ShareButton({ 
  deal, 
  userName,
  variant = 'outline', 
  size = 'sm',
  className = '',
  showText = true,
  isAuthenticated = false,
  onLoginRequired
}: ShareButtonProps) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const handleShare = () => {
    // Allow sharing regardless of authentication status
    setIsShareModalOpen(true);
  };

  const buttonSizes = {
    sm: 'h-8 px-3',
    md: 'h-10 px-4', 
    lg: 'h-12 px-6'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  if (variant === 'icon') {
    return (
      <>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          className={`rounded-xl p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-all duration-200 hover:scale-110 ${className}`}
        >
          <Share2 className={iconSizes[size]} />
        </Button>
        
        <SocialShare
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          deal={deal}
          userName={userName}
        />
      </>
    );
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleShare}
        className={`rounded-xl ${buttonSizes[size]} flex items-center gap-2 transition-all duration-200 hover:scale-105 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 ${className}`}
      >
        <Share2 className={iconSizes[size]} />
        {showText && <span>Share</span>}
      </Button>
      
      <SocialShare
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        deal={deal}
        userName={userName}
      />
    </>
  );
}