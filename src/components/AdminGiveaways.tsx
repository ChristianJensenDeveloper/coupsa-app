import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { toast } from "sonner@2.0.3";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  Trophy, 
  Users, 
  Eye, 
  Download, 
  Calendar as CalendarIcon,
  BarChart3,
  Shield,
  Mail,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Flag,
  Globe,
  Award,
  Crown,
  Gift,
  Share2,
  Upload,
  Image as ImageIcon
} from "lucide-react";
import { format } from "date-fns";

// Types for admin giveaways
interface AdminGiveaway {
  id: string;
  title: string;
  prize: string;
  firm?: string;
  imageUrl?: string;
  bannerUrl?: string; // New banner image field
  status: 'draft' | 'running' | 'finished';
  startDate: string;
  endDate: string;
  totalParticipants: number;
  validEntries: number;
  totalEntries: number;
  conversionRate: number;
  lastUpdated: string;
  sharesCopy: string;
  rules: string;
  requireEmailVerification: boolean;
  requireCaptcha: boolean;
  ipDeviceLimits: number;
  milestonesConfig?: {
    referrals: number;
    bonusEntries: number;
  };
  winner?: {
    userId: string;
    displayName: string;
    entries: number;
    winnerAnnounced: boolean;
  };
  fraudFlags: number;
}

// New participant interface for winner selection
interface GiveawayParticipant {
  id: string;
  name: string;
  fullName: string; // Complete legal name for winner contact
  email: string;
  phoneNumber: string; // Added phone number for winner contact
  entries: number;
  referrals: number;
  joinDate: string;
  country: string;
  verified: boolean;
  suspicious: boolean;
}

interface GiveawayMetrics {
  totalSignups: number;
  emailVerifiedRate: number;
  totalValidEntries: number;
  sharesByPlatform: {
    whatsapp: number;
    instagram: number;
    telegram: number;
    twitter: number;
    discord: number;
  };
  conversionFunnel: {
    landed: number;
    entered: number;
    verified: number;
  };
  countryDistribution: Array<{
    country: string;
    count: number;
    percentage: number;
  }>;
  topReferrers: Array<{
    name: string;
    entries: number;
    referrals: number;
  }>;
  fraudMetrics: {
    flaggedIps: number;
    suspiciousDevices: number;
    duplicateEntries: number;
  };
}

// Mock data for admin giveaways
const mockGiveaways: AdminGiveaway[] = [
  {
    id: 'ftmo-100k',
    title: '$100K FTMO Challenge',
    prize: '$100,000 Challenge Account',
    firm: 'FTMO',
    imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400',
    bannerUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    status: 'running',
    startDate: '2025-01-01T00:00:00Z',
    endDate: '2025-01-15T23:59:59Z',
    totalParticipants: 1456,
    validEntries: 2847,
    totalEntries: 3123,
    conversionRate: 87.2,
    lastUpdated: '2025-01-07T14:30:00Z',
    sharesCopy: 'Win a $100K FTMO challenge account! Join me on REDUZED for verified trading deals.',
    rules: 'Share to earn entries. Most entries wins. Anti-fraud checks apply.',
    requireEmailVerification: true,
    requireCaptcha: true,
    ipDeviceLimits: 3,
    milestonesConfig: {
      referrals: 3,
      bonusEntries: 5
    },
    fraudFlags: 23
  },
  {
    id: 'topstep-50k',
    title: 'TopStep $50K Account',
    prize: '$50,000 Futures Account',
    firm: 'TopStep',
    imageUrl: 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=400',
    status: 'finished',
    startDate: '2024-12-15T00:00:00Z',
    endDate: '2024-12-31T23:59:59Z',
    totalParticipants: 876,
    validEntries: 1923,
    totalEntries: 2100,
    conversionRate: 91.6,
    lastUpdated: '2025-01-01T10:00:00Z',
    sharesCopy: 'Win a $50K futures account from TopStep! Share to enter.',
    rules: 'Share to earn entries. Most entries wins. Winner announced soon.',
    requireEmailVerification: true,
    requireCaptcha: false,
    ipDeviceLimits: 5,
    winner: {
      userId: 'user_abc123',
      displayName: 'Mark from Texas',
      entries: 34,
      winnerAnnounced: true
    },
    fraudFlags: 12
  },
  {
    id: 'draft-giveaway',
    title: 'Upcoming Prop Challenge',
    prize: '$75,000 Challenge',
    firm: 'MyForexFunds',
    status: 'draft',
    startDate: '2025-02-01T00:00:00Z',
    endDate: '2025-02-28T23:59:59Z',
    totalParticipants: 0,
    validEntries: 0,
    totalEntries: 0,
    conversionRate: 0,
    lastUpdated: '2025-01-07T09:15:00Z',
    sharesCopy: 'Coming soon: Win a $75K challenge from MyForexFunds!',
    rules: 'Share to earn entries. Most entries wins.',
    requireEmailVerification: true,
    requireCaptcha: true,
    ipDeviceLimits: 3,
    fraudFlags: 0
  }
];

