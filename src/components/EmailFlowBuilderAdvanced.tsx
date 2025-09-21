import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { ArrowRight, Plus, Trash2, Mail, Clock, Users, Zap, Play, Pause, Settings, Eye, GripVertical, Copy, RotateCcw, ChevronDown, ChevronRight, Target, GitBranch, User, Calendar, ShoppingBag, Bell, Repeat } from "lucide-react";
import { toast } from "sonner@2.0.3";

export interface EmailFlow {
  id: string;
  name: string;
  description: string;
  trigger: EmailFlowTrigger;
  steps: EmailFlowStep[];
  isActive: boolean;
  stats: {
    totalSent: number;
    openRate: number;
    clickRate: number;
    conversionRate: number;
  };
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  priority?: 'low' | 'medium' | 'high';
}

export interface EmailFlowTrigger {
  type: 'user_signup' | 'deal_expiring' | 'password_reset' | 'deal_saved' | 'inactive_user' | 'deal_clicked' | 'profile_updated' | 'subscription_ended' | 'custom';
  conditions?: {
    days?: number;
    dealCategory?: string;
    userSegment?: string;
    minDealValue?: number;
    userTags?: string[];
    customField?: string;
    customValue?: string;
    operator?: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'exists' | 'not_exists';
  };
  schedule?: {
    enabled: boolean;
    time?: string;
    days?: string[];
    timezone?: string;
  };
}

export interface EmailFlowStep {
  id: string;
  type: 'email' | 'delay' | 'condition' | 'action' | 'webhook';
  order: number;
  email?: {
    subject: string;
    templateId: string;
    fromName: string;
    fromEmail: string;
    personalizations: string[];
    language?: string;
    priority?: 'low' | 'normal' | 'high';
  };
  delay?: {
    duration: number;
    unit: 'minutes' | 'hours' | 'days' | 'weeks';
    workingDaysOnly?: boolean;
  };
  condition?: {
    field: string;
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'exists' | 'not_exists';
    value: string;
    truePath: string[];
    falsePath: string[];
  };
  action?: {
    type: 'add_tag' | 'remove_tag' | 'update_field' | 'send_notification';
    parameters: Record<string, any>;
  };
  webhook?: {
    url: string;
    method: 'GET' | 'POST';
    headers?: Record<string, string>;
    body?: string;
  };
  isCollapsed?: boolean;
}

interface EmailFlowBuilderAdvancedProps {
  flows: EmailFlow[];
  onSaveFlow: (flow: EmailFlow) => void;
  onDeleteFlow: (flowId: string) => void;
  onToggleFlow: (flowId: string, isActive: boolean) => void;
  onDuplicateFlow?: (flow: EmailFlow) => void;
  onBack: () => void;
}

// Enhanced mock templates
const mockTemplates = [
  { id: 'welcome-1', name: 'Welcome - Simple', type: 'welcome', language: 'en' },
  { id: 'welcome-2', name: 'Welcome - With Deals', type: 'welcome', language: 'en' },
  { id: 'welcome-es', name: 'Bienvenido - Simple', type: 'welcome', language: 'es' },
  { id: 'expiry-1', name: 'Deal Expiring - 7 Days', type: 'expiring', language: 'en' },
  { id: 'expiry-2', name: 'Deal Expiring - 24 Hours', type: 'expiring', language: 'en' },
  { id: 'expiry-urgent', name: 'Last Chance - Urgent', type: 'expiring', language: 'en' },
  { id: 'reset-1', name: 'Password Reset', type: 'transactional', language: 'en' },
  { id: 'inactive-1', name: 'Re-engagement', type: 'reengagement', language: 'en' },
  { id: 'abandoned-1', name: 'Abandoned Deal Follow-up', type: 'follow_up', language: 'en' },
  { id: 'success-1', name: 'Deal Claimed Success', type: 'success', language: 'en' }
];

