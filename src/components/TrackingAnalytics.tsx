import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { 
  BarChart3, 
  Plus, 
  Eye, 
  Trash2, 
  GripVertical, 
  Code2, 
  Globe, 
  Shield, 
  Save,
  AlertTriangle,
  Check,
  Facebook,
  Twitter,
  Linkedin,
  Video
} from "lucide-react";
import { toast } from "sonner@2.0.3";

// Platform configuration
const PLATFORMS = {
  google_gtm: {
    name: 'Google Tag Manager',
    icon: Globe,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-700/30',
    idFormat: 'GTM-XXXXXX',
    description: 'Centralized tag management'
  },
  google_ga4: {
    name: 'Google Analytics 4',
    icon: BarChart3,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    borderColor: 'border-orange-200 dark:border-orange-700/30',
    idFormat: 'G-XXXXXXXXXX',
    description: 'Website analytics and insights'
  },
  meta_pixel: {
    name: 'Meta Pixel',
    icon: Facebook,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-700/30',
    idFormat: '1234567890123456',
    description: 'Facebook & Instagram advertising'
  },
  twitter_pixel: {
    name: 'X (Twitter) Pixel',
    icon: Twitter,
    color: 'text-slate-900',
    bgColor: 'bg-slate-50 dark:bg-slate-900/20',
    borderColor: 'border-slate-200 dark:border-slate-700/30',
    idFormat: 'o1234',
    description: 'X advertising and conversions'
  },
  linkedin_insight: {
    name: 'LinkedIn Insight Tag',
    icon: Linkedin,
    color: 'text-blue-800',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-700/30',
    idFormat: '12345',
    description: 'LinkedIn advertising insights'
  },
  tiktok_pixel: {
    name: 'TikTok Pixel',
    icon: Video,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50 dark:bg-pink-900/20',
    borderColor: 'border-pink-200 dark:border-pink-700/30',
    idFormat: 'C4A1B2C3D4E5F6',
    description: 'TikTok advertising and conversions'
  }
} as const;

type PlatformType = keyof typeof PLATFORMS;

interface TrackingCode {
  id: string;
  platform: PlatformType;
  mode: 'id' | 'snippet';
  value: string;
  placement: 'head' | 'body';
  load: 'async' | 'defer' | 'none';
  enabled: boolean;
  environments: ('dev' | 'staging' | 'prod')[];
  requiresConsent: boolean;
  order: number;
  lastModified: string;
  lastModifiedBy: string;
}

