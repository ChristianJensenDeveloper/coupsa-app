import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { ArrowRight, Plus, Trash2, Mail, Clock, Users, Zap, Play, Pause, Settings, Eye } from "lucide-react";
import { toast } from "sonner@2.0.3";

export interface EmailFlow {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'user_signup' | 'deal_expiring' | 'password_reset' | 'deal_saved' | 'inactive_user' | 'custom';
    conditions?: {
      days?: number;
      dealCategory?: string;
      userSegment?: string;
    };
  };
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
}

export interface EmailFlowStep {
  id: string;
  type: 'email' | 'delay' | 'condition';
  email?: {
    subject: string;
    templateId: string;
    fromName: string;
    fromEmail: string;
    personalizations: string[];
  };
  delay?: {
    duration: number;
    unit: 'minutes' | 'hours' | 'days';
  };
  condition?: {
    field: string;
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
    value: string;
    truePath: string[];
    falsePath: string[];
  };
}

interface EmailFlowBuilderProps {
  flows: EmailFlow[];
  onSaveFlow: (flow: EmailFlow) => void;
  onDeleteFlow: (flowId: string) => void;
  onToggleFlow: (flowId: string, isActive: boolean) => void;
  onBack: () => void;
}

// Mock templates for the flow builder
const mockTemplates = [
  { id: 'welcome-1', name: 'Welcome - Simple', type: 'welcome' },
  { id: 'welcome-2', name: 'Welcome - With Deals', type: 'welcome' },
  { id: 'expiry-1', name: 'Deal Expiring - 7 Days', type: 'expiring' },
  { id: 'expiry-2', name: 'Deal Expiring - 24 Hours', type: 'expiring' },
  { id: 'reset-1', name: 'Password Reset', type: 'transactional' },
  { id: 'inactive-1', name: 'Re-engagement', type: 'reengagement' }
];

