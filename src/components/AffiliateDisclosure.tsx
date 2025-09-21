import { Info, ExternalLink } from "lucide-react";
import { Badge } from "./ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface AffiliateDisclosureProps {
  variant?: 'inline' | 'compact' | 'detailed';
  className?: string;
  showTooltip?: boolean;
}

export function AffiliateDisclosure({ 
  variant = 'inline', 
  className = '',
  showTooltip = true 
}: AffiliateDisclosureProps) {
  
  const baseContent = (
    <div className={`${className}`}>
      {variant === 'detailed' && (
        <div className="bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/30 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
              <p className="font-medium mb-1">FTC Disclosure</p>
              <p>
                KOOCAO may earn a commission when you click links or use codes to complete purchases. 
                This helps us keep the service free while connecting you with verified deals.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {variant === 'compact' && (
        <div className="flex items-center gap-1.5 mb-2">
          <Badge variant="outline" className="text-xs px-2 py-1 bg-blue-50/50 dark:bg-blue-900/20 border-blue-200/50 dark:border-blue-800/30 text-blue-700 dark:text-blue-300">
            <ExternalLink className="w-3 h-3 mr-1" />
            Affiliate Link
          </Badge>
        </div>
      )}
      
      {variant === 'inline' && (
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-2">
          <ExternalLink className="w-3 h-3" />
          <span>Affiliate link - KOOCAO may earn commission</span>
        </div>
      )}
    </div>
  );

  if (!showTooltip || variant === 'detailed') {
    return baseContent;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {baseContent}
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs p-3 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg">
          <div className="space-y-1">
            <p className="font-medium text-slate-900 dark:text-slate-100">FTC Disclosure</p>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              KOOCAO earns commission when you use our affiliate links. This helps keep our service free while you get verified deals.
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Standalone component for terms/legal pages
export function DetailedAffiliateDisclosure() {
  return (
    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 my-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Affiliate Relationship Disclosure
          </h3>
          <div className="text-sm text-slate-600 dark:text-slate-400 space-y-3 leading-relaxed">
            <p>
              <strong>Important:</strong> KOOCAO participates in affiliate marketing programs with prop trading firms, brokers, and other financial service providers featured on our platform.
            </p>
            <p>
              When you click on affiliate links or use promotional codes provided by KOOCAO, we may receive a commission from the partner company at no additional cost to you. These commissions help us:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Keep our deal-finding service completely free for users</li>
              <li>Maintain and improve our platform</li>
              <li>Verify and curate high-quality deals</li>
              <li>Provide customer support</li>
            </ul>
            <p>
              Our affiliate relationships do not influence the deals we feature or our editorial recommendations. We only partner with companies we believe offer genuine value to traders and investors.
            </p>
            <p>
              <strong>Transparency:</strong> All affiliate links and promotional content are clearly marked throughout our platform in compliance with FTC guidelines.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}