// Enhanced trigger types
const triggerTypes = [
  { 
    value: 'user_signup', 
    label: 'User Signup', 
    icon: '👋', 
    description: 'When a new user creates an account',
    color: 'bg-green-500'
  },
  { 
    value: 'deal_saved', 
    label: 'Deal Saved', 
    icon: '💾', 
    description: 'When a user saves a deal to their wallet',
    color: 'bg-blue-500'
  },
  { 
    value: 'deal_expiring', 
    label: 'Deal Expiring', 
    icon: '⏰', 
    description: 'Before a saved deal expires',
    color: 'bg-orange-500'
  },
  { 
    value: 'deal_clicked', 
    label: 'Deal Clicked', 
    icon: '🔗', 
    description: 'When a user clicks on a deal',
    color: 'bg-purple-500'
  },
  { 
    value: 'inactive_user', 
    label: 'Inactive User', 
    icon: '😴', 
    description: 'When a user hasn\'t been active for X days',
    color: 'bg-gray-500'
  },
  { 
    value: 'profile_updated', 
    label: 'Profile Updated', 
    icon: '👤', 
    description: 'When a user updates their profile',
    color: 'bg-indigo-500'
  },
  { 
    value: 'subscription_ended', 
    label: 'Subscription Ended', 
    icon: '📅', 
    description: 'When a user\'s subscription ends',
    color: 'bg-red-500'
  },
  { 
    value: 'password_reset', 
    label: 'Password Reset', 
    icon: '🔐', 
    description: 'When a user requests password reset',
    color: 'bg-yellow-500'
  },
  { 
    value: 'custom', 
    label: 'Custom Trigger', 
    icon: '⚡', 
    description: 'Define your own custom trigger conditions',
    color: 'bg-teal-500'
  }
];