const mockMetrics: GiveawayMetrics = {
  totalSignups: 1456,
  emailVerifiedRate: 87.2,
  totalValidEntries: 2847,
  sharesByPlatform: {
    whatsapp: 1234,
    instagram: 876,
    telegram: 543,
    twitter: 1987,
    discord: 321
  },
  conversionFunnel: {
    landed: 5432,
    entered: 1456,
    verified: 1270
  },
  countryDistribution: [
    { country: 'United States', count: 456, percentage: 31.3 },
    { country: 'United Kingdom', count: 234, percentage: 16.1 },
    { country: 'Canada', count: 187, percentage: 12.8 },
    { country: 'Australia', count: 143, percentage: 9.8 },
    { country: 'Germany', count: 98, percentage: 6.7 }
  ],
  topReferrers: [
    { name: 'TradingPro22', entries: 23, referrals: 8 },
    { name: 'ForexKing', entries: 19, referrals: 6 },
    { name: 'ChartMaster', entries: 17, referrals: 5 },
    { name: 'ScalpGuru', entries: 15, referrals: 4 },
    { name: 'PropTrader99', entries: 14, referrals: 4 }
  ],
  fraudMetrics: {
    flaggedIps: 23,
    suspiciousDevices: 12,
    duplicateEntries: 8
  }
};

// Mock participants data for winner selection
const mockParticipants: GiveawayParticipant[] = [
  {
    id: 'user_001',
    name: 'TradingPro22',
    fullName: 'Michael Johnson',
    email: 'tradingpro22@email.com',
    phoneNumber: '+1-555-0123',
    entries: 23,
    referrals: 8,
    joinDate: '2025-01-03T10:30:00Z',
    country: 'United States',
    verified: true,
    suspicious: false
  },
  {
    id: 'user_002',
    name: 'ForexKing',
    fullName: 'James Thompson',
    email: 'forexking@email.com',
    phoneNumber: '+44-20-7946-0958',
    entries: 19,
    referrals: 6,
    joinDate: '2025-01-04T14:20:00Z',
    country: 'United Kingdom',
    verified: true,
    suspicious: false
  },
  {
    id: 'user_003',
    name: 'ChartMaster',
    fullName: 'Sarah Williams',
    email: 'chartmaster@email.com',
    phoneNumber: '+1-416-555-0198',
    entries: 17,
    referrals: 5,
    joinDate: '2025-01-05T09:15:00Z',
    country: 'Canada',
    verified: true,
    suspicious: false
  },
  {
    id: 'user_004',
    name: 'ScalpGuru',
    fullName: 'David Chen',
    email: 'scalpguru@email.com',
    phoneNumber: '+61-2-9876-5432',
    entries: 15,
    referrals: 4,
    joinDate: '2025-01-06T16:45:00Z',
    country: 'Australia',
    verified: false,
    suspicious: true
  },
  {
    id: 'user_005',
    name: 'PropTrader99',
    fullName: 'Anna Mueller',
    email: 'proptrader99@email.com',
    phoneNumber: '+49-30-12345678',
    entries: 14,
    referrals: 4,
    joinDate: '2025-01-06T11:30:00Z',
    country: 'Germany',
    verified: true,
    suspicious: false
  }
];

