import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Mail, MessageCircle, MessageSquare, Twitter, Instagram, Globe, ExternalLink } from "lucide-react";

export function Contact() {
  const handleSocialClick = (platform: string, url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleEmailClick = () => {
    window.open('mailto:support@coupsa.com', '_blank');
  };

  const socialChannels = [
    {
      name: 'Twitter',
      handle: '@COUPSADeals',
      description: 'Latest deals & updates',
      url: 'https://twitter.com/coupsadeals',
      icon: Twitter,
      color: 'text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-700/30'
    },
    {
      name: 'Instagram',
      handle: '@coupsa_deals',
      description: 'Visual deal highlights',
      url: 'https://instagram.com/coupsa_deals',
      icon: Instagram,
      color: 'text-pink-500',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20',
      borderColor: 'border-pink-200 dark:border-pink-700/30'
    }
  ];

  const supportChannels = [
    {
      title: 'Email Support',
      description: 'General inquiries & support',
      contact: 'support@coupsa.com',
      action: 'Send Email',
      icon: Mail,
      color: 'text-green-600',
      onClick: () => handleEmailClick()
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-700/30 shadow-lg p-6 text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Contact COUPSA
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          Connect with us on social media or reach out for support
        </p>
      </div>

      {/* Social Media Channels */}
      <div className="space-y-4">
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-700/30 shadow-lg p-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-2">
              <MessageSquare className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              Follow Us
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Follow us on social media for the latest deals and updates
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {socialChannels.map((channel, index) => {
              const IconComponent = channel.icon;
              return (
                <div
                  key={index}
                  className={`${channel.bgColor} ${channel.borderColor} rounded-xl border p-4 hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-[1.02]`}
                  onClick={() => handleSocialClick(channel.name, channel.url)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center shadow-sm">
                        <IconComponent className={`w-5 h-5 ${channel.color}`} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                          {channel.name}
                        </h4>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        {channel.handle}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {channel.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Support Channels */}
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-700/30 shadow-lg p-6">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-2">
            <Mail className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            Get Support
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Need help? Our team is here to assist you
          </p>
        </div>

        <div className="space-y-4">
          {supportChannels.map((support, index) => {
            const IconComponent = support.icon;
            return (
              <div
                key={index}
                className="bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50 p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-lg flex items-center justify-center shadow-sm">
                      <IconComponent className={`w-5 h-5 ${support.color}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                        {support.title}
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {support.description}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                        {support.contact}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={support.onClick}
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    {support.action}
                    <ExternalLink className="w-3 h-3 ml-2" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-900/50 p-6">
        <div className="text-center">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Join Our Community
          </h4>
          <p className="text-sm text-blue-500 dark:text-blue-400 mb-4 leading-relaxed">
            Follow us on Twitter and Instagram for instant deal alerts, trading tips, and updates.
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-blue-500 dark:text-blue-400">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Deal Alerts</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Prop Updates</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>New Offers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}