export function EmailFlowBuilder({ flows, onSaveFlow, onDeleteFlow, onToggleFlow, onBack }: EmailFlowBuilderProps) {
  const [selectedFlow, setSelectedFlow] = useState<EmailFlow | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [deleteFlowId, setDeleteFlowId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<EmailFlow>({
    id: '',
    name: '',
    description: '',
    trigger: { type: 'user_signup' },
    steps: [],
    isActive: false,
    stats: { totalSent: 0, openRate: 0, clickRate: 0, conversionRate: 0 },
    createdAt: '',
    updatedAt: ''
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
      updatedAt: new Date().toISOString()
    });
    setSelectedFlow(null);
    setIsCreatingNew(true);
  };

  const handleEditFlow = (flow: EmailFlow) => {
    setFormData(flow);
    setSelectedFlow(flow);
    setIsCreatingNew(false);
  };

  const handleSave = () => {
    if (!formData.name || formData.steps.length === 0) {
      toast.error("Please add a name and at least one step");
      return;
    }

    onSaveFlow({
      ...formData,
      updatedAt: new Date().toISOString()
    });
    
    setSelectedFlow(null);
    setIsCreatingNew(false);
    toast.success("Email flow saved successfully");
  };

  const addEmailStep = () => {
    const newStep: EmailFlowStep = {
      id: Date.now().toString(),
      type: 'email',
      email: {
        subject: '',
        templateId: '',
        fromName: 'REDUZED Team',
        fromEmail: 'deals@reduzed.com',
        personalizations: []
      }
    };

    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
  };

  const addDelayStep = () => {
    const newStep: EmailFlowStep = {
      id: Date.now().toString(),
      type: 'delay',
      delay: {
        duration: 1,
        unit: 'days'
      }
    };

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

  const getTriggerIcon = (triggerType: string) => {
    switch (triggerType) {
      case 'user_signup': return '👋';
      case 'deal_expiring': return '⏰';
      case 'password_reset': return '🔐';
      case 'deal_saved': return '💾';
      case 'inactive_user': return '😴';
      default: return '⚡';
    }
  };

  const getTriggerLabel = (triggerType: string) => {
    switch (triggerType) {
      case 'user_signup': return 'User Signup';
      case 'deal_expiring': return 'Deal Expiring';
      case 'password_reset': return 'Password Reset';
      case 'deal_saved': return 'Deal Saved';
      case 'inactive_user': return 'Inactive User';
      default: return 'Custom Trigger';
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
              <h1 className="text-2xl font-bold text-slate-900">
                {isCreatingNew ? 'Create Email Flow' : 'Edit Email Flow'}
              </h1>
              <p className="text-slate-600">
                Build automated email sequences that trigger based on user actions
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Flow Settings */}
          <div className="space-y-6">
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-500" />
                  Flow Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what this email flow does"
                    rows={3}
                  />
                </div>

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
                      <SelectItem value="user_signup">👋 User Signup</SelectItem>
                      <SelectItem value="deal_saved">💾 Deal Saved</SelectItem>
                      <SelectItem value="deal_expiring">⏰ Deal Expiring</SelectItem>
                      <SelectItem value="password_reset">🔐 Password Reset</SelectItem>
                      <SelectItem value="inactive_user">😴 Inactive User</SelectItem>
                      <SelectItem value="custom">⚡ Custom Trigger</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.trigger.type === 'deal_expiring' && (
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
                )}

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

            {/* Flow Steps */}
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-blue-500" />
                    Flow Steps
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={addEmailStep}>
                      <Mail className="w-4 h-4 mr-1" />
                      Email
                    </Button>
                    <Button size="sm" variant="outline" onClick={addDelayStep}>
                      <Clock className="w-4 h-4 mr-1" />
                      Delay
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {formData.steps.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Mail className="w-8 h-8 mx-auto mb-3 opacity-50" />
                    <p>No steps added yet</p>
                    <p className="text-sm">Click the buttons above to add email or delay steps</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.steps.map((step, index) => (
                      <div key={step.id} className="relative">
                        {index > 0 && (
                          <div className="absolute -top-4 left-6 w-0.5 h-4 bg-blue-200"></div>
                        )}
                        
                        <Card className="bg-white border-slate-200">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3 flex-1">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  {step.type === 'email' ? (
                                    <Mail className="w-5 h-5 text-blue-600" />
                                  ) : (
                                    <Clock className="w-5 h-5 text-orange-600" />
                                  )}
                                </div>
                                
                                <div className="flex-1 space-y-3">
                                  {step.type === 'email' ? (
                                    <>
                                      <div>
                                        <Label>Subject Line</Label>
                                        <Input
                                          value={step.email?.subject || ''}
                                          onChange={(e) => updateStep(step.id, {
                                            email: { ...step.email!, subject: e.target.value }
                                          })}
                                          placeholder="Email subject"
                                        />
                                      </div>
                                      
                                      <div>
                                        <Label>Template</Label>
                                        <Select
                                          value={step.email?.templateId || ''}
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
                                                {template.name}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </>
                                  ) : (
                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <Label>Duration</Label>
                                        <Input
                                          type="number"
                                          value={step.delay?.duration || 1}
                                          onChange={(e) => updateStep(step.id, {
                                            delay: { ...step.delay!, duration: parseInt(e.target.value) }
                                          })}
                                        />
                                      </div>
                                      <div>
                                        <Label>Unit</Label>
                                        <Select
                                          value={step.delay?.unit || 'days'}
                                          onValueChange={(value) => updateStep(step.id, {
                                            delay: { ...step.delay!, unit: value as any }
                                          })}
                                        >
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="minutes">Minutes</SelectItem>
                                            <SelectItem value="hours">Hours</SelectItem>
                                            <SelectItem value="days">Days</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => removeStep(step.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
              <Button onClick={handleSave} className="flex-1">
                <Settings className="w-4 h-4 mr-2" />
                Save Flow
              </Button>
              <Button 
                variant="outline" 
                onClick={() => { setSelectedFlow(null); setIsCreatingNew(false); }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>

          {/* Preview */}
          <div>
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
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white">
                      {getTriggerIcon(formData.trigger.type)}
                    </div>
                    <div>
                      <div className="font-medium">{getTriggerLabel(formData.trigger.type)}</div>
                      <div className="text-sm text-slate-600">Trigger Event</div>
                    </div>
                  </div>

                  {/* Steps */}
                  {formData.steps.map((step, index) => (
                    <div key={step.id} className="relative">
                      {index === 0 && (
                        <div className="absolute -top-6 left-4 w-0.5 h-6 bg-slate-300"></div>
                      )}
                      
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${
                          step.type === 'email' ? 'bg-blue-500' : 'bg-orange-500'
                        }`}>
                          {step.type === 'email' ? (
                            <Mail className="w-4 h-4" />
                          ) : (
                            <Clock className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          {step.type === 'email' ? (
                            <div>
                              <div className="font-medium truncate">
                                {step.email?.subject || 'Untitled Email'}
                              </div>
                              <div className="text-sm text-slate-600">
                                {step.email?.templateId ? 
                                  mockTemplates.find(t => t.id === step.email?.templateId)?.name || 'Template'
                                  : 'No template selected'
                                }
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="font-medium">
                                Wait {step.delay?.duration} {step.delay?.unit}
                              </div>
                              <div className="text-sm text-slate-600">Delay</div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {index < formData.steps.length - 1 && (
                        <div className="absolute -bottom-2 left-4 w-0.5 h-4 bg-slate-300"></div>
                      )}
                    </div>
                  ))}
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
          <h1 className="text-2xl font-bold text-slate-900">Email Flows</h1>
          <p className="text-slate-600">
            Create automated email sequences triggered by user actions
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          Create Flow
        </Button>
      </div>

      {/* Flows List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {flows.map((flow) => (
          <Card key={flow.id} className="border-0 shadow-lg bg-white/70 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-lg">
                    {getTriggerIcon(flow.trigger.type)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{flow.name}</CardTitle>
                    <Badge variant={flow.isActive ? "default" : "secondary"} className="mt-1">
                      {flow.isActive ? "Active" : "Paused"}
                    </Badge>
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
            
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-slate-600 line-clamp-2">
                  {flow.description}
                </p>

                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Zap className="w-4 h-4" />
                  {getTriggerLabel(flow.trigger.type)}
                  <span className="mx-1">•</span>
                  {flow.steps.length} steps
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200">
                  <div className="text-center">
                    <div className="text-lg font-bold text-slate-900">
                      {flow.stats.totalSent.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-600">Sent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-slate-900">
                      {flow.stats.openRate}%
                    </div>
                    <div className="text-xs text-slate-600">Open Rate</div>
                  </div>
                </div>

                {/* Actions */}
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
                    onClick={() => setDeleteFlowId(flow.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Empty State */}
        {flows.length === 0 && (
          <div className="col-span-full">
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  No Email Flows Yet
                </h3>
                <p className="text-slate-600 mb-6 max-w-md mx-auto">
                  Create automated email sequences that trigger based on user actions like signups, deal saves, or approaching expirations.
                </p>
                <Button onClick={handleCreateNew}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Flow
                </Button>
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