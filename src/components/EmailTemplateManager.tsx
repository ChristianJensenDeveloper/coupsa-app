import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { Plus, Edit, Trash2, Copy, Eye, Mail, ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner@2.0.3";

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  type: 'welcome' | 'expiring' | 'transactional' | 'reengagement' | 'custom';
  category: 'Automated' | 'Campaign' | 'Transactional';
  htmlContent: string;
  variables: string[];
  isActive: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  previewText?: string;
}

interface EmailTemplateManagerProps {
  templates: EmailTemplate[];
  onSaveTemplate: (template: EmailTemplate) => void;
  onDeleteTemplate: (templateId: string) => void;
  onDuplicateTemplate: (template: EmailTemplate) => void;
  onBack: () => void;
}

const templateTypes = [
  { value: 'welcome', label: 'Welcome Email', category: 'Automated' },
  { value: 'expiring', label: 'Deal Expiring', category: 'Automated' },
  { value: 'transactional', label: 'Transactional', category: 'Transactional' },
  { value: 'reengagement', label: 'Re-engagement', category: 'Automated' },
  { value: 'custom', label: 'Custom', category: 'Campaign' }
];

const defaultTemplates = {
  welcome: `<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
  <div style="background: #3b82f6; padding: 40px 20px; text-align: center; color: white;">
    <h1>Welcome to REDUZED!</h1>
    <p>Your AI Deal Finder for Trading</p>
  </div>
  <div style="padding: 30px 20px;">
    <h2>Hi {{firstName}},</h2>
    <p>Welcome to REDUZED! We're excited to help you save money on your next trading challenge.</p>
    
    <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3>What's Next?</h3>
      <ul>
        <li>Browse our exclusive prop trading deals</li>
        <li>Save deals to your personal wallet</li>
        <li>Get notifications before deals expire</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{appUrl}}" style="background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px;">
        Start Saving Money
      </a>
    </div>
  </div>
</div>`,

  expiring: `<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
  <div style="background: linear-gradient(135deg, #f97316, #dc2626); padding: 40px 20px; text-align: center; color: white;">
    <h1>⏰ Deal Expires Soon!</h1>
    <p>Don't miss out on this exclusive offer</p>
  </div>
  <div style="padding: 30px 20px;">
    <h2>Hi {{firstName}},</h2>
    <p>Your saved deal from <strong>{{merchantName}}</strong> is expiring in <strong>{{daysRemaining}} days</strong>!</p>
    
    <div style="background: #fef3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
      <h3>{{dealTitle}}</h3>
      <p><strong>Discount:</strong> {{discount}}</p>
      <p><strong>Expires:</strong> {{expiryDate}}</p>
      <p><strong>Code:</strong> {{promoCode}}</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{dealUrl}}" style="background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px;">
        Claim Deal Now
      </a>
    </div>
  </div>
</div>`,

  transactional: `<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
  <div style="background: #1f2937; padding: 40px 20px; text-align: center; color: white;">
    <h1>Password Reset</h1>
    <p>REDUZED Account Security</p>
  </div>
  <div style="padding: 30px 20px;">
    <h2>Hi {{firstName}},</h2>
    <p>You requested to reset your password for your REDUZED account.</p>
    
    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p>Click the button below to reset your password. This link will expire in 1 hour.</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{resetUrl}}" style="background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px;">
        Reset Password
      </a>
    </div>
    
    <div style="background: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p><strong>Security Note:</strong> If you didn't request this reset, please ignore this email.</p>
    </div>
  </div>
</div>`
};

