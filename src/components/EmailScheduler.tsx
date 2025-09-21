import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Calendar, Clock, Mail, Users, TrendingUp, Settings, Play, Pause, CheckCircle } from "lucide-react";
import { toast } from "sonner@2.0.3";

interface EmailCampaign {
  id: string;
  name: string;
  template: string;
  day: string;
  time: string;
  timezone: string;
  isActive: boolean;
  lastSent?: string;
  nextSend: string;
  subscriberCount: number;
  openRate?: number;
  clickRate?: number;
}

interface EmailSchedulerProps {
  onCampaignToggle?: (campaignId: string, isActive: boolean) => void;
  onTimeChange?: (campaignId: string, time: string) => void;
}

export function EmailScheduler({ onCampaignToggle, onTimeChange }: EmailSchedulerProps) {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([
    {
      id: 'monday-cfd',
      name: 'Monday CFD Deals',
      template: 'monday-cfd',
      day: 'Monday',
      time: '09:00',
      timezone: 'UTC',
      isActive: true,
      lastSent: '2025-01-01T09:00:00Z',
      nextSend: '2025-01-06T09:00:00Z',
      subscriberCount: 1247,
      openRate: 24.3,
      clickRate: 3.8
    },
    {
      id: 'tuesday-futures',
      name: 'Tuesday Futures Deals',
      template: 'tuesday-futures',
      day: 'Tuesday',
      time: '10:00',
      timezone: 'UTC',
      isActive: true,
      lastSent: '2025-01-02T10:00:00Z',
      nextSend: '2025-01-07T10:00:00Z',
      subscriberCount: 1247,
      openRate: 22.1,
      clickRate: 4.2
    },
    {
      id: 'thursday-expiring',
      name: 'Thursday Expiring Deals',
      template: 'thursday-expiring',
      day: 'Thursday',
      time: '08:00',
      timezone: 'UTC',
      isActive: false,
      nextSend: '2025-01-09T08:00:00Z',
      subscriberCount: 1247,
      openRate: 31.5,
      clickRate: 6.7
    }
  ]);

  const [selectedTimezone, setSelectedTimezone] = useState('UTC');

  const handleToggleCampaign = (campaignId: string) => {
    setCampaigns(prev => prev.map(campaign => {
      if (campaign.id === campaignId) {
        const newState = !campaign.isActive;
        onCampaignToggle?.(campaignId, newState);
        toast.success(`Campaign ${newState ? 'activated' : 'paused'}`);
        return { ...campaign, isActive: newState };
      }
      return campaign;
    }));
  };

  const handleTimeChange = (campaignId: string, newTime: string) => {
    setCampaigns(prev => prev.map(campaign => {
      if (campaign.id === campaignId) {
        onTimeChange?.(campaignId, newTime);
        toast.success('Send time updated');
        return { ...campaign, time: newTime };
      }
      return campaign;
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCampaignColor = () => {
    return 'bg-blue-500';
  };

  const totalSubscribers = campaigns[0]?.subscriberCount || 0;
  const activeCampaigns = campaigns.filter(c => c.isActive).length;
  const avgOpenRate = campaigns.reduce((acc, c) => acc + (c.openRate || 0), 0) / campaigns.length;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Subscribers</p>
                <p className="text-2xl font-bold text-slate-900">{totalSubscribers.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active Campaigns</p>
                <p className="text-2xl font-bold text-slate-900">{activeCampaigns}/{campaigns.length}</p>
              </div>
              <Mail className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Avg Open Rate</p>
                <p className="text-2xl font-bold text-slate-900">{avgOpenRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Next Send</p>
                <p className="text-sm font-bold text-slate-900">
                  {campaigns.find(c => c.isActive)?.day || 'N/A'}
                </p>
                <p className="text-xs text-slate-500">
                  {campaigns.find(c => c.isActive)?.time || '--:--'}
                </p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Global Settings */}
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-blue-500" />
            Global Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-slate-700">Default Timezone</label>
              <p className="text-xs text-slate-500">All campaigns will use this timezone</p>
            </div>
            <Select value={selectedTimezone} onValueChange={setSelectedTimezone}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="EST">EST (New York)</SelectItem>
                <SelectItem value="GMT">GMT (London)</SelectItem>
                <SelectItem value="CET">CET (Berlin)</SelectItem>
                <SelectItem value="JST">JST (Tokyo)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Management */}
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-500" />
            Weekly Email Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-start gap-4">
                  {/* Campaign Icon */}
                  <div className={`w-12 h-12 ${getCampaignColor()} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                    <Mail className="w-6 h-6 text-white" />
                  </div>

                  {/* Campaign Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="font-bold text-slate-900 mb-1">{campaign.name}</h3>
                        <p className="text-sm text-slate-600">
                          Every {campaign.day} at {campaign.time} {campaign.timezone}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant={campaign.isActive ? "default" : "secondary"}
                          className={campaign.isActive ? "bg-green-100 text-green-700" : ""}
                        >
                          {campaign.isActive ? (
                            <>
                              <Play className="w-3 h-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <Pause className="w-3 h-3 mr-1" />
                              Paused
                            </>
                          )}
                        </Badge>
                        <Switch
                          checked={campaign.isActive}
                          onCheckedChange={() => handleToggleCampaign(campaign.id)}
                        />
                      </div>
                    </div>

                    {/* Schedule Controls */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="text-xs font-medium text-slate-600 block mb-1">Send Time</label>
                        <Select value={campaign.time} onValueChange={(time) => handleTimeChange(campaign.id, time)}>
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="08:00">08:00</SelectItem>
                            <SelectItem value="09:00">09:00</SelectItem>
                            <SelectItem value="10:00">10:00</SelectItem>
                            <SelectItem value="11:00">11:00</SelectItem>
                            <SelectItem value="12:00">12:00</SelectItem>
                            <SelectItem value="14:00">14:00</SelectItem>
                            <SelectItem value="16:00">16:00</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-slate-600 block mb-1">Next Send</label>
                        <div className="text-sm font-medium text-slate-900 py-1">
                          {formatDate(campaign.nextSend)}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-slate-600 block mb-1">Subscribers</label>
                        <div className="text-sm font-medium text-slate-900 py-1">
                          {campaign.subscriberCount.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    {campaign.openRate && (
                      <div className="flex items-center gap-6 pt-3 border-t border-slate-200">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="text-xs text-slate-600">Open Rate: </span>
                          <span className="text-xs font-semibold text-slate-900">{campaign.openRate}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-slate-600">Click Rate: </span>
                          <span className="text-xs font-semibold text-slate-900">{campaign.clickRate}%</span>
                        </div>
                        {campaign.lastSent && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-slate-400" />
                            <span className="text-xs text-slate-500">
                              Last sent: {formatDate(campaign.lastSent)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex gap-3 justify-center">
        <Button 
          variant="outline"
          onClick={() => toast.info("Opening subscriber management...")}
        >
          <Users className="w-4 h-4 mr-2" />
          Manage Subscribers
        </Button>
        <Button 
          onClick={() => toast.info("Opening email analytics...")}
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          View Analytics
        </Button>
      </div>
    </div>
  );
}