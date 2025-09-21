import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Bell, MessageSquare, Smartphone, Plus, Edit2, Send, Clock, Users, TrendingUp, Eye, MousePointer, CheckCircle2, XCircle, BarChart3, AlertTriangle, MapPin, Bookmark, Trash2, MoreVertical } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "./ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";

interface NotificationTemplate {
  id: string;
  name: string;
  channel: 'SMS' | 'WhatsApp' | 'Both';
  message: string;
  createdAt: string;
  isActive: boolean;
}

interface NotificationTrigger {
  id: string;
  name: string;
  type: 'saved_deal_expiry' | 'new_deal_published' | 'custom_broadcast';
  channel: 'SMS' | 'WhatsApp' | 'Both';
  template: string;
  isActive: boolean;
  settings: any;
}

interface NotificationLog {
  id: string;
  date: string;
  channel: 'SMS' | 'WhatsApp';
  message: string;
  audience: string;
  status: 'Sent' | 'Failed';
  recipients: number;
  delivered: number;
  opened: number;
  clicked: number;
  cost: number;
}

export function AdminNotifications() {
  // Global notification channel settings
  const [channelSettings, setChannelSettings] = useState({
    smsEnabled: true,
    whatsappEnabled: true
  });

  // Templates state
  const [templates, setTemplates] = useState<NotificationTemplate[]>([
    {
      id: '1',
      name: 'Saved Deal Reminder',
      channel: 'Both',
      message: 'The deal you saved will expire in 10 minutes! Don\'t miss out on this exclusive offer.',
      createdAt: '2025-01-01T10:00:00Z',
      isActive: true
    },
    {
      id: '2', 
      name: 'New Deal Alert',
      channel: 'SMS',
      message: 'New broker/prop deal just dropped - check it out! Limited time offer available now.',
      createdAt: '2025-01-01T11:00:00Z',
      isActive: true
    },
    {
      id: '3',
      name: 'Flash Sale Alert',
      channel: 'WhatsApp',
      message: 'Flash Sale: 95% off challenge fees! Only 24 hours remaining. Claim now!',
      createdAt: '2025-01-02T09:00:00Z',
      isActive: false
    }
  ]);

  // Triggers state
  const [triggers, setTriggers] = useState<NotificationTrigger[]>([
    {
      id: '1',
      name: 'Saved Deal Expiry Reminder',
      type: 'saved_deal_expiry',
      channel: 'Both',
      template: 'Saved Deal Reminder',
      isActive: true,
      settings: { minutesBefore: 10 }
    },
    {
      id: '2',
      name: 'New Deal Published Alert', 
      type: 'new_deal_published',
      channel: 'SMS',
      template: 'New Deal Alert',
      isActive: true,
      settings: { categories: ['All'] }
    }
  ]);

  // Notification logs with detailed metrics
  const [notificationLogs] = useState<NotificationLog[]>([
    {
      id: '1',
      date: '2025-01-02T14:30:00Z',
      channel: 'SMS',
      message: 'New broker/prop deal just dropped - check it out! Limited time offer available now.',
      audience: 'All users (1,250)',
      status: 'Sent',
      recipients: 1250,
      delivered: 1225,
      opened: 892,
      clicked: 267,
      cost: 62.50
    },
    {
      id: '2',
      date: '2025-01-02T13:15:00Z', 
      channel: 'WhatsApp',
      message: 'The deal you saved will expire in 10 minutes! Don\'t miss out on this exclusive offer.',
      audience: 'Users with saved deals (342)',
      status: 'Sent',
      recipients: 342,
      delivered: 340,
      opened: 289,
      clicked: 156,
      cost: 8.55
    },
    {
      id: '3',
      date: '2025-01-02T12:00:00Z',
      channel: 'SMS',
      message: 'Flash Sale: 95% off challenge fees! Only 24 hours remaining. Claim now!',
      audience: 'CFD Prop users (890)',
      status: 'Failed',
      recipients: 890,
      delivered: 0,
      opened: 0,
      clicked: 0,
      cost: 0
    },
    {
      id: '4',
      date: '2025-01-01T16:45:00Z',
      channel: 'WhatsApp', 
      message: 'New futures trading deal with 80% profit split - check it out now!',
      audience: 'Futures Prop users (567)',
      status: 'Sent',
      recipients: 567,
      delivered: 560,
      opened: 445,
      clicked: 178,
      cost: 14.18
    },
    {
      id: '5',
      date: '2025-01-01T14:20:00Z',
      channel: 'SMS',
      message: 'Your saved FTMO deal expires tomorrow! Don\'t miss your 30% discount.',
      audience: 'FTMO savers (234)',
      status: 'Sent',
      recipients: 234,
      delivered: 231,
      opened: 198,
      clicked: 89,
      cost: 11.70
    },
    {
      id: '6',
      date: '2025-01-01T11:30:00Z',
      channel: 'WhatsApp',
      message: 'Welcome to REDUZED! Your first exclusive deal awaits - 90% off CFD challenge.',
      audience: 'New signups (89)',
      status: 'Sent',
      recipients: 89,
      delivered: 87,
      opened: 76,
      clicked: 34,
      cost: 2.23
    }
  ]);

  // Form states
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    channel: 'SMS' as 'SMS' | 'WhatsApp' | 'Both',
    message: ''
  });

  const [customBroadcast, setCustomBroadcast] = useState({
    message: '',
    channel: 'SMS' as 'SMS' | 'WhatsApp' | 'Both', 
    audience: 'all' as 'all' | 'country' | 'saved_deals',
    selectedTemplate: '' as string
  });

  const [showNewTemplateForm, setShowNewTemplateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<NotificationTemplate | null>(null);
  const [editTemplateForm, setEditTemplateForm] = useState({
    name: '',
    channel: 'SMS' as 'SMS' | 'WhatsApp' | 'Both',
    message: ''
  });

  const handleChannelToggle = (channel: 'smsEnabled' | 'whatsappEnabled') => {
    setChannelSettings(prev => ({
      ...prev,
      [channel]: !prev[channel]
    }));
    toast.success(`${channel === 'smsEnabled' ? 'SMS' : 'WhatsApp'} ${channelSettings[channel] ? 'disabled' : 'enabled'}`);
  };

  const handleAddTemplate = () => {
    if (!newTemplate.name || !newTemplate.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (newTemplate.message.length > (newTemplate.channel === 'SMS' ? 160 : 300)) {
      toast.error(`Message too long for ${newTemplate.channel}`);
      return;
    }

    const template: NotificationTemplate = {
      id: Date.now().toString(),
      ...newTemplate,
      createdAt: new Date().toISOString(),
      isActive: true
    };

    setTemplates(prev => [...prev, template]);
    setNewTemplate({ name: '', channel: 'SMS', message: '' });
    setShowNewTemplateForm(false);
    toast.success("Template created successfully");
  };

  const handleToggleTemplate = (templateId: string) => {
    setTemplates(prev => prev.map(template =>
      template.id === templateId 
        ? { ...template, isActive: !template.isActive }
        : template
    ));
  };

  const handleToggleTrigger = (triggerId: string) => {
    setTriggers(prev => prev.map(trigger =>
      trigger.id === triggerId
        ? { ...trigger, isActive: !trigger.isActive }
        : trigger
    ));
  };

  const handleUseTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setCustomBroadcast(prev => ({
        ...prev,
        message: template.message,
        channel: template.channel,
        selectedTemplate: templateId
      }));
      toast.success(`Template "${template.name}" loaded!`);
    }
  };

  const handleClearTemplate = () => {
    setCustomBroadcast(prev => ({
      ...prev,
      message: '',
      selectedTemplate: ''
    }));
  };

  const handleEditTemplate = (template: NotificationTemplate) => {
    setEditingTemplate(template);
    setEditTemplateForm({
      name: template.name,
      channel: template.channel,
      message: template.message
    });
  };

  const handleUpdateTemplate = () => {
    if (!editTemplateForm.name || !editTemplateForm.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (editTemplateForm.message.length > (editTemplateForm.channel === 'SMS' ? 160 : 300)) {
      toast.error(`Message too long for ${editTemplateForm.channel}`);
      return;
    }

    setTemplates(prev => prev.map(template =>
      template.id === editingTemplate?.id
        ? { ...template, ...editTemplateForm }
        : template
    ));

    setEditingTemplate(null);
    setEditTemplateForm({ name: '', channel: 'SMS', message: '' });
    toast.success("Template updated successfully");
  };

  const handleDeleteTemplate = (template: NotificationTemplate) => {
    setTemplateToDelete(template);
  };

  const confirmDeleteTemplate = () => {
    if (templateToDelete) {
      setTemplates(prev => prev.filter(template => template.id !== templateToDelete.id));
      
      // Update any triggers using this template
      setTriggers(prev => prev.map(trigger =>
        trigger.template === templateToDelete.name
          ? { ...trigger, isActive: false }
          : trigger
      ));

      // Clear from custom broadcast if selected
      if (customBroadcast.selectedTemplate === templateToDelete.id) {
        setCustomBroadcast(prev => ({
          ...prev,
          selectedTemplate: '',
          message: ''
        }));
      }

      toast.success(`Template "${templateToDelete.name}" deleted`);
      setTemplateToDelete(null);
    }
  };

  const handleSendBroadcast = () => {
    if (!customBroadcast.message) {
      toast.error("Please enter a message or select a template");
      return;
    }

    const maxLength = customBroadcast.channel === 'SMS' ? 160 : 300;
    if (customBroadcast.message.length > maxLength) {
      toast.error(`Message too long for ${customBroadcast.channel} (max ${maxLength} chars)`);
      return;
    }

    // Simulate sending broadcast
    const templateUsed = customBroadcast.selectedTemplate ? 
      templates.find(t => t.id === customBroadcast.selectedTemplate)?.name : 
      'Custom message';
    
    toast.success(`Broadcast sent successfully! ${templateUsed ? `Using: ${templateUsed}` : ''}`);
    setCustomBroadcast({ message: '', channel: 'SMS', audience: 'all', selectedTemplate: '' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getChannelBadge = (channel: 'SMS' | 'WhatsApp') => {
    return channel === 'SMS' 
      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
  };

  const getStatusBadge = (status: 'Sent' | 'Failed') => {
    return status === 'Sent'
      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-700/30 shadow-lg p-6">
        <h2 className="text-xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent mb-2">
          Notifications (MVP)
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Manage notification channels and send messages to users. Keep it simple: SMS & WhatsApp for now, email can come later.
        </p>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/30 dark:border-slate-700/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Send className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {notificationLogs.filter(log => log.status === 'Sent').length}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Campaigns Sent</div>
                <div className="text-xs text-slate-500 dark:text-slate-500">
                  {notificationLogs.reduce((sum, log) => sum + log.delivered, 0).toLocaleString()} delivered
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/30 dark:border-slate-700/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {Math.round((notificationLogs.reduce((sum, log) => sum + log.opened, 0) / notificationLogs.reduce((sum, log) => sum + log.delivered, 0)) * 100)}%
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Open Rate</div>
                <div className="text-xs text-slate-500 dark:text-slate-500">
                  {notificationLogs.reduce((sum, log) => sum + log.opened, 0).toLocaleString()} opens
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/30 dark:border-slate-700/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <MousePointer className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {Math.round((notificationLogs.reduce((sum, log) => sum + log.clicked, 0) / notificationLogs.reduce((sum, log) => sum + log.opened, 0)) * 100)}%
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Click Rate</div>
                <div className="text-xs text-slate-500 dark:text-slate-500">
                  {notificationLogs.reduce((sum, log) => sum + log.clicked, 0).toLocaleString()} clicks
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/30 dark:border-slate-700/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  ${notificationLogs.reduce((sum, log) => sum + log.cost, 0).toFixed(2)}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Total Cost</div>
                <div className="text-xs text-slate-500 dark:text-slate-500">
                  ${(notificationLogs.reduce((sum, log) => sum + log.cost, 0) / notificationLogs.reduce((sum, log) => sum + log.clicked, 0)).toFixed(3)} per click
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Channel Performance Comparison */}
      <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/30 dark:border-slate-700/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Channel Performance Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SMS Performance */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h4 className="font-medium text-slate-900 dark:text-slate-100">SMS Performance</h4>
              </div>
              {(() => {
                const smsLogs = notificationLogs.filter(log => log.channel === 'SMS' && log.status === 'Sent');
                const totalSent = smsLogs.reduce((sum, log) => sum + log.recipients, 0);
                const totalDelivered = smsLogs.reduce((sum, log) => sum + log.delivered, 0);
                const totalOpened = smsLogs.reduce((sum, log) => sum + log.opened, 0);
                const totalClicked = smsLogs.reduce((sum, log) => sum + log.clicked, 0);
                const totalCost = smsLogs.reduce((sum, log) => sum + log.cost, 0);
                
                return (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Delivery Rate</span>
                      <div className="text-right">
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0}%
                        </span>
                        <p className="text-xs text-slate-500 dark:text-slate-500">
                          {totalDelivered.toLocaleString()} / {totalSent.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Open Rate</span>
                      <div className="text-right">
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {totalDelivered > 0 ? Math.round((totalOpened / totalDelivered) * 100) : 0}%
                        </span>
                        <p className="text-xs text-slate-500 dark:text-slate-500">
                          {totalOpened.toLocaleString()} opens
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Click Rate</span>
                      <div className="text-right">
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {totalOpened > 0 ? Math.round((totalClicked / totalOpened) * 100) : 0}%
                        </span>
                        <p className="text-xs text-slate-500 dark:text-slate-500">
                          {totalClicked.toLocaleString()} clicks
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Cost per Click</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        ${totalClicked > 0 ? (totalCost / totalClicked).toFixed(3) : '0.000'}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* WhatsApp Performance */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h4 className="font-medium text-slate-900 dark:text-slate-100">WhatsApp Performance</h4>
              </div>
              {(() => {
                const whatsappLogs = notificationLogs.filter(log => log.channel === 'WhatsApp' && log.status === 'Sent');
                const totalSent = whatsappLogs.reduce((sum, log) => sum + log.recipients, 0);
                const totalDelivered = whatsappLogs.reduce((sum, log) => sum + log.delivered, 0);
                const totalOpened = whatsappLogs.reduce((sum, log) => sum + log.opened, 0);
                const totalClicked = whatsappLogs.reduce((sum, log) => sum + log.clicked, 0);
                const totalCost = whatsappLogs.reduce((sum, log) => sum + log.cost, 0);
                
                return (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Delivery Rate</span>
                      <div className="text-right">
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0}%
                        </span>
                        <p className="text-xs text-slate-500 dark:text-slate-500">
                          {totalDelivered.toLocaleString()} / {totalSent.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Open Rate</span>
                      <div className="text-right">
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {totalDelivered > 0 ? Math.round((totalOpened / totalDelivered) * 100) : 0}%
                        </span>
                        <p className="text-xs text-slate-500 dark:text-slate-500">
                          {totalOpened.toLocaleString()} opens
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Click Rate</span>
                      <div className="text-right">
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {totalOpened > 0 ? Math.round((totalClicked / totalOpened) * 100) : 0}%
                        </span>
                        <p className="text-xs text-slate-500 dark:text-slate-500">
                          {totalClicked.toLocaleString()} clicks
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Cost per Click</span>
                      <span className="font-bold text-green-600 dark:text-green-400">
                        ${totalClicked > 0 ? (totalCost / totalClicked).toFixed(3) : '0.000'}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Channels (Global Settings) */}
      <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/30 dark:border-slate-700/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Notification Channels (Global Settings)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <Label className="text-slate-900 dark:text-slate-100 font-medium">SMS Notifications</Label>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Global SMS messaging system</p>
                </div>
              </div>
              <Switch
                checked={channelSettings.smsEnabled}
                onCheckedChange={() => handleChannelToggle('smsEnabled')}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-green-600 dark:text-green-400" />
                <div>
                  <Label className="text-slate-900 dark:text-slate-100 font-medium">WhatsApp Notifications</Label>
                  <p className="text-xs text-slate-600 dark:text-slate-400">WhatsApp Business API integration</p>
                </div>
              </div>
              <Switch
                checked={channelSettings.whatsappEnabled}
                onCheckedChange={() => handleChannelToggle('whatsappEnabled')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Templates Section */}
        <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/30 dark:border-slate-700/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                Templates (Pre-defined Messages)
              </CardTitle>
              <Button 
                size="sm" 
                onClick={() => setShowNewTemplateForm(true)}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Template
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {templates.map((template) => (
              <div key={template.id} className="p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="font-medium text-slate-900 dark:text-slate-100">{template.name}</div>
                    <Badge className={template.channel === 'SMS' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : template.channel === 'WhatsApp' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'}>
                      {template.channel}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUseTemplate(template.id)}
                      className="text-xs"
                    >
                      Use Template
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => handleEditTemplate(template)}>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteTemplate(template)}
                          className="text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Switch
                      checked={template.isActive}
                      onCheckedChange={() => handleToggleTemplate(template.id)}
                    />
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{template.message}</p>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Created: {formatDate(template.createdAt)} • {template.message.length} chars
                </div>
              </div>
            ))}

            {/* New Template Form */}
            {showNewTemplateForm && (
              <div className="p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-700/30">
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Template Name</Label>
                    <Input
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Saved Deal / New Deal / Custom"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Channel</Label>
                    <Select value={newTemplate.channel} onValueChange={(value: 'SMS' | 'WhatsApp' | 'Both') => setNewTemplate(prev => ({ ...prev, channel: value }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SMS">SMS</SelectItem>
                        <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                        <SelectItem value="Both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Message Text</Label>
                    <Textarea
                      value={newTemplate.message}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Your message here..."
                      rows={3}
                      className="mt-1"
                    />
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {newTemplate.message.length}/{newTemplate.channel === 'SMS' ? '160' : '300'} chars {newTemplate.channel === 'SMS' ? '(SMS limit)' : '(WhatsApp limit)'}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAddTemplate} className="bg-blue-600 hover:bg-blue-700">
                      Create Template
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setShowNewTemplateForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Triggers Section */}
        <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/30 dark:border-slate-700/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              Triggers (Basic Automation Rules)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {triggers.map((trigger) => (
              <div key={trigger.id} className="p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="font-medium text-slate-900 dark:text-slate-100 mb-1">{trigger.name}</div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getChannelBadge(trigger.channel as 'SMS' | 'WhatsApp')}>
                        {trigger.channel}
                      </Badge>
                      <span className="text-xs text-slate-500 dark:text-slate-400">→ {trigger.template}</span>
                    </div>
                    {trigger.type === 'saved_deal_expiry' && (
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Triggers {trigger.settings.minutesBefore} minutes before saved deal expires
                      </p>
                    )}
                    {trigger.type === 'new_deal_published' && (
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Triggers when new deal is published for opted-in users
                      </p>
                    )}
                  </div>
                  <Switch
                    checked={trigger.isActive}
                    onCheckedChange={() => handleToggleTrigger(trigger.id)}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Custom Broadcast */}
      <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/30 dark:border-slate-700/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Custom Broadcast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Template Selector */}
            <div className="bg-slate-50/50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200/50 dark:border-slate-700/50">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium">Use Existing Template</Label>
                {customBroadcast.selectedTemplate && (
                  <Button size="sm" variant="outline" onClick={handleClearTemplate}>
                    Clear Template
                  </Button>
                )}
              </div>
              <Select 
                value={customBroadcast.selectedTemplate} 
                onValueChange={(value) => {
                  if (value === 'none') {
                    handleClearTemplate();
                  } else {
                    handleUseTemplate(value);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template or write custom message" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    <div className="flex items-center gap-2">
                      <Edit2 className="w-4 h-4 text-slate-500" />
                      Write custom message
                    </div>
                  </SelectItem>
                  {templates.filter(t => t.isActive).map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center gap-2">
                        {template.channel === 'SMS' ? (
                          <Smartphone className="w-4 h-4 text-blue-500" />
                        ) : template.channel === 'WhatsApp' ? (
                          <MessageSquare className="w-4 h-4 text-green-500" />
                        ) : (
                          <div className="flex gap-1">
                            <Smartphone className="w-3 h-3 text-blue-500" />
                            <MessageSquare className="w-3 h-3 text-green-500" />
                          </div>
                        )}
                        <span className="font-medium">{template.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {template.channel}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Template Preview */}
              {customBroadcast.selectedTemplate && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Template: {templates.find(t => t.id === customBroadcast.selectedTemplate)?.name}
                    </span>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300 bg-white/50 dark:bg-slate-800/50 p-2 rounded border">
                    {templates.find(t => t.id === customBroadcast.selectedTemplate)?.message}
                  </p>
                </div>
              )}
            </div>

            {/* Message Composition */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">Message Content</Label>
                  {customBroadcast.selectedTemplate && (
                    <Badge variant="outline" className="text-xs">
                      From template
                    </Badge>
                  )}
                </div>
                <Textarea
                  value={customBroadcast.message}
                  onChange={(e) => setCustomBroadcast(prev => ({ 
                    ...prev, 
                    message: e.target.value,
                    selectedTemplate: '' // Clear template selection when manually editing
                  }))}
                  placeholder="Enter your broadcast message or select a template above..."
                  rows={4}
                  className={customBroadcast.selectedTemplate ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-700/30' : ''}
                />
                <div className="flex items-center justify-between mt-1">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {customBroadcast.message.length}/{customBroadcast.channel === 'SMS' ? '160' : customBroadcast.channel === 'WhatsApp' ? '300' : '300'} chars
                  </div>
                  {customBroadcast.message.length > (customBroadcast.channel === 'SMS' ? 160 : 300) && (
                    <div className="text-xs text-red-500 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Too long for {customBroadcast.channel}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Channel</Label>
                  <Select 
                    value={customBroadcast.channel} 
                    onValueChange={(value: 'SMS' | 'WhatsApp' | 'Both') => setCustomBroadcast(prev => ({ ...prev, channel: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SMS">
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-blue-500" />
                          SMS (160 chars)
                        </div>
                      </SelectItem>
                      <SelectItem value="WhatsApp">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-green-500" />
                          WhatsApp (300 chars)
                        </div>
                      </SelectItem>
                      <SelectItem value="Both">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <Smartphone className="w-3 h-3 text-blue-500" />
                            <MessageSquare className="w-3 h-3 text-green-500" />
                          </div>
                          Both Channels
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Target Audience</Label>
                  <Select 
                    value={customBroadcast.audience} 
                    onValueChange={(value: 'all' | 'country' | 'saved_deals') => setCustomBroadcast(prev => ({ ...prev, audience: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-purple-500" />
                          All users (~1,250)
                        </div>
                      </SelectItem>
                      <SelectItem value="country">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-orange-500" />
                          By Country
                        </div>
                      </SelectItem>
                      <SelectItem value="saved_deals">
                        <div className="flex items-center gap-2">
                          <Bookmark className="w-4 h-4 text-green-500" />
                          Saved deal followers (~340)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Send Button */}
                <Button 
                  onClick={handleSendBroadcast} 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700"
                  disabled={!customBroadcast.message || customBroadcast.message.length > (customBroadcast.channel === 'SMS' ? 160 : 300)}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Broadcast
                </Button>

                {/* Quick Stats */}
                <div className="bg-slate-50/50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200/50 dark:border-slate-700/50">
                  <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">Estimated Reach</div>
                  <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex justify-between">
                      <span>Recipients:</span>
                      <span className="font-medium">
                        {customBroadcast.audience === 'all' ? '1,250' : 
                         customBroadcast.audience === 'saved_deals' ? '340' : 'Variable'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Est. Cost:</span>
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        ${customBroadcast.audience === 'all' ? 
                          (customBroadcast.channel === 'SMS' ? '62.50' : customBroadcast.channel === 'WhatsApp' ? '31.25' : '93.75') : 
                          customBroadcast.audience === 'saved_deals' ? 
                          (customBroadcast.channel === 'SMS' ? '17.00' : customBroadcast.channel === 'WhatsApp' ? '8.50' : '25.50') : 
                          'TBD'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Log / History with Metrics */}
      <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/30 dark:border-slate-700/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            Notification History & Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Audience</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Delivered</TableHead>
                  <TableHead>Opened</TableHead>
                  <TableHead>Clicked</TableHead>
                  <TableHead>Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notificationLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium text-sm">
                      {formatDate(log.date)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getChannelBadge(log.channel)}>
                        {log.channel}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs text-sm">
                      <div className="truncate" title={log.message}>
                        {log.message}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {log.audience}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(log.status)}>
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {log.status === 'Sent' ? (
                        <div>
                          <div className="font-medium">{log.delivered.toLocaleString()}</div>
                          <div className="text-xs text-slate-500">
                            {log.recipients > 0 ? Math.round((log.delivered / log.recipients) * 100) : 0}%
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {log.status === 'Sent' && log.delivered > 0 ? (
                        <div>
                          <div className="font-medium">{log.opened.toLocaleString()}</div>
                          <div className="text-xs text-slate-500">
                            {Math.round((log.opened / log.delivered) * 100)}%
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {log.status === 'Sent' && log.opened > 0 ? (
                        <div>
                          <div className="font-medium">{log.clicked.toLocaleString()}</div>
                          <div className="text-xs text-slate-500">
                            {Math.round((log.clicked / log.opened) * 100)}%
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {log.status === 'Sent' ? (
                        <div>
                          <div className="font-medium">${log.cost.toFixed(2)}</div>
                          {log.clicked > 0 && (
                            <div className="text-xs text-slate-500">
                              ${(log.cost / log.clicked).toFixed(3)}/click
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* Performance Insights */}
          <div className="mt-6 p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
            <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Performance Insights
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-slate-600 dark:text-slate-400">
                  WhatsApp has higher open rates (82% vs 73%)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-500" />
                <span className="text-slate-600 dark:text-slate-400">
                  Saved deal reminders perform best (85% open rate)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MousePointer className="w-4 h-4 text-purple-500" />
                <span className="text-slate-600 dark:text-slate-400">
                  Flash sales drive highest click rates (45%+ CTR)
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Template Dialog */}
      <Dialog open={!!editingTemplate} onOpenChange={(open) => !open && setEditingTemplate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Edit Template: {editingTemplate?.name}
            </DialogTitle>
            <DialogDescription>
              Update your notification template settings and message content.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-sm font-medium">Template Name</Label>
              <Input
                value={editTemplateForm.name}
                onChange={(e) => setEditTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Saved Deal Reminder, New Deal Alert"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium">Channel</Label>
              <Select 
                value={editTemplateForm.channel} 
                onValueChange={(value: 'SMS' | 'WhatsApp' | 'Both') => setEditTemplateForm(prev => ({ ...prev, channel: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SMS">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-blue-500" />
                      SMS (160 chars)
                    </div>
                  </SelectItem>
                  <SelectItem value="WhatsApp">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-green-500" />
                      WhatsApp (300 chars)
                    </div>
                  </SelectItem>
                  <SelectItem value="Both">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <Smartphone className="w-3 h-3 text-blue-500" />
                        <MessageSquare className="w-3 h-3 text-green-500" />
                      </div>
                      Both Channels
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Message</Label>
              <Textarea
                value={editTemplateForm.message}
                onChange={(e) => setEditTemplateForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Enter your notification message..."
                rows={4}
                className="mt-1"
              />
              <div className="flex items-center justify-between mt-1">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {editTemplateForm.message.length}/{editTemplateForm.channel === 'SMS' ? '160' : '300'} chars
                </div>
                {editTemplateForm.message.length > (editTemplateForm.channel === 'SMS' ? 160 : 300) && (
                  <div className="text-xs text-red-500 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Too long for {editTemplateForm.channel}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => setEditingTemplate(null)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateTemplate}
              disabled={!editTemplateForm.name || !editTemplateForm.message || editTemplateForm.message.length > (editTemplateForm.channel === 'SMS' ? 160 : 300)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Update Template
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!templateToDelete} onOpenChange={(open) => !open && setTemplateToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-500" />
              Delete Template
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the template "{templateToDelete?.name}"? 
              This action cannot be undone and will disable any automated triggers using this template.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteTemplate}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Template
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}