export function EmailFlowBuilderAdvanced({ flows, onSaveFlow, onDeleteFlow, onToggleFlow, onDuplicateFlow, onBack }: EmailFlowBuilderAdvancedProps) {
  const [selectedFlow, setSelectedFlow] = useState<EmailFlow | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [deleteFlowId, setDeleteFlowId] = useState<string | null>(null);
  const [draggedStep, setDraggedStep] = useState<EmailFlowStep | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [showTriggerDetails, setShowTriggerDetails] = useState(false);
  const [selectedStepType, setSelectedStepType] = useState<'email' | 'delay' | 'condition' | 'action' | 'webhook'>('email');
  
  const [formData, setFormData] = useState<EmailFlow>({
    id: '',
    name: '',
    description: '',
    trigger: { type: 'user_signup' },
    steps: [],
    isActive: false,
    stats: { totalSent: 0, openRate: 0, clickRate: 0, conversionRate: 0 },
    createdAt: '',
    updatedAt: '',
    tags: [],
    priority: 'medium'
  });

  const handleCreateNew = () => {
    setFormData({
      id: Date.now().toString(),
      name: '',
      description: '',
      trigger: { type: 'user_signup' },
      steps: [],
      isActive: false,
      stats: { totalSent: 0, openRate: 0, clickRate: 0, conversionRate: 0 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: [],
      priority: 'medium'
    });
    setSelectedFlow(null);
    setIsCreatingNew(true);
  };

  const handleEditFlow = (flow: EmailFlow) => {
    setFormData(flow);
    setSelectedFlow(flow);
    setIsCreatingNew(false);
  };

  const handleDuplicateFlow = (flow: EmailFlow) => {
    if (onDuplicateFlow) {
      const duplicatedFlow = {
        ...flow,
        id: Date.now().toString(),
        name: `${flow.name} (Copy)`,
        isActive: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        stats: { totalSent: 0, openRate: 0, clickRate: 0, conversionRate: 0 }
      };
      onDuplicateFlow(duplicatedFlow);
      toast.success("Flow duplicated successfully");
    }
  };

  const handleSave = () => {
    if (!formData.name || formData.steps.length === 0) {
      toast.error("Please add a name and at least one step");
      return;
    }

    // Ensure steps have correct order
    const orderedSteps = formData.steps.map((step, index) => ({
      ...step,
      order: index
    }));

    onSaveFlow({
      ...formData,
      steps: orderedSteps,
      updatedAt: new Date().toISOString()
    });
    
    setSelectedFlow(null);
    setIsCreatingNew(false);
    toast.success("Email flow saved successfully");
  };

  const addStep = (type: EmailFlowStep['type']) => {
    const newStep: EmailFlowStep = {
      id: Date.now().toString(),
      type,
      order: formData.steps.length,
      isCollapsed: false
    };

    switch (type) {
      case 'email':
        newStep.email = {
          subject: '',
          templateId: '',
          fromName: 'REDUZED Team',
          fromEmail: 'deals@reduzed.com',
          personalizations: [],
          priority: 'normal'
        };
        break;
      case 'delay':
        newStep.delay = {
          duration: 1,
          unit: 'days',
          workingDaysOnly: false
        };
        break;
      case 'condition':
        newStep.condition = {
          field: 'user.email',
          operator: 'exists',
          value: '',
          truePath: [],
          falsePath: []
        };
        break;
      case 'action':
        newStep.action = {
          type: 'add_tag',
          parameters: { tag: '' }
        };
        break;
      case 'webhook':
        newStep.webhook = {
          url: '',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: '{}'
        };
        break;
    }

    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
  };

  const removeStep = (stepId: string) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId)
    }));
  };

  const updateStep = (stepId: string, updates: Partial<EmailFlowStep>) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.id === stepId ? { ...step, ...updates } : step
      )
    }));
  };

  const duplicateStep = (step: EmailFlowStep) => {
    const duplicatedStep = {
      ...step,
      id: Date.now().toString(),
      order: step.order + 1
    };

    setFormData(prev => ({
      ...prev,
      steps: [
        ...prev.steps.slice(0, step.order + 1),
        duplicatedStep,
        ...prev.steps.slice(step.order + 1).map(s => ({ ...s, order: s.order + 1 }))
      ]
    }));
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, step: EmailFlowStep) => {
    setDraggedStep(step);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (!draggedStep) return;

    const dragIndex = formData.steps.findIndex(step => step.id === draggedStep.id);
    if (dragIndex === dropIndex) return;

    const newSteps = [...formData.steps];
    const [removed] = newSteps.splice(dragIndex, 1);
    newSteps.splice(dropIndex, 0, removed);

    // Update order
    const reorderedSteps = newSteps.map((step, index) => ({
      ...step,
      order: index
    }));

    setFormData(prev => ({
      ...prev,
      steps: reorderedSteps
    }));

    setDraggedStep(null);
    setDragOverIndex(null);
  };

  const getTriggerInfo = (triggerType: string) => {
    return triggerTypes.find(t => t.value === triggerType) || triggerTypes[0];
  };

  const getStepIcon = (type: EmailFlowStep['type']) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'delay': return <Clock className="w-4 h-4" />;
      case 'condition': return <GitBranch className="w-4 h-4" />;
      case 'action': return <Target className="w-4 h-4" />;
      case 'webhook': return <Zap className="w-4 h-4" />;
      default: return <Mail className="w-4 h-4" />;
    }
  };

  const getStepColor = (type: EmailFlowStep['type']) => {
    switch (type) {
      case 'email': return 'bg-blue-500';
      case 'delay': return 'bg-orange-500';
      case 'condition': return 'bg-purple-500';
      case 'action': return 'bg-green-500';
      case 'webhook': return 'bg-teal-500';
      default: return 'bg-blue-500';
    }
  };

  if (selectedFlow || isCreatingNew) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => { setSelectedFlow(null); setIsCreatingNew(false); }}>
              <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
              Back to Flows
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {isCreatingNew ? 'Create Email Flow' : 'Edit Email Flow'}
              </h1>
              <p className="text-slate-600">
                Build automated email sequences with advanced triggers and conditions
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => toast.info('Testing flow...')}>
              <Play className="w-4 h-4 mr-2" />
              Test Flow
            </Button>
            <Button onClick={handleSave}>
              <Settings className="w-4 h-4 mr-2" />
              Save Flow
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Flow Settings */}
          <div className="xl:col-span-2 space-y-6">
            {/* Basic Settings */}
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-500" />
                  Flow Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Flow Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Welcome Series for New Users"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select 
                      value={formData.priority} 
                      onValueChange={(value: 'low' | 'medium' | 'high') => 
                        setFormData(prev => ({ ...prev, priority: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">🟢 Low Priority</SelectItem>
                        <SelectItem value="medium">🟡 Medium Priority</SelectItem>
                        <SelectItem value="high">🔴 High Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what this email flow does and when it should trigger"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags?.join(', ') || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) 
                    }))}
                    placeholder="e.g., onboarding, deals, urgent"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Active</Label>
                    <p className="text-sm text-slate-600">Enable this email flow</p>
                  </div>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Trigger Configuration */}
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-green-500" />
                    Trigger Configuration
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowTriggerDetails(!showTriggerDetails)}
                  >
                    {showTriggerDetails ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    {showTriggerDetails ? 'Hide' : 'Show'} Details
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="trigger">Trigger Event</Label>
                  <Select 
                    value={formData.trigger.type} 
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      trigger: { ...prev.trigger, type: value as any }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {triggerTypes.map(trigger => (
                        <SelectItem key={trigger.value} value={trigger.value}>
                          <div className="flex items-center gap-2">
                            <span>{trigger.icon}</span>
                            <div>
                              <div>{trigger.label}</div>
                              <div className="text-xs text-slate-500">{trigger.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {showTriggerDetails && (
                  <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    {/* Trigger-specific conditions */}
                    {formData.trigger.type === 'deal_expiring' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiry-days">Days Before Expiry</Label>
                          <Input
                            id="expiry-days"
                            type="number"
                            value={formData.trigger.conditions?.days || 7}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              trigger: { 
                                ...prev.trigger, 
                                conditions: { ...prev.trigger.conditions, days: parseInt(e.target.value) }
                              }
                            }))}
                            placeholder="7"
                          />
                        </div>
                        <div>
                          <Label htmlFor="deal-category">Deal Category</Label>
                          <Select
                            value={formData.trigger.conditions?.dealCategory || ''}
                            onValueChange={(value) => setFormData(prev => ({ 
                              ...prev, 
                              trigger: { 
                                ...prev.trigger, 
                                conditions: { ...prev.trigger.conditions, dealCategory: value }
                              }
                            }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Any category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Any Category</SelectItem>
                              <SelectItem value="CFD Prop">CFD Prop</SelectItem>
                              <SelectItem value="Futures Prop">Futures Prop</SelectItem>
                              <SelectItem value="Broker Bonuses">Broker Bonuses</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    {formData.trigger.type === 'inactive_user' && (
                      <div>
                        <Label htmlFor="inactive-days">Days of Inactivity</Label>
                        <Input
                          id="inactive-days"
                          type="number"
                          value={formData.trigger.conditions?.days || 7}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            trigger: { 
                              ...prev.trigger, 
                              conditions: { ...prev.trigger.conditions, days: parseInt(e.target.value) }
                            }
                          }))}
                          placeholder="7"
                        />
                      </div>
                    )}

                    {formData.trigger.type === 'custom' && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="custom-field">Field</Label>
                          <Input
                            id="custom-field"
                            value={formData.trigger.conditions?.customField || ''}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              trigger: { 
                                ...prev.trigger, 
                                conditions: { ...prev.trigger.conditions, customField: e.target.value }
                              }
                            }))}
                            placeholder="user.email"
                          />
                        </div>
                        <div>
                          <Label htmlFor="custom-operator">Operator</Label>
                          <Select
                            value={formData.trigger.conditions?.operator || 'equals'}
                            onValueChange={(value: any) => setFormData(prev => ({ 
                              ...prev, 
                              trigger: { 
                                ...prev.trigger, 
                                conditions: { ...prev.trigger.conditions, operator: value }
                              }
                            }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="equals">Equals</SelectItem>
                              <SelectItem value="contains">Contains</SelectItem>
                              <SelectItem value="greater_than">Greater Than</SelectItem>
                              <SelectItem value="less_than">Less Than</SelectItem>
                              <SelectItem value="exists">Exists</SelectItem>
                              <SelectItem value="not_exists">Does Not Exist</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="custom-value">Value</Label>
                          <Input
                            id="custom-value"
                            value={formData.trigger.conditions?.customValue || ''}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              trigger: { 
                                ...prev.trigger, 
                                conditions: { ...prev.trigger.conditions, customValue: e.target.value }
                              }
                            }))}
                            placeholder="Value to compare"
                          />
                        </div>
                      </div>
                    )}

                    {/* Schedule settings */}
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <Label>Scheduled Trigger</Label>
                        <Switch
                          checked={formData.trigger.schedule?.enabled || false}
                          onCheckedChange={(checked) => setFormData(prev => ({ 
                            ...prev, 
                            trigger: { 
                              ...prev.trigger, 
                              schedule: { ...prev.trigger.schedule, enabled: checked }
                            }
                          }))}
                        />
                      </div>
                      
                      {formData.trigger.schedule?.enabled && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Time</Label>
                            <Input
                              type="time"
                              value={formData.trigger.schedule?.time || '09:00'}
                              onChange={(e) => setFormData(prev => ({ 
                                ...prev, 
                                trigger: { 
                                  ...prev.trigger, 
                                  schedule: { ...prev.trigger.schedule, time: e.target.value }
                                }
                              }))}
                            />
                          </div>
                          <div>
                            <Label>Timezone</Label>
                            <Select
                              value={formData.trigger.schedule?.timezone || 'UTC'}
                              onValueChange={(value) => setFormData(prev => ({ 
                                ...prev, 
                                trigger: { 
                                  ...prev.trigger, 
                                  schedule: { ...prev.trigger.schedule, timezone: value }
                                }
                              }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="UTC">UTC</SelectItem>
                                <SelectItem value="America/New_York">Eastern Time</SelectItem>
                                <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                                <SelectItem value="Europe/London">London</SelectItem>
                                <SelectItem value="Europe/Berlin">Berlin</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Flow Steps with Enhanced Editing */}
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-blue-500" />
                    Flow Steps
                  </CardTitle>
                  <div className="flex gap-2">
                    <Select value={selectedStepType} onValueChange={(value: any) => setSelectedStepType(value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">📧 Email</SelectItem>
                        <SelectItem value="delay">⏱️ Delay</SelectItem>
                        <SelectItem value="condition">🔀 Condition</SelectItem>
                        <SelectItem value="action">🎯 Action</SelectItem>
                        <SelectItem value="webhook">🔗 Webhook</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button size="sm" onClick={() => addStep(selectedStepType)}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Step
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {formData.steps.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-8 h-8 opacity-50" />
                    </div>
                    <h3 className="font-medium mb-2">No steps added yet</h3>
                    <p className="text-sm mb-4">Build your email flow by adding steps above</p>
                    <Button onClick={() => addStep('email')} variant="outline">
                      <Mail className="w-4 h-4 mr-2" />
                      Add First Email Step
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.steps
                      .sort((a, b) => a.order - b.order)
                      .map((step, index) => (
                      <div 
                        key={step.id} 
                        className={`relative ${dragOverIndex === index ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, index)}
                      >
                        {index > 0 && (
                          <div className="absolute -top-2 left-6 w-0.5 h-4 bg-slate-300"></div>
                        )}
                        
                        <Card className="bg-white border-slate-200 hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              {/* Drag Handle */}
                              <div 
                                className="cursor-move hover:bg-slate-100 p-1 rounded"
                                draggable
                                onDragStart={(e) => handleDragStart(e, step)}
                              >
                                <GripVertical className="w-4 h-4 text-slate-400" />
                              </div>
                              
                              {/* Step Icon */}
                              <div className={`w-10 h-10 ${getStepColor(step.type)} rounded-lg flex items-center justify-center text-white flex-shrink-0`}>
                                {getStepIcon(step.type)}
                              </div>
                              
                              {/* Step Content */}
                              <div className="flex-1 space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="secondary">{step.type.charAt(0).toUpperCase() + step.type.slice(1)}</Badge>
                                    <span className="text-sm text-slate-500">Step {index + 1}</span>
                                  </div>
                                  
                                  <div className="flex items-center gap-1">
                                    <Button 
                                      size="sm" 
                                      variant="ghost"
                                      onClick={() => updateStep(step.id, { isCollapsed: !step.isCollapsed })}
                                    >
                                      {step.isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="ghost"
                                      onClick={() => duplicateStep(step)}
                                    >
                                      <Copy className="w-4 h-4" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      onClick={() => removeStep(step.id)}
                                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                                
                                {!step.isCollapsed && (
                                  <div className="space-y-3">
                                    {step.type === 'email' && step.email && (
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                          <Label>Subject Line</Label>
                                          <Input
                                            value={step.email.subject}
                                            onChange={(e) => updateStep(step.id, {
                                              email: { ...step.email!, subject: e.target.value }
                                            })}
                                            placeholder="Email subject"
                                          />
                                        </div>
                                        <div>
                                          <Label>Template</Label>
                                          <Select
                                            value={step.email.templateId}
                                            onValueChange={(value) => updateStep(step.id, {
                                              email: { ...step.email!, templateId: value }
                                            })}
                                          >
                                            <SelectTrigger>
                                              <SelectValue placeholder="Choose template" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {mockTemplates.map(template => (
                                                <SelectItem key={template.id} value={template.id}>
                                                  {template.name} ({template.language})
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div>
                                          <Label>Priority</Label>
                                          <Select
                                            value={step.email.priority || 'normal'}
                                            onValueChange={(value: any) => updateStep(step.id, {
                                              email: { ...step.email!, priority: value }
                                            })}
                                          >
                                            <SelectTrigger>
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="low">🟢 Low</SelectItem>
                                              <SelectItem value="normal">🟡 Normal</SelectItem>
                                              <SelectItem value="high">🔴 High</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div>
                                          <Label>Language</Label>
                                          <Select
                                            value={step.email.language || 'en'}
                                            onValueChange={(value) => updateStep(step.id, {
                                              email: { ...step.email!, language: value }
                                            })}
                                          >
                                            <SelectTrigger>
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="en">🇺🇸 English</SelectItem>
                                              <SelectItem value="es">🇪🇸 Spanish</SelectItem>
                                              <SelectItem value="pt-BR">🇧🇷 Portuguese</SelectItem>
                                              <SelectItem value="fr">🇫🇷 French</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {step.type === 'delay' && step.delay && (
                                      <div className="grid grid-cols-3 gap-3">
                                        <div>
                                          <Label>Duration</Label>
                                          <Input
                                            type="number"
                                            value={step.delay.duration}
                                            onChange={(e) => updateStep(step.id, {
                                              delay: { ...step.delay!, duration: parseInt(e.target.value) }
                                            })}
                                          />
                                        </div>
                                        <div>
                                          <Label>Unit</Label>
                                          <Select
                                            value={step.delay.unit}
                                            onValueChange={(value: any) => updateStep(step.id, {
                                              delay: { ...step.delay!, unit: value }
                                            })}
                                          >
                                            <SelectTrigger>
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="minutes">Minutes</SelectItem>
                                              <SelectItem value="hours">Hours</SelectItem>
                                              <SelectItem value="days">Days</SelectItem>
                                              <SelectItem value="weeks">Weeks</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div className="flex items-center justify-center">
                                          <div className="space-y-1">
                                            <Label className="text-xs">Working Days Only</Label>
                                            <Switch
                                              checked={step.delay.workingDaysOnly || false}
                                              onCheckedChange={(checked) => updateStep(step.id, {
                                                delay: { ...step.delay!, workingDaysOnly: checked }
                                              })}
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {step.type === 'condition' && step.condition && (
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div>
                                          <Label>Field</Label>
                                          <Input
                                            value={step.condition.field}
                                            onChange={(e) => updateStep(step.id, {
                                              condition: { ...step.condition!, field: e.target.value }
                                            })}
                                            placeholder="e.g., user.email"
                                          />
                                        </div>
                                        <div>
                                          <Label>Operator</Label>
                                          <Select
                                            value={step.condition.operator}
                                            onValueChange={(value: any) => updateStep(step.id, {
                                              condition: { ...step.condition!, operator: value }
                                            })}
                                          >
                                            <SelectTrigger>
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="equals">Equals</SelectItem>
                                              <SelectItem value="contains">Contains</SelectItem>
                                              <SelectItem value="greater_than">Greater Than</SelectItem>
                                              <SelectItem value="less_than">Less Than</SelectItem>
                                              <SelectItem value="exists">Exists</SelectItem>
                                              <SelectItem value="not_exists">Does Not Exist</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div>
                                          <Label>Value</Label>
                                          <Input
                                            value={step.condition.value}
                                            onChange={(e) => updateStep(step.id, {
                                              condition: { ...step.condition!, value: e.target.value }
                                            })}
                                            placeholder="Comparison value"
                                          />
                                        </div>
                                      </div>
                                    )}

                                    {step.type === 'action' && step.action && (
                                      <div className="grid grid-cols-2 gap-3">
                                        <div>
                                          <Label>Action Type</Label>
                                          <Select
                                            value={step.action.type}
                                            onValueChange={(value: any) => updateStep(step.id, {
                                              action: { ...step.action!, type: value }
                                            })}
                                          >
                                            <SelectTrigger>
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="add_tag">Add Tag</SelectItem>
                                              <SelectItem value="remove_tag">Remove Tag</SelectItem>
                                              <SelectItem value="update_field">Update Field</SelectItem>
                                              <SelectItem value="send_notification">Send Notification</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div>
                                          <Label>Parameters</Label>
                                          <Input
                                            value={JSON.stringify(step.action.parameters)}
                                            onChange={(e) => {
                                              try {
                                                const params = JSON.parse(e.target.value);
                                                updateStep(step.id, {
                                                  action: { ...step.action!, parameters: params }
                                                });
                                              } catch {}
                                            }}
                                            placeholder='{"key": "value"}'
                                          />
                                        </div>
                                      </div>
                                    )}

                                    {step.type === 'webhook' && step.webhook && (
                                      <div className="space-y-3">
                                        <div className="grid grid-cols-3 gap-3">
                                          <div className="col-span-2">
                                            <Label>Webhook URL</Label>
                                            <Input
                                              value={step.webhook.url}
                                              onChange={(e) => updateStep(step.id, {
                                                webhook: { ...step.webhook!, url: e.target.value }
                                              })}
                                              placeholder="https://api.example.com/webhook"
                                            />
                                          </div>
                                          <div>
                                            <Label>Method</Label>
                                            <Select
                                              value={step.webhook.method}
                                              onValueChange={(value: 'GET' | 'POST') => updateStep(step.id, {
                                                webhook: { ...step.webhook!, method: value }
                                              })}
                                            >
                                              <SelectTrigger>
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="GET">GET</SelectItem>
                                                <SelectItem value="POST">POST</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                        </div>
                                        <div>
                                          <Label>Request Body (JSON)</Label>
                                          <Textarea
                                            value={step.webhook.body || '{}'}
                                            onChange={(e) => updateStep(step.id, {
                                              webhook: { ...step.webhook!, body: e.target.value }
                                            })}
                                            placeholder='{"user_id": "{{user.id}}", "event": "flow_step"}'
                                            rows={3}
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        
                        {index < formData.steps.length - 1 && (
                          <div className="absolute -bottom-2 left-6 w-0.5 h-4 bg-slate-300"></div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Preview Sidebar */}
          <div className="space-y-6">
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-500" />
                  Flow Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Trigger */}
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
                    <div className={`w-10 h-10 ${getTriggerInfo(formData.trigger.type).color} rounded-lg flex items-center justify-center text-white text-lg`}>
                      {getTriggerInfo(formData.trigger.type).icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{getTriggerInfo(formData.trigger.type).label}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Trigger Event</div>
                      {formData.trigger.conditions?.days && (
                        <div className="text-xs text-slate-500">
                          {formData.trigger.conditions.days} days
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Steps */}
                  {formData.steps
                    .sort((a, b) => a.order - b.order)
                    .map((step, index) => (
                    <div key={step.id} className="relative">
                      {index === 0 && (
                        <div className="absolute -top-6 left-5 w-0.5 h-6 bg-slate-300"></div>
                      )}
                      
                      <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className={`w-8 h-8 ${getStepColor(step.type)} rounded-lg flex items-center justify-center text-white`}>
                          {getStepIcon(step.type)}
                        </div>
                        <div className="flex-1">
                          {step.type === 'email' && step.email ? (
                            <div>
                              <div className="font-medium truncate text-sm">
                                {step.email.subject || 'Untitled Email'}
                              </div>
                              <div className="text-xs text-slate-600 dark:text-slate-400">
                                {step.email.templateId ? 
                                  mockTemplates.find(t => t.id === step.email?.templateId)?.name || 'Template'
                                  : 'No template selected'
                                }
                              </div>
                              {step.email.priority !== 'normal' && (
                                <Badge variant="secondary" className="text-xs mt-1">
                                  {step.email.priority}
                                </Badge>
                              )}
                            </div>
                          ) : step.type === 'delay' && step.delay ? (
                            <div>
                              <div className="font-medium text-sm">
                                Wait {step.delay.duration} {step.delay.unit}
                              </div>
                              <div className="text-xs text-slate-600 dark:text-slate-400">
                                {step.delay.workingDaysOnly ? 'Working days only' : 'Any day'}
                              </div>
                            </div>
                          ) : step.type === 'condition' && step.condition ? (
                            <div>
                              <div className="font-medium text-sm">
                                If {step.condition.field} {step.condition.operator} {step.condition.value}
                              </div>
                              <div className="text-xs text-slate-600 dark:text-slate-400">Condition</div>
                            </div>
                          ) : step.type === 'action' && step.action ? (
                            <div>
                              <div className="font-medium text-sm">
                                {step.action.type.replace('_', ' ')}
                              </div>
                              <div className="text-xs text-slate-600 dark:text-slate-400">Action</div>
                            </div>
                          ) : step.type === 'webhook' && step.webhook ? (
                            <div>
                              <div className="font-medium text-sm">
                                {step.webhook.method} {step.webhook.url ? new URL(step.webhook.url).hostname : 'webhook'}
                              </div>
                              <div className="text-xs text-slate-600 dark:text-slate-400">Webhook</div>
                            </div>
                          ) : (
                            <div>
                              <div className="font-medium text-sm capitalize">{step.type}</div>
                              <div className="text-xs text-slate-600 dark:text-slate-400">Step {index + 1}</div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {index < formData.steps.length - 1 && (
                        <div className="absolute -bottom-2 left-5 w-0.5 h-4 bg-slate-300"></div>
                      )}
                    </div>
                  ))}

                  {formData.steps.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      <div className="text-sm">No steps added yet</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-lg">Flow Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Total Steps</span>
                  <span className="font-medium">{formData.steps.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Email Steps</span>
                  <span className="font-medium">{formData.steps.filter(s => s.type === 'email').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Total Delay</span>
                  <span className="font-medium">
                    {formData.steps
                      .filter(s => s.type === 'delay')
                      .reduce((total, step) => {
                        if (!step.delay) return total;
                        const multiplier = step.delay.unit === 'minutes' ? 1/60/24 : 
                                         step.delay.unit === 'hours' ? 1/24 : 
                                         step.delay.unit === 'weeks' ? 7 : 1;
                        return total + (step.delay.duration * multiplier);
                      }, 0).toFixed(1)} days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Priority</span>
                  <Badge variant={formData.priority === 'high' ? 'destructive' : 'secondary'}>
                    {formData.priority}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Email Flows</h1>
          <p className="text-slate-600">
            Create and manage automated email sequences with advanced triggers
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack}>
            <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
            Back to Email Management
          </Button>
          <Button onClick={handleCreateNew}>
            <Plus className="w-4 h-4 mr-2" />
            Create Flow
          </Button>
        </div>
      </div>

      {/* Enhanced Flows Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {flows.map((flow) => {
          const triggerInfo = getTriggerInfo(flow.trigger.type);
          return (
            <Card key={flow.id} className="border-0 shadow-lg bg-white/70 backdrop-blur-xl hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 ${triggerInfo.color} rounded-xl flex items-center justify-center text-white text-lg`}>
                      {triggerInfo.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{flow.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={flow.isActive ? "default" : "secondary"} className="text-xs">
                          {flow.isActive ? "Active" : "Paused"}
                        </Badge>
                        {flow.priority && flow.priority !== 'medium' && (
                          <Badge variant={flow.priority === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                            {flow.priority}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onToggleFlow(flow.id, !flow.isActive)}
                  >
                    {flow.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 line-clamp-2">
                  {flow.description}
                </p>

                {flow.tags && flow.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {flow.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {flow.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{flow.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Zap className="w-4 h-4" />
                  {triggerInfo.label}
                  <span className="mx-1">•</span>
                  {flow.steps.length} steps
                </div>

                {/* Enhanced Stats */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-200">
                  <div className="text-center">
                    <div className="text-sm font-bold text-slate-900">
                      {flow.stats.totalSent.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-600">Sent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-slate-900">
                      {flow.stats.openRate}%
                    </div>
                    <div className="text-xs text-slate-600">Opens</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-slate-900">
                      {flow.stats.conversionRate}%
                    </div>
                    <div className="text-xs text-slate-600">Converts</div>
                  </div>
                </div>

                {/* Enhanced Actions */}
                <div className="flex gap-2 pt-3">
                  <Button 
                    size="sm" 
                    onClick={() => handleEditFlow(flow)}
                    className="flex-1"
                  >
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDuplicateFlow(flow)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setDeleteFlowId(flow.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Enhanced Empty State */}
        {flows.length === 0 && (
          <div className="col-span-full">
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Zap className="w-10 h-10 text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                  No Email Flows Yet
                </h3>
                <p className="text-slate-600 mb-8 max-w-md mx-auto">
                  Create automated email sequences that trigger based on user actions like signups, deal saves, or approaching expirations. Build sophisticated workflows with conditions, delays, and webhooks.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={handleCreateNew} size="lg">
                    <Plus className="w-5 h-5 mr-2" />
                    Create Your First Flow
                  </Button>
                  <Button variant="outline" size="lg" onClick={onBack}>
                    <ArrowRight className="w-5 h-5 mr-2 rotate-180" />
                    Back to Email Management
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteFlowId} onOpenChange={(open) => !open && setDeleteFlowId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Email Flow</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this email flow? This will stop all active sequences and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (deleteFlowId) {
                  onDeleteFlow(deleteFlowId);
                  setDeleteFlowId(null);
                  toast.success("Email flow deleted");
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Flow
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}