export function TrackingAnalytics() {
  // State management
  const [trackingCodes, setTrackingCodes] = useState<TrackingCode[]>([
    // Example tracking codes
    {
      id: '1',
      platform: 'google_gtm',
      mode: 'id',
      value: 'GTM-REDUZED01',
      placement: 'head',
      load: 'none',
      enabled: true,
      environments: ['prod', 'staging'],
      requiresConsent: false,
      order: 1,
      lastModified: '2025-01-02T10:30:00Z',
      lastModifiedBy: 'Admin'
    },
    {
      id: '2',
      platform: 'meta_pixel',
      mode: 'id',
      value: '1234567890123456',
      placement: 'head',
      load: 'async',
      enabled: true,
      environments: ['prod'],
      requiresConsent: true,
      order: 2,
      lastModified: '2025-01-02T09:15:00Z',
      lastModifiedBy: 'Marketing Team'
    }
  ]);
  
  const [useGTM, setUseGTM] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewCode, setPreviewCode] = useState<TrackingCode | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // New tracking code form state
  const [newCode, setNewCode] = useState<Partial<TrackingCode>>({
    platform: 'google_gtm',
    mode: 'id',
    value: '',
    placement: 'head',
    load: 'async',
    enabled: true,
    environments: ['prod'],
    requiresConsent: false
  });

  // Validation
  const validateTrackingCode = (code: Partial<TrackingCode>): string | null => {
    if (!code.value) return 'Value is required';
    
    if (code.mode === 'id') {
      // Basic pattern validation
      if (code.platform === 'google_gtm' && !code.value.startsWith('GTM-')) {
        return 'GTM ID must start with GTM-';
      }
      if (code.platform === 'google_ga4' && !code.value.startsWith('G-')) {
        return 'GA4 ID must start with G-';
      }
      if (code.platform === 'meta_pixel' && !/^\d{13,16}$/.test(code.value)) {
        return 'Meta Pixel ID must be 13-16 digits';
      }
      if (code.platform === 'tiktok_pixel' && !/^[A-Z0-9]{12,16}$/.test(code.value)) {
        return 'TikTok Pixel ID must be 12-16 alphanumeric characters';
      }
    }
    
    return null;
  };

  // Generate preview of tracking code
  const generatePreview = (code: TrackingCode): string => {
    if (code.mode === 'snippet') {
      return code.value;
    }
    
    // Generate basic tracking code based on platform
    switch (code.platform) {
      case 'google_gtm':
        return `<!-- Google Tag Manager -->
<script${code.load === 'async' ? ' async' : code.load === 'defer' ? ' defer' : ''}>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${code.value}');</script>
<!-- End Google Tag Manager -->`;

      case 'google_ga4':
        return `<!-- Google tag (gtag.js) -->
<script${code.load === 'async' ? ' async' : code.load === 'defer' ? ' defer' : ''} src="https://www.googletagmanager.com/gtag/js?id=${code.value}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${code.value}');
</script>`;

      case 'meta_pixel':
        return `<!-- Meta Pixel Code -->
<script${code.load === 'async' ? ' async' : code.load === 'defer' ? ' defer' : ''}>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${code.value}');
fbq('track', 'PageView');
</script>
<!-- End Meta Pixel Code -->`;

      case 'twitter_pixel':
        return `<!-- Twitter universal website tag code -->
<script${code.load === 'async' ? ' async' : code.load === 'defer' ? ' defer' : ''}>
!function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
},s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='//static.ads-twitter.com/uwt.js',
a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
twq('init','${code.value}');
twq('track','PageView');
</script>
<!-- End Twitter universal website tag code -->`;

      case 'linkedin_insight':
        return `<!-- LinkedIn Insight Tag -->
<script type="text/javascript"${code.load === 'async' ? ' async' : code.load === 'defer' ? ' defer' : ''}>
_linkedin_partner_id = "${code.value}";
window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
window._linkedin_data_partner_ids.push(_linkedin_partner_id);
</script><script type="text/javascript">
(function(){var s = document.getElementsByTagName("script")[0];
var b = document.createElement("script");
b.type = "text/javascript";b.async = true;
b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
s.parentNode.insertBefore(b, s);})();
</script>
<!-- End LinkedIn Insight Tag -->`;

      case 'tiktok_pixel':
        return `<!-- TikTok Pixel Code -->
<script${code.load === 'async' ? ' async' : code.load === 'defer' ? ' defer' : ''}>
!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
  ttq.load('${code.value}');
  ttq.page();
}(window, document, 'ttq');
</script>
<!-- End TikTok Pixel Code -->`;

      default:
        return code.value;
    }
  };

  // Handle adding new tracking code
  const handleAddCode = () => {
    const validation = validateTrackingCode(newCode);
    if (validation) {
      toast.error(validation);
      return;
    }

    const trackingCode: TrackingCode = {
      id: Date.now().toString(),
      platform: newCode.platform as PlatformType,
      mode: newCode.mode as 'id' | 'snippet',
      value: newCode.value!,
      placement: newCode.placement as 'head' | 'body',
      load: newCode.load as 'async' | 'defer' | 'none',
      enabled: newCode.enabled!,
      environments: newCode.environments as ('dev' | 'staging' | 'prod')[],
      requiresConsent: newCode.requiresConsent!,
      order: trackingCodes.length + 1,
      lastModified: new Date().toISOString(),
      lastModifiedBy: 'Current User'
    };

    setTrackingCodes(prev => [...prev, trackingCode]);
    setHasUnsavedChanges(true);
    setIsAddModalOpen(false);
    setNewCode({
      platform: 'google_gtm',
      mode: 'id',
      value: '',
      placement: 'head',
      load: 'async',
      enabled: true,
      environments: ['prod'],
      requiresConsent: false
    });
    toast.success('Tracking code added successfully');
  };

  // Handle save all changes
  const handleSave = () => {
    // Simulate API call
    setTimeout(() => {
      setHasUnsavedChanges(false);
      toast.success('All tracking codes saved successfully');
    }, 500);
  };

  // Handle toggle code
  const toggleCode = (id: string) => {
    setTrackingCodes(prev => prev.map(code => 
      code.id === id ? { ...code, enabled: !code.enabled, lastModified: new Date().toISOString() } : code
    ));
    setHasUnsavedChanges(true);
  };

  // Handle delete
  const handleDelete = (id: string) => {
    setTrackingCodes(prev => prev.filter(code => code.id !== id));
    setHasUnsavedChanges(true);
    setIsDeleteConfirmOpen(false);
    setDeleteTarget(null);
    toast.success('Tracking code removed');
  };

  // Drag and drop reordering (simplified)
  const moveCode = (id: string, direction: 'up' | 'down') => {
    const currentIndex = trackingCodes.findIndex(code => code.id === id);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= trackingCodes.length) return;
    
    const newCodes = [...trackingCodes];
    [newCodes[currentIndex], newCodes[newIndex]] = [newCodes[newIndex], newCodes[currentIndex]];
    
    // Update order numbers
    newCodes.forEach((code, index) => {
      code.order = index + 1;
    });
    
    setTrackingCodes(newCodes);
    setHasUnsavedChanges(true);
  };

  return (
    <TooltipProvider>
      <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-hide pr-2">
      {/* Header */}
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-700/30 shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Tracking & Analytics
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Manage tracking codes for analytics and advertising platforms
            </p>
          </div>
          <div className="flex items-center gap-3">
            {hasUnsavedChanges && (
              <Button onClick={handleSave} className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            )}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Code
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </div>

        {/* Global GTM Toggle */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div>
                <Label className="text-slate-900 dark:text-slate-100 font-medium">
                  Use Google Tag Manager for all tags
                </Label>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Route all tracking through GTM instead of direct injection
                </p>
              </div>
            </div>
            <Switch
              checked={useGTM}
              onCheckedChange={(checked) => {
                setUseGTM(checked);
                setHasUnsavedChanges(true);
                toast.info(checked ? 'GTM routing enabled' : 'GTM routing disabled');
              }}
            />
          </div>
        </div>
      </div>

      {/* Tracking Codes List */}
      <div className="space-y-4">
        {trackingCodes.length === 0 ? (
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-700/30 shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Code2 className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2">
              No tracking codes configured
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
              Add your first tracking code to start monitoring analytics and conversions
            </p>
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Tracking Code
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        ) : (
          trackingCodes.map((code, index) => {
            const platform = PLATFORMS[code.platform];
            const IconComponent = platform.icon;
            
            return (
              <div key={code.id} className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-700/30 shadow-lg p-6">
                <div className="flex items-start gap-4">
                  {/* Drag Handle */}
                  <div className="flex flex-col gap-1 mt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-6 h-6 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
                      onClick={() => moveCode(code.id, 'up')}
                      disabled={index === 0}
                    >
                      <GripVertical className="w-3 h-3 text-slate-400" />
                    </Button>
                    <span className="text-xs text-slate-500 text-center">{code.order}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-6 h-6 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
                      onClick={() => moveCode(code.id, 'down')}
                      disabled={index === trackingCodes.length - 1}
                    >
                      <GripVertical className="w-3 h-3 text-slate-400 rotate-180" />
                    </Button>
                  </div>

                  {/* Platform Icon */}
                  <div className={`${platform.bgColor} ${platform.borderColor} rounded-xl border p-3 flex-shrink-0`}>
                    <IconComponent className={`w-6 h-6 ${platform.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                            {platform.name}
                          </h4>
                          <Badge 
                            variant={code.enabled ? "default" : "secondary"}
                            className={code.enabled ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300" : ""}
                          >
                            {code.enabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {code.mode === 'id' ? 'ID Mode' : 'Snippet Mode'}
                          </Badge>
                          {useGTM && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300">
                              Via GTM
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                          {platform.description}
                        </p>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded">
                          {code.mode === 'id' ? code.value : `${code.value.substring(0, 50)}...`}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={code.enabled}
                          onCheckedChange={() => toggleCode(code.id)}
                          disabled={useGTM}
                        />
                      </div>
                    </div>

                    {/* Configuration Details */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                      <div>
                        <Label className="text-xs text-slate-500">Placement</Label>
                        <p className="text-sm text-slate-900 dark:text-slate-100">
                          {code.placement === 'head' ? 'Head section' : 'End of body'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-slate-500">Load</Label>
                        <p className="text-sm text-slate-900 dark:text-slate-100 capitalize">
                          {code.load === 'none' ? 'Default' : code.load}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-slate-500">Environments</Label>
                        <div className="flex gap-1 mt-1">
                          {code.environments.map(env => (
                            <Badge key={env} variant="outline" className="text-xs">
                              {env}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {code.requiresConsent && (
                          <div className="flex items-center gap-1" title="Requires marketing consent">
                            <Shield className="w-4 h-4 text-orange-500" />
                            <span className="text-xs text-orange-600 dark:text-orange-400">Consent required</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-slate-500">
                        Modified by {code.lastModifiedBy} on {new Date(code.lastModified).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl"
                          onClick={() => {
                            setPreviewCode(code);
                            setIsPreviewModalOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Preview
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-200 dark:border-red-800"
                          onClick={() => {
                            setDeleteTarget(code.id);
                            setIsDeleteConfirmOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Tracking Code Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] rounded-3xl border-0 shadow-2xl bg-white dark:bg-slate-900 p-0 overflow-hidden flex flex-col">
          <DialogHeader className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-8 pt-8 pb-6 flex-shrink-0">
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Add Tracking Code
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Configure a new tracking code for analytics or advertising
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto px-8 py-4 space-y-6 scrollbar-hide">
            {/* Platform Selection */}
            <div>
              <Label className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3 block">
                Platform
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(PLATFORMS).map(([key, platform]) => {
                  const IconComponent = platform.icon;
                  const isSelected = newCode.platform === key;
                  
                  return (
                    <div
                      key={key}
                      className={`${platform.bgColor} ${platform.borderColor} rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md ${
                        isSelected ? 'ring-2 ring-blue-500 shadow-md' : ''
                      }`}
                      onClick={() => setNewCode(prev => ({ ...prev, platform: key as PlatformType }))}
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent className={`w-5 h-5 ${platform.color}`} />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                            {platform.name}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {platform.description}
                          </p>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-blue-500 ml-auto" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Input Mode */}
            <div>
              <Label className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3 block">
                Input Mode
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <div
                  className={`border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${
                    newCode.mode === 'id' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-700'
                  }`}
                  onClick={() => setNewCode(prev => ({ ...prev, mode: 'id' }))}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">ID Only</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Enter tracking ID (e.g., {PLATFORMS[newCode.platform as PlatformType]?.idFormat})
                      </p>
                    </div>
                    {newCode.mode === 'id' && <Check className="w-4 h-4 text-blue-500" />}
                  </div>
                </div>
                <div
                  className={`border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${
                    newCode.mode === 'snippet' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-700'
                  }`}
                  onClick={() => setNewCode(prev => ({ ...prev, mode: 'snippet' }))}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">Raw Code</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Paste full HTML/JS snippet
                      </p>
                    </div>
                    {newCode.mode === 'snippet' && <Check className="w-4 h-4 text-blue-500" />}
                  </div>
                </div>
              </div>
            </div>

            {/* Value Input */}
            <div>
              <Label className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2 block">
                {newCode.mode === 'id' ? 'Tracking ID' : 'Code Snippet'}
              </Label>
              {newCode.mode === 'id' ? (
                <Input
                  placeholder={PLATFORMS[newCode.platform as PlatformType]?.idFormat}
                  value={newCode.value || ''}
                  onChange={(e) => setNewCode(prev => ({ ...prev, value: e.target.value }))}
                  className="rounded-xl border-slate-200 dark:border-slate-700"
                />
              ) : (
                <Textarea
                  placeholder="Paste your tracking code snippet here..."
                  value={newCode.value || ''}
                  onChange={(e) => setNewCode(prev => ({ ...prev, value: e.target.value }))}
                  className="rounded-xl border-slate-200 dark:border-slate-700 min-h-[120px] font-mono text-sm"
                />
              )}
            </div>

            {/* Configuration Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2 block">
                  Placement
                </Label>
                <Select value={newCode.placement} onValueChange={(value) => setNewCode(prev => ({ ...prev, placement: value as 'head' | 'body' }))}>
                  <SelectTrigger className="rounded-xl border-slate-200 dark:border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="head">Head section</SelectItem>
                    <SelectItem value="body">End of body</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2 block">
                  Load Behavior
                </Label>
                <Select value={newCode.load} onValueChange={(value) => setNewCode(prev => ({ ...prev, load: value as 'async' | 'defer' | 'none' }))}>
                  <SelectTrigger className="rounded-xl border-slate-200 dark:border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="none">Default</SelectItem>
                    <SelectItem value="async">Async</SelectItem>
                    <SelectItem value="defer">Defer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Environment Selection */}
            <div>
              <Label className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3 block">
                Environments
              </Label>
              <div className="flex gap-3">
                {['dev', 'staging', 'prod'].map(env => (
                  <div
                    key={env}
                    className={`border rounded-xl px-4 py-2 cursor-pointer transition-all hover:shadow-sm ${
                      newCode.environments?.includes(env as 'dev' | 'staging' | 'prod') 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                    onClick={() => {
                      const envs = newCode.environments || [];
                      const newEnvs = envs.includes(env as 'dev' | 'staging' | 'prod')
                        ? envs.filter(e => e !== env)
                        : [...envs, env as 'dev' | 'staging' | 'prod'];
                      setNewCode(prev => ({ ...prev, environments: newEnvs }));
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium capitalize">{env}</span>
                      {newCode.environments?.includes(env as 'dev' | 'staging' | 'prod') && (
                        <Check className="w-3 h-3" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <div>
                    <Label className="text-slate-900 dark:text-slate-100 font-medium">Enabled</Label>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Load this tracking code</p>
                  </div>
                </div>
                <Switch
                  checked={newCode.enabled}
                  onCheckedChange={(checked) => setNewCode(prev => ({ ...prev, enabled: checked }))}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-orange-500" />
                  <div>
                    <Label className="text-slate-900 dark:text-slate-100 font-medium">
                      Requires Marketing Consent
                    </Label>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Only load after user accepts marketing cookies</p>
                  </div>
                </div>
                <Switch
                  checked={newCode.requiresConsent}
                  onCheckedChange={(checked) => setNewCode(prev => ({ ...prev, requiresConsent: checked }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="px-8 py-6 border-t border-slate-200/50 dark:border-slate-700/50 flex-shrink-0 gap-3 bg-white dark:bg-slate-900">
            <Button
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddCode}
              disabled={!newCode.value}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Tracking Code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] rounded-3xl border-0 shadow-2xl bg-white dark:bg-slate-900 p-0 overflow-hidden flex flex-col">
          <DialogHeader className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 px-8 pt-8 pb-6 flex-shrink-0">
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Preview Tracking Code
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              {previewCode && `${PLATFORMS[previewCode.platform].name} - ${previewCode.mode === 'id' ? 'Generated from ID' : 'Raw snippet'}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto px-8 py-4 scrollbar-hide">
            {previewCode && (
              <div className="bg-slate-900 dark:bg-slate-950 rounded-xl p-6 overflow-auto">
                <pre className="text-sm text-slate-100 whitespace-pre-wrap font-mono">
                  {generatePreview(previewCode)}
                </pre>
              </div>
            )}
            
            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-700/30">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div className="text-sm">
                  <p className="text-amber-800 dark:text-amber-200 font-medium mb-1">
                    Sanitized Preview
                  </p>
                  <p className="text-amber-700 dark:text-amber-300">
                    This preview has been sanitized for security. The actual injected code may differ slightly.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="px-8 py-6 border-t border-slate-200/50 dark:border-slate-700/50 flex-shrink-0 bg-white dark:bg-slate-900">
            <Button
              onClick={() => setIsPreviewModalOpen(false)}
              className="rounded-xl"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent className="max-w-lg border-0 shadow-2xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden p-0">
          <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 px-8 pt-8 pb-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
              <Trash2 className="w-8 h-8 text-white" />
            </div>
            <AlertDialogTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Remove Tracking Code
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
              This will permanently remove the tracking code from your site. Analytics data collection will stop immediately.
            </AlertDialogDescription>
          </div>
          
          <AlertDialogFooter className="px-8 pb-8 gap-3">
            <AlertDialogCancel className="rounded-xl border-slate-200 dark:border-slate-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
              className="bg-red-500 hover:bg-red-600 text-white rounded-xl"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove Code
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </TooltipProvider>
  );
}