export function EmailTemplateManager({ 
  templates, 
  onSaveTemplate, 
  onDeleteTemplate, 
  onDuplicateTemplate,
  onBack 
}: EmailTemplateManagerProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [deleteTemplateId, setDeleteTemplateId] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  
  const [formData, setFormData] = useState<EmailTemplate>({
    id: '',
    name: '',
    subject: '',
    type: 'custom',
    category: 'Campaign',
    htmlContent: '',
    variables: [],
    isActive: true,
    usageCount: 0,
    createdAt: '',
    updatedAt: ''
  });

  const handleCreateNew = () => {
    setFormData({
      id: Date.now().toString(),
      name: '',
      subject: '',
      type: 'custom',
      category: 'Campaign',
      htmlContent: '',
      variables: [],
      isActive: true,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setSelectedTemplate(null);
    setIsCreatingNew(true);
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setFormData(template);
    setSelectedTemplate(template);
    setIsCreatingNew(false);
  };

  const handleSave = () => {
    if (!formData.name || !formData.subject || !formData.htmlContent) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Extract variables from HTML content
    const variables = Array.from(
      formData.htmlContent.matchAll(/\{\{(\w+)\}\}/g)
    ).map(match => match[1]);

    onSaveTemplate({
      ...formData,
      variables: Array.from(new Set(variables)),
      updatedAt: new Date().toISOString()
    });
    
    setSelectedTemplate(null);
    setIsCreatingNew(false);
    toast.success("Template saved successfully");
  };

  const handleDuplicate = (template: EmailTemplate) => {
    const duplicatedTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0
    };
    
    onDuplicateTemplate(duplicatedTemplate);
    toast.success("Template duplicated");
  };

  const loadTemplateContent = (type: string) => {
    const content = defaultTemplates[type as keyof typeof defaultTemplates];
    if (content) {
      setFormData(prev => ({ ...prev, htmlContent: content }));
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Automated': return 'bg-green-100 text-green-700';
      case 'Campaign': return 'bg-blue-100 text-blue-700';
      case 'Transactional': return 'bg-purple-100 text-purple-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const renderPreview = (template: EmailTemplate) => {
    // Simple preview by replacing common variables
    let previewContent = template.htmlContent
      .replace(/\{\{firstName\}\}/g, 'John')
      .replace(/\{\{merchantName\}\}/g, 'PropTrade Elite')
      .replace(/\{\{dealTitle\}\}/g, '90% Off CFD Challenge')
      .replace(/\{\{discount\}\}/g, '90% OFF')
      .replace(/\{\{daysRemaining\}\}/g, '3')
      .replace(/\{\{expiryDate\}\}/g, 'Dec 31, 2025')
      .replace(/\{\{promoCode\}\}/g, 'CFD90')
      .replace(/\{\{appUrl\}\}/g, '#')
      .replace(/\{\{dealUrl\}\}/g, '#')
      .replace(/\{\{resetUrl\}\}/g, '#');

    return (
      <div className="border rounded-lg overflow-hidden">
        <div dangerouslySetInnerHTML={{ __html: previewContent }} />
      </div>
    );
  };

  if (selectedTemplate || isCreatingNew) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => { setSelectedTemplate(null); setIsCreatingNew(false); }}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Templates
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {isCreatingNew ? 'Create Email Template' : 'Edit Email Template'}
              </h1>
              <p className="text-slate-600">
                Design reusable email templates for your automated flows
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor */}
          <div className="space-y-6">
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl">
              <CardHeader>
                <CardTitle>Template Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Welcome Email - New Users"
                  />
                </div>

                <div>
                  <Label htmlFor="subject">Subject Line</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Welcome to REDUZED!"
                  />
                </div>

                <div>
                  <Label htmlFor="type">Template Type</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => {
                      const typeData = templateTypes.find(t => t.value === value);
                      setFormData(prev => ({ 
                        ...prev, 
                        type: value as any,
                        category: typeData?.category as any || 'Campaign'
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {templateTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {formData.type !== 'custom' && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => loadTemplateContent(formData.type)}
                      className="mt-2"
                    >
                      Load Default Template
                    </Button>
                  )}
                </div>

                <div>
                  <Label htmlFor="previewText">Preview Text (Optional)</Label>
                  <Input
                    id="previewText"
                    value={formData.previewText || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, previewText: e.target.value }))}
                    placeholder="This text appears in email previews"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl">
              <CardHeader>
                <CardTitle>HTML Content</CardTitle>
                <p className="text-sm text-slate-600">
                  Use variables like <code className="bg-slate-100 px-1 rounded">{"{{firstName}}"}</code> for personalization
                </p>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.htmlContent}
                  onChange={(e) => setFormData(prev => ({ ...prev, htmlContent: e.target.value }))}
                  placeholder="Enter your HTML email template..."
                  rows={15}
                  className="font-mono text-sm"
                />
                
                {/* Variables detected */}
                {formData.htmlContent && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-slate-700 mb-2">Variables Detected:</p>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(formData.htmlContent.matchAll(/\{\{(\w+)\}\}/g))
                        .map(match => match[1])
                        .filter((value, index, array) => array.indexOf(value) === index)
                        .map(variable => (
                          <Badge key={variable} variant="outline">
                            {variable}
                          </Badge>
                        ))
                      }
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button onClick={handleSave} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                Save Template
              </Button>
              <Button 
                variant="outline" 
                onClick={() => { setSelectedTemplate(null); setIsCreatingNew(false); }}
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
                  Live Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-slate-600 border-b border-slate-200 pb-2">
                    <strong>Subject:</strong> {formData.subject || 'No subject'}
                  </div>
                  
                  {formData.htmlContent ? (
                    renderPreview(formData)
                  ) : (
                    <div className="text-center py-12 text-slate-500">
                      <Mail className="w-8 h-8 mx-auto mb-3 opacity-50" />
                      <p>Start typing HTML content to see preview</p>
                    </div>
                  )}
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
          <h1 className="text-2xl font-bold text-slate-900">Email Templates</h1>
          <p className="text-slate-600">
            Create and manage reusable email templates for your automated flows
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="border-0 shadow-lg bg-white/70 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg line-clamp-1">{template.name}</CardTitle>
                  <p className="text-sm text-slate-600 mt-1 line-clamp-1">
                    {template.subject}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Badge className={`text-xs ${getCategoryColor(template.category)} border-0`}>
                    {template.category}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {/* Variables */}
                {template.variables.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">Variables:</p>
                    <div className="flex flex-wrap gap-1">
                      {template.variables.slice(0, 3).map(variable => (
                        <Badge key={variable} variant="outline" className="text-xs">
                          {variable}
                        </Badge>
                      ))}
                      {template.variables.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.variables.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200">
                  <div className="text-center">
                    <div className="text-lg font-bold text-slate-900">
                      {template.usageCount}
                    </div>
                    <div className="text-xs text-slate-600">Times Used</div>
                  </div>
                  <div className="text-center">
                    <Badge variant={template.isActive ? "default" : "secondary"} className="text-xs">
                      {template.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3">
                  <Button 
                    size="sm" 
                    onClick={() => setPreviewTemplate(template)}
                    variant="outline"
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Preview
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => handleEditTemplate(template)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDuplicate(template)}
                    className="flex-1"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Duplicate
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setDeleteTemplateId(template.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Empty State */}
        {templates.length === 0 && (
          <div className="col-span-full">
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  No Templates Yet
                </h3>
                <p className="text-slate-600 mb-6 max-w-md mx-auto">
                  Create reusable email templates for welcome emails, deal notifications, and more.
                </p>
                <Button onClick={handleCreateNew}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Template
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Preview Dialog */}
      <AlertDialog open={!!previewTemplate} onOpenChange={(open) => !open && setPreviewTemplate(null)}>
        <AlertDialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Template Preview: {previewTemplate?.name}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Subject: {previewTemplate?.subject}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {previewTemplate && (
            <div className="mt-4">
              {renderPreview(previewTemplate)}
            </div>
          )}
          
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            {previewTemplate && (
              <AlertDialogAction onClick={() => {
                handleEditTemplate(previewTemplate);
                setPreviewTemplate(null);
              }}>
                Edit Template
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTemplateId} onOpenChange={(open) => !open && setDeleteTemplateId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this email template? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (deleteTemplateId) {
                  onDeleteTemplate(deleteTemplateId);
                  setDeleteTemplateId(null);
                  toast.success("Template deleted");
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Template
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}