export function AdminGiveaways() {
  const [giveaways, setGiveaways] = useState<AdminGiveaway[]>(mockGiveaways);
  const [selectedGiveaway, setSelectedGiveaway] = useState<AdminGiveaway | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMetricsModalOpen, setIsMetricsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [metrics, setMetrics] = useState<GiveawayMetrics>(mockMetrics);

  // Form state for create/edit
  const [formData, setFormData] = useState({
    title: '',
    prize: '',
    firm: '',
    imageUrl: '',
    bannerUrl: '', // New banner image field
    startDate: new Date(),
    endDate: new Date(),
    sharesCopy: '',
    rules: '',
    requireEmailVerification: true,
    requireCaptcha: true,
    ipDeviceLimits: 3,
    milestonesReferrals: 3,
    milestonesBonus: 5
  });

  // Winner selection state
  const [isWinnerModalOpen, setIsWinnerModalOpen] = useState(false);
  const [participants, setParticipants] = useState<GiveawayParticipant[]>([]);
  const [selectedParticipant, setSelectedParticipant] = useState<GiveawayParticipant | null>(null);

  const filteredGiveaways = giveaways.filter(g => 
    filterStatus === 'all' || g.status === filterStatus
  );

  const handleCreateGiveaway = () => {
    const newGiveaway: AdminGiveaway = {
      id: `giveaway-${Date.now()}`,
      title: formData.title,
      prize: formData.prize,
      firm: formData.firm || undefined,
      imageUrl: formData.imageUrl || undefined,
      bannerUrl: formData.bannerUrl || undefined,
      status: 'draft',
      startDate: formData.startDate.toISOString(),
      endDate: formData.endDate.toISOString(),
      totalParticipants: 0,
      validEntries: 0,
      totalEntries: 0,
      conversionRate: 0,
      lastUpdated: new Date().toISOString(),
      sharesCopy: formData.sharesCopy,
      rules: formData.rules,
      requireEmailVerification: formData.requireEmailVerification,
      requireCaptcha: formData.requireCaptcha,
      ipDeviceLimits: formData.ipDeviceLimits,
      milestonesConfig: {
        referrals: formData.milestonesReferrals,
        bonusEntries: formData.milestonesBonus
      },
      fraudFlags: 0
    };

    setGiveaways(prev => [...prev, newGiveaway]);
    setIsCreateModalOpen(false);
    resetForm();
    toast.success("Giveaway created successfully!");
  };

  const handleEditGiveaway = () => {
    if (!selectedGiveaway) return;

    setGiveaways(prev => prev.map(g => 
      g.id === selectedGiveaway.id 
        ? {
            ...g,
            title: formData.title,
            prize: formData.prize,
            firm: formData.firm || undefined,
            imageUrl: formData.imageUrl || undefined,
            bannerUrl: formData.bannerUrl || undefined,
            startDate: formData.startDate.toISOString(),
            endDate: formData.endDate.toISOString(),
            sharesCopy: formData.sharesCopy,
            rules: formData.rules,
            requireEmailVerification: formData.requireEmailVerification,
            requireCaptcha: formData.requireCaptcha,
            ipDeviceLimits: formData.ipDeviceLimits,
            milestonesConfig: {
              referrals: formData.milestonesReferrals,
              bonusEntries: formData.milestonesBonus
            },
            lastUpdated: new Date().toISOString()
          }
        : g
    ));

    setIsEditModalOpen(false);
    setSelectedGiveaway(null);
    resetForm();
    toast.success("Giveaway updated successfully!");
  };

  const resetForm = () => {
    setFormData({
      title: '',
      prize: '',
      firm: '',
      imageUrl: '',
      bannerUrl: '',
      startDate: new Date(),
      endDate: new Date(),
      sharesCopy: '',
      rules: '',
      requireEmailVerification: true,
      requireCaptcha: true,
      ipDeviceLimits: 3,
      milestonesReferrals: 3,
      milestonesBonus: 5
    });
  };

  const handleEditClick = (giveaway: AdminGiveaway) => {
    setSelectedGiveaway(giveaway);
    setFormData({
      title: giveaway.title,
      prize: giveaway.prize,
      firm: giveaway.firm || '',
      imageUrl: giveaway.imageUrl || '',
      bannerUrl: giveaway.bannerUrl || '',
      startDate: new Date(giveaway.startDate),
      endDate: new Date(giveaway.endDate),
      sharesCopy: giveaway.sharesCopy,
      rules: giveaway.rules,
      requireEmailVerification: giveaway.requireEmailVerification,
      requireCaptcha: giveaway.requireCaptcha,
      ipDeviceLimits: giveaway.ipDeviceLimits,
      milestonesReferrals: giveaway.milestonesConfig?.referrals || 3,
      milestonesBonus: giveaway.milestonesConfig?.bonusEntries || 5
    });
    setIsEditModalOpen(true);
  };

  const handleToggleStatus = (giveaway: AdminGiveaway) => {
    const newStatus = giveaway.status === 'draft' ? 'running' : 
                     giveaway.status === 'running' ? 'finished' : 'draft';
    
    setGiveaways(prev => prev.map(g => 
      g.id === giveaway.id 
        ? { ...g, status: newStatus, lastUpdated: new Date().toISOString() }
        : g
    ));
    
    toast.success(`Giveaway ${newStatus === 'running' ? 'activated' : newStatus === 'finished' ? 'finished' : 'set to draft'}!`);
  };

  const handleFinalizeWinner = (giveaway: AdminGiveaway) => {
    // Simulate winner finalization
    const mockWinner = {
      userId: `user_${Math.random().toString(36).substr(2, 9)}`,
      displayName: 'Sarah from California',
      entries: 28,
      winnerAnnounced: false
    };

    setGiveaways(prev => prev.map(g => 
      g.id === giveaway.id 
        ? { 
            ...g, 
            winner: mockWinner,
            status: 'finished',
            lastUpdated: new Date().toISOString()
          }
        : g
    ));
    
    toast.success("Winner finalized! Ready to announce.");
  };

  // Winner selection handlers
  const handleSelectWinner = (giveaway: AdminGiveaway) => {
    setSelectedGiveaway(giveaway);
    setParticipants(mockParticipants);
    setIsWinnerModalOpen(true);
  };

  const handleConfirmWinner = () => {
    if (!selectedGiveaway || !selectedParticipant) return;

    const newWinner = {
      userId: selectedParticipant.id,
      displayName: `${selectedParticipant.name.split(/[0-9]/)[0]} from ${selectedParticipant.country}`,
      entries: selectedParticipant.entries,
      winnerAnnounced: false
    };

    setGiveaways(prev => prev.map(g => 
      g.id === selectedGiveaway.id 
        ? { 
            ...g, 
            winner: newWinner,
            status: 'finished',
            lastUpdated: new Date().toISOString()
          }
        : g
    ));
    
    setIsWinnerModalOpen(false);
    setSelectedParticipant(null);
    setSelectedGiveaway(null);
    toast.success(`Winner selected: ${newWinner.displayName}`);
  };

  const handlePublishWinner = (giveaway: AdminGiveaway) => {
    if (!giveaway.winner) return;

    setGiveaways(prev => prev.map(g => 
      g.id === giveaway.id 
        ? { 
            ...g, 
            winner: { ...g.winner!, winnerAnnounced: true },
            lastUpdated: new Date().toISOString()
          }
        : g
    ));
    
    toast.success("Winner announced publicly!");
  };

  const handleDeleteGiveaway = (giveaway: AdminGiveaway) => {
    if (giveaway.status === 'running') {
      toast.error("Cannot delete a running giveaway. Please finish it first.");
      return;
    }
    
    setGiveaways(prev => prev.filter(g => g.id !== giveaway.id));
    toast.success("Giveaway deleted successfully!");
  };

  const exportData = (type: string) => {
    toast.success(`${type} data exported successfully!`);
  };

  const renderGiveawayForm = () => (
    <div className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., $100K FTMO Challenge"
              />
            </div>
            <div>
              <Label htmlFor="prize">Prize</Label>
              <Input
                id="prize"
                value={formData.prize}
                onChange={(e) => setFormData(prev => ({ ...prev, prize: e.target.value }))}
                placeholder="e.g., $100,000 Challenge Account"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="firm">Firm (Optional)</Label>
              <Input
                id="firm"
                value={formData.firm}
                onChange={(e) => setFormData(prev => ({ ...prev, firm: e.target.value }))}
                placeholder="e.g., FTMO"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="imageUrl">Logo/Image URL (Optional)</Label>
                <div className="flex gap-2">
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://... (logo/small image)"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="px-3"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          // Create a temporary URL for preview (in real app, you'd upload to your server)
                          const tempUrl = URL.createObjectURL(file);
                          setFormData(prev => ({ ...prev, imageUrl: tempUrl }));
                          toast.success("Image uploaded! (Demo mode - using temporary URL)");
                        }
                      };
                      input.click();
                    }}
                  >
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="bannerUrl">Banner Image URL (Optional)</Label>
                <div className="flex gap-2">
                  <Input
                    id="bannerUrl"
                    value={formData.bannerUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, bannerUrl: e.target.value }))}
                    placeholder="https://... (featured banner)"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="px-3"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          // Create a temporary URL for preview (in real app, you'd upload to your server)
                          const tempUrl = URL.createObjectURL(file);
                          setFormData(prev => ({ ...prev, bannerUrl: tempUrl }));
                          toast.success("Banner uploaded! (Demo mode - using temporary URL)");
                        }
                      };
                      input.click();
                    }}
                  >
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Image Previews */}
            {(formData.imageUrl || formData.bannerUrl) && (
              <div className="space-y-3">
                <Label>Image Previews</Label>
                <div className="grid grid-cols-2 gap-4">
                  {formData.imageUrl && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Logo/Image:</p>
                      <img 
                        src={formData.imageUrl} 
                        alt="Logo preview" 
                        className="w-20 h-20 object-cover rounded-lg border"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  {formData.bannerUrl && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Banner:</p>
                      <img 
                        src={formData.bannerUrl} 
                        alt="Banner preview" 
                        className="w-full h-20 object-cover rounded-lg border"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div>
            <Label htmlFor="sharesCopy">Share Copy</Label>
            <Textarea
              id="sharesCopy"
              value={formData.sharesCopy}
              onChange={(e) => setFormData(prev => ({ ...prev, sharesCopy: e.target.value }))}
              placeholder="Text users will share on social media..."
              className="h-20"
            />
          </div>
          
          <div>
            <Label htmlFor="rules">Rules</Label>
            <Textarea
              id="rules"
              value={formData.rules}
              onChange={(e) => setFormData(prev => ({ ...prev, rules: e.target.value }))}
              placeholder="Giveaway rules and terms..."
              className="h-20"
            />
          </div>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.startDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => date && setFormData(prev => ({ ...prev, startDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.endDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) => date && setFormData(prev => ({ ...prev, endDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium">Milestone Configuration</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="milestonesReferrals">Referrals Required</Label>
                <Input
                  id="milestonesReferrals"
                  type="number"
                  value={formData.milestonesReferrals}
                  onChange={(e) => setFormData(prev => ({ ...prev, milestonesReferrals: parseInt(e.target.value) }))}
                  min="1"
                />
              </div>
              <div>
                <Label htmlFor="milestonesBonus">Bonus Entries</Label>
                <Input
                  id="milestonesBonus"
                  type="number"
                  value={formData.milestonesBonus}
                  onChange={(e) => setFormData(prev => ({ ...prev, milestonesBonus: parseInt(e.target.value) }))}
                  min="1"
                />
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="validation" className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="emailVerification">Require Email Verification</Label>
                <p className="text-sm text-muted-foreground">Users must verify email to earn entries</p>
              </div>
              <Switch
                id="emailVerification"
                checked={formData.requireEmailVerification}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requireEmailVerification: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="captcha">Require CAPTCHA</Label>
                <p className="text-sm text-muted-foreground">Show CAPTCHA on entry</p>
              </div>
              <Switch
                id="captcha"
                checked={formData.requireCaptcha}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requireCaptcha: checked }))}
              />
            </div>
            
            <div>
              <Label htmlFor="ipLimits">IP/Device Limits</Label>
              <Input
                id="ipLimits"
                type="number"
                value={formData.ipDeviceLimits}
                onChange={(e) => setFormData(prev => ({ ...prev, ipDeviceLimits: parseInt(e.target.value) }))}
                min="1"
                max="10"
              />
              <p className="text-sm text-muted-foreground mt-1">Maximum entries per IP/device</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Giveaways Management</h2>
          <p className="text-slate-600 dark:text-slate-400">Create and manage trading giveaways and competitions</p>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Create Giveaway
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Giveaway</DialogTitle>
              <DialogDescription>
                Set up a new giveaway with prizes and entry requirements
              </DialogDescription>
            </DialogHeader>
            
            {renderGiveawayForm()}
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateGiveaway}>
                Create Giveaway
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Play className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Running</p>
                <p className="text-xl font-bold">{giveaways.filter(g => g.status === 'running').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Draft</p>
                <p className="text-xl font-bold">{giveaways.filter(g => g.status === 'draft').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Trophy className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Finished</p>
                <p className="text-xl font-bold">{giveaways.filter(g => g.status === 'finished').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Participants</p>
                <p className="text-xl font-bold">{giveaways.reduce((sum, g) => sum + g.totalParticipants, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="running">Running</SelectItem>
              <SelectItem value="finished">Finished</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => exportData('Entrants')}>
            <Download className="w-4 h-4 mr-2" />
            Export Entrants
          </Button>
          <Button variant="outline" onClick={() => exportData('Winners')}>
            <Download className="w-4 h-4 mr-2" />
            Export Winners
          </Button>
        </div>
      </div>

      {/* Giveaways Table */}
      <Card>
        <CardHeader>
          <CardTitle>Giveaways</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Prize</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Valid Entries</TableHead>
                <TableHead>Conversion %</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGiveaways.map((giveaway) => (
                <TableRow key={giveaway.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{giveaway.title}</div>
                      {giveaway.firm && (
                        <div className="text-sm text-muted-foreground">{giveaway.firm}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{giveaway.prize}</TableCell>
                  <TableCell>
                    <Badge 
                      className={`
                        ${giveaway.status === 'running' ? 'bg-green-500 hover:bg-green-500' : ''}
                        ${giveaway.status === 'draft' ? 'bg-orange-500 hover:bg-orange-500' : ''}
                        ${giveaway.status === 'finished' ? 'bg-blue-500 hover:bg-blue-500' : ''}
                        text-white border-0
                      `}
                    >
                      {giveaway.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>Starts: {format(new Date(giveaway.startDate), "MMM dd")}</div>
                      <div>Ends: {format(new Date(giveaway.endDate), "MMM dd")}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{giveaway.totalParticipants.toLocaleString()}</div>
                      <div className="text-muted-foreground">people</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{giveaway.validEntries.toLocaleString()}</div>
                      <div className="text-muted-foreground">entries</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{giveaway.conversionRate}%</div>
                      {giveaway.fraudFlags > 0 && (
                        <div className="text-red-500 text-xs">
                          <Flag className="w-3 h-3 inline mr-1" />
                          {giveaway.fraudFlags} flags
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedGiveaway(giveaway);
                          setIsMetricsModalOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(giveaway)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(giveaway)}
                      >
                        {giveaway.status === 'running' ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                      
                      {(giveaway.status === 'running' || giveaway.status === 'finished') && !giveaway.winner && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSelectWinner(giveaway)}
                          className="text-green-600 hover:text-green-700"
                          title="Select Winner"
                        >
                          <Award className="w-4 h-4" />
                        </Button>
                      )}
                      
                      {giveaway.winner && !giveaway.winner.winnerAnnounced && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePublishWinner(giveaway)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Crown className="w-4 h-4" />
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteGiveaway(giveaway)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Giveaway</DialogTitle>
            <DialogDescription>
              Update giveaway details and settings
            </DialogDescription>
          </DialogHeader>
          
          {renderGiveawayForm()}
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditGiveaway}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Metrics Modal */}
      <Dialog open={isMetricsModalOpen} onOpenChange={setIsMetricsModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Giveaway Metrics</DialogTitle>
            <DialogDescription>
              Detailed analytics and performance data
            </DialogDescription>
          </DialogHeader>
          
          {selectedGiveaway && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4 h-auto">
                <TabsTrigger value="overview" className="text-sm py-3">Overview</TabsTrigger>
                <TabsTrigger value="participants" className="text-sm py-3">Participants</TabsTrigger>
                <TabsTrigger value="fraud" className="text-sm py-3">Fraud Detection</TabsTrigger>
                <TabsTrigger value="winner" className="text-sm py-3 whitespace-nowrap">Winner Management</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">Total Signups</p>
                          <p className="text-2xl font-bold">{metrics.totalSignups.toLocaleString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">Email Verified</p>
                          <p className="text-2xl font-bold">{metrics.emailVerifiedRate}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">Valid Entries</p>
                          <p className="text-2xl font-bold">{metrics.totalValidEntries.toLocaleString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Shares by Platform</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(metrics.sharesByPlatform).map(([platform, count]) => (
                        <div key={platform} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                              <Share2 className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="capitalize font-medium">{platform}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{count.toLocaleString()}</div>
                            <div className="text-sm text-muted-foreground">shares</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Conversion Funnel</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Landing Page Views</span>
                        <span className="font-bold">{metrics.conversionFunnel.landed.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Entered Giveaway</span>
                        <span className="font-bold">{metrics.conversionFunnel.entered.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Email Verified</span>
                        <span className="font-bold">{metrics.conversionFunnel.verified.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="participants" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Country Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {metrics.countryDistribution.map((country) => (
                          <div key={country.country} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Globe className="w-4 h-4 text-muted-foreground" />
                              <span>{country.country}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{country.count}</div>
                              <div className="text-sm text-muted-foreground">{country.percentage}%</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Referrers</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {metrics.topReferrers.map((referrer, index) => (
                          <div key={referrer.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                index === 0 ? 'bg-yellow-500 text-white' :
                                index === 1 ? 'bg-gray-400 text-white' :
                                index === 2 ? 'bg-orange-600 text-white' :
                                'bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-300'
                              }`}>
                                {index + 1}
                              </div>
                              <span className="font-medium">{referrer.name}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{referrer.entries} entries</div>
                              <div className="text-sm text-muted-foreground">{referrer.referrals} referrals</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="fraud" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">Flagged IPs</p>
                          <p className="text-2xl font-bold">{metrics.fraudMetrics.flaggedIps}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-orange-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">Suspicious Devices</p>
                          <p className="text-2xl font-bold">{metrics.fraudMetrics.suspiciousDevices}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Flag className="w-5 h-5 text-yellow-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">Duplicate Entries</p>
                          <p className="text-2xl font-bold">{metrics.fraudMetrics.duplicateEntries}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Fraud Detection Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <Shield className="w-4 h-4 mr-2" />
                        Run Anti-Fraud Check
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="w-4 h-4 mr-2" />
                        Export Flagged Entries
                      </Button>
                      <Button variant="outline" className="w-full justify-start text-red-600">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Review Suspicious Activity
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="winner" className="space-y-4">
                {selectedGiveaway.winner ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Crown className="w-5 h-5 text-yellow-500" />
                        Winner Selected - Complete Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="font-bold text-yellow-700 dark:text-yellow-300">
                              {selectedGiveaway.winner.displayName}
                            </h4>
                            <p className="text-sm text-yellow-600 dark:text-yellow-400">
                              Won with {selectedGiveaway.winner.entries} entries
                            </p>
                          </div>
                          <Badge className={`${
                            selectedGiveaway.winner.winnerAnnounced 
                              ? 'bg-green-500 hover:bg-green-500' 
                              : 'bg-orange-500 hover:bg-orange-500'
                          } text-white border-0`}>
                            {selectedGiveaway.winner.winnerAnnounced ? 'Announced' : 'Pending'}
                          </Badge>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <Label>Winner Display Name (Public)</Label>
                            <Input 
                              value={selectedGiveaway.winner.displayName}
                              placeholder="e.g., Mark from Texas"
                              className="bg-white dark:bg-slate-800"
                            />
                            <p className="text-xs text-muted-foreground">
                              Use format: First name + region/state/country for privacy
                            </p>
                          </div>
                          
                          {/* Show complete winner details from the selected participant */}
                          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                            <h5 className="font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              Complete Winner Contact Details
                            </h5>
                            
                            {/* Find the winner participant details */}
                            {(() => {
                              const winnerParticipant = mockParticipants.find(p => p.id === selectedGiveaway.winner?.userId);
                              if (winnerParticipant) {
                                return (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-xs text-muted-foreground">Full Legal Name</Label>
                                      <div className="font-medium">{winnerParticipant.fullName}</div>
                                    </div>
                                    <div>
                                      <Label className="text-xs text-muted-foreground">Username</Label>
                                      <div className="font-medium">{winnerParticipant.name}</div>
                                    </div>
                                    <div>
                                      <Label className="text-xs text-muted-foreground">Email Address</Label>
                                      <div className="font-mono text-sm break-all">{winnerParticipant.email}</div>
                                    </div>
                                    <div>
                                      <Label className="text-xs text-muted-foreground">Phone Number</Label>
                                      <div className="font-mono text-sm">{winnerParticipant.phoneNumber}</div>
                                    </div>
                                    <div>
                                      <Label className="text-xs text-muted-foreground">Country</Label>
                                      <div className="font-medium">{winnerParticipant.country}</div>
                                    </div>
                                    <div>
                                      <Label className="text-xs text-muted-foreground">Join Date</Label>
                                      <div className="font-medium">{new Date(winnerParticipant.joinDate).toLocaleDateString()}</div>
                                    </div>
                                  </div>
                                );
                              }
                              return (
                                <div className="text-sm text-muted-foreground">
                                  Winner details not available. Contact details collected during giveaway entry.
                                </div>
                              );
                            })()}
                            
                            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                              <p className="text-xs text-slate-600 dark:text-slate-400">
                                <strong>Use these details to contact the winner directly.</strong> All information is stored securely and only accessible to authorized REDUZED team members.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 flex-wrap">
                        {!selectedGiveaway.winner.winnerAnnounced && (
                          <Button 
                            onClick={() => handlePublishWinner(selectedGiveaway)}
                            className="bg-blue-500 hover:bg-blue-600"
                          >
                            <Crown className="w-4 h-4 mr-2" />
                            Announce Winner Publicly
                          </Button>
                        )}
                        
                        <Button variant="outline">
                          <Mail className="w-4 h-4 mr-2" />
                          Send Winner Email
                        </Button>
                        
                        <Button variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Export Winner Details
                        </Button>
                        
                        <Button variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Export Audit Log
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Winner Selection</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedGiveaway.status === 'finished' ? (
                        <div className="text-center py-8">
                          <Trophy className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2">
                            Ready to Finalize Winner
                          </h3>
                          <p className="text-slate-600 dark:text-slate-400 mb-4">
                            Giveaway has ended. Run final anti-fraud checks and select winner.
                          </p>
                          <Button onClick={() => handleFinalizeWinner(selectedGiveaway)}>
                            <Award className="w-4 h-4 mr-2" />
                            Finalize Winner
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Clock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                          <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                            Giveaway Still Running
                          </h3>
                          <p className="text-slate-600 dark:text-slate-400">
                            Winner selection will be available after the giveaway ends.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Winner Selection Modal */}
      <Dialog open={isWinnerModalOpen} onOpenChange={setIsWinnerModalOpen}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto w-[95vw]">
          <DialogHeader>
            <DialogTitle>Select Winner - {selectedGiveaway?.title}</DialogTitle>
            <DialogDescription>
              Choose the winner from the list of participants. Winners are selected based on verified entries and anti-fraud checks.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-8">
            {/* Participants Table */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Top Participants</h3>
                <Badge variant="outline" className="text-sm px-3 py-1">{participants.length} total participants</Badge>
              </div>
              
              <div className="border rounded-xl overflow-hidden shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                      <TableHead className="py-4 text-sm font-semibold">Participant Details</TableHead>
                      <TableHead className="py-4 text-sm font-semibold">Entries</TableHead>
                      <TableHead className="py-4 text-sm font-semibold">Referrals</TableHead>
                      <TableHead className="py-4 text-sm font-semibold">Contact Information</TableHead>
                      <TableHead className="py-4 text-sm font-semibold">Status</TableHead>
                      <TableHead className="py-4 text-sm font-semibold">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {participants.map((participant) => (
                      <TableRow 
                        key={participant.id}
                        className={`${
                          selectedParticipant?.id === participant.id 
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        } transition-colors`}
                      >
                        <TableCell className="py-6">
                          <div className="space-y-1">
                            <div className="font-semibold text-base">{participant.name}</div>
                            <div className="font-medium text-slate-700 dark:text-slate-300">{participant.fullName}</div>
                            <div className="text-sm text-muted-foreground">
                              Joined {new Date(participant.joinDate).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-6">
                          <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-0 text-sm px-3 py-1">
                            {participant.entries}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-6">
                          <span className="font-semibold text-base">{participant.referrals}</span>
                        </TableCell>
                        <TableCell className="py-6">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-muted-foreground" />
                              <span className="font-mono text-sm">{participant.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">📞</span>
                              <span className="font-mono text-sm">{participant.phoneNumber}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Globe className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{participant.country}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-6">
                          <div className="flex flex-col gap-2">
                            {participant.verified && (
                              <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-0 text-xs w-fit">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                            {participant.suspicious && (
                              <Badge className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-0 text-xs w-fit">
                                <Flag className="w-3 h-3 mr-1" />
                                Flagged
                              </Badge>
                            )}
                            {!participant.verified && !participant.suspicious && (
                              <Badge variant="outline" className="text-xs w-fit">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Unverified
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-6">
                          <Button
                            variant={selectedParticipant?.id === participant.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedParticipant(participant)}
                            disabled={participant.suspicious}
                            className={`${
                              selectedParticipant?.id === participant.id 
                                ? "bg-blue-500 hover:bg-blue-600 text-white" 
                                : ""
                            } transition-all`}
                          >
                            {selectedParticipant?.id === participant.id ? (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Selected
                              </>
                            ) : (
                              <>
                                <Award className="w-4 h-4 mr-2" />
                                Select Winner
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Winner Preview */}
            {selectedParticipant && (
              <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-yellow-800 dark:text-yellow-200 flex items-center gap-3 text-xl">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Crown className="w-5 h-5 text-white" />
                    </div>
                    Winner Preview & Complete Contact Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-xl">
                      <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <Crown className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-yellow-800 dark:text-yellow-200">
                          {selectedParticipant.name.split(/[0-9]/)[0]} from {selectedParticipant.country}
                        </h4>
                        <p className="text-yellow-700 dark:text-yellow-300 font-medium">
                          Won with {selectedParticipant.entries} entries • {selectedParticipant.referrals} referrals made
                        </p>
                      </div>
                    </div>
                    
                    {/* Complete Winner Details for Admin */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                      <h5 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                        <Mail className="w-5 h-5 text-blue-500" />
                        Complete Winner Details for Contact
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <Label className="text-sm font-medium text-muted-foreground">Full Legal Name</Label>
                          <div className="font-semibold text-lg">{selectedParticipant.fullName}</div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-sm font-medium text-muted-foreground">Username</Label>
                          <div className="font-semibold text-lg">{selectedParticipant.name}</div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-sm font-medium text-muted-foreground">Email Address</Label>
                          <div className="font-mono text-base bg-slate-50 dark:bg-slate-700 p-2 rounded border">{selectedParticipant.email}</div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-sm font-medium text-muted-foreground">Phone Number</Label>
                          <div className="font-mono text-base bg-slate-50 dark:bg-slate-700 p-2 rounded border">{selectedParticipant.phoneNumber}</div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-sm font-medium text-muted-foreground">Country</Label>
                          <div className="font-semibold text-lg">{selectedParticipant.country}</div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-sm font-medium text-muted-foreground">Join Date</Label>
                          <div className="font-semibold text-lg">{new Date(selectedParticipant.joinDate).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}</div>
                        </div>
                      </div>
                      
                      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex flex-wrap items-center gap-6">
                          <div className="flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-amber-500" />
                            <span className="font-medium"><span className="font-bold text-lg">{selectedParticipant.entries}</span> total entries</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-500" />
                            <span className="font-medium"><span className="font-bold text-lg">{selectedParticipant.referrals}</span> referrals made</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {selectedParticipant.verified ? (
                              <>
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <span className="text-green-600 dark:text-green-400 font-medium">Email verified</span>
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="w-5 h-5 text-orange-500" />
                                <span className="text-orange-600 dark:text-orange-400 font-medium">Email not verified</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          <strong>Use these details to contact the winner directly.</strong> All information is stored securely and only accessible to authorized REDUZED team members.
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                        <div>
                          <h6 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">Privacy Protection</h6>
                          <p className="text-sm text-yellow-700 dark:text-yellow-300 leading-relaxed">
                            Winner will be displayed publicly as "<strong>{selectedParticipant.name.split(/[0-9]/)[0]} from {selectedParticipant.country}</strong>" to protect their privacy. The complete contact details above are only for the REDUZED team to reach out to the winner.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsWinnerModalOpen(false);
                setSelectedParticipant(null);
              }}
              className="px-6 py-3"
            >
              Cancel Selection
            </Button>
            <Button 
              onClick={handleConfirmWinner}
              disabled={!selectedParticipant}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Award className="w-4 h-4 mr-2" />
              Confirm Winner Selection
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}