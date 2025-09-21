import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { toast } from 'sonner@2.0.3';
import { Search, Edit3, Save, RotateCcw, Globe, Type, MessageSquare, AlertTriangle } from 'lucide-react';

// Define string categories for better organization
export type StringCategory = 
  | 'ui_navigation' 
  | 'ui_buttons' 
  | 'ui_labels' 
  | 'ui_messages' 
  | 'content_titles' 
  | 'content_descriptions' 
  | 'deal_content' 
  | 'notifications' 
  | 'errors_warnings'
  | 'placeholders';

export interface EditableString {
  id: string;
  key: string;
  category: StringCategory;
  context: string;
  defaultValue: string;
  currentValue: string;
  description?: string;
  maxLength?: number;
  isRequired?: boolean;
  translations?: Record<string, string>;
}

// Default strings extracted from the app
const DEFAULT_STRINGS: EditableString[] = [
  // Navigation & UI
  {
    id: 'app_title',
    key: 'app.title',
    category: 'ui_navigation',
    context: 'main_header',
    defaultValue: 'COUPZA',
    currentValue: 'COUPZA',
    description: 'Main application title displayed in header',
    maxLength: 10,
    isRequired: true
  },
  {
    id: 'app_tagline',
    key: 'app.tagline',
    category: 'ui_navigation',
    context: 'main_header',
    defaultValue: 'AI Deal Finder',
    currentValue: 'AI Deal Finder',
    description: 'Tagline under main title',
    maxLength: 20
  },
  {
    id: 'main_headline',
    key: 'home.headline',
    category: 'content_titles',
    context: 'home_page',
    defaultValue: 'Stop Overpaying for Your Prop Challenge',
    currentValue: 'Stop Overpaying for Your Prop Challenge',
    description: 'Main headline on home page',
    maxLength: 60
  },
  {
    id: 'main_subheading',
    key: 'home.subheading',
    category: 'content_descriptions',
    context: 'home_page',
    defaultValue: 'AI scans prop firms & brokers to find the best deal.',
    currentValue: 'AI scans prop firms & brokers to find the best deal.',
    description: 'Subtitle explaining the service',
    maxLength: 80
  },
  
  // Button Labels
  {
    id: 'btn_save',
    key: 'buttons.save',
    category: 'ui_buttons',
    context: 'button',
    defaultValue: 'Save',
    currentValue: 'Save',
    description: 'Generic save button text',
    maxLength: 15,
    isRequired: true
  },
  {
    id: 'btn_go_to_offer',
    key: 'buttons.go_to_offer',
    category: 'ui_buttons',
    context: 'button',
    defaultValue: 'Go To Offer',
    currentValue: 'Go To Offer',
    description: 'Button to visit deal page',
    maxLength: 20
  },
  {
    id: 'btn_copy_code',
    key: 'buttons.copy_code',
    category: 'ui_buttons',
    context: 'button',
    defaultValue: 'Copy Code',
    currentValue: 'Copy Code',
    description: 'Button to copy deal code',
    maxLength: 15
  },
  
  // Navigation Menu
  {
    id: 'nav_deals',
    key: 'navigation.deals',
    category: 'ui_navigation',
    context: 'menu_item',
    defaultValue: 'Deals',
    currentValue: 'Deals',
    description: 'Main deals navigation item',
    maxLength: 15
  },
  {
    id: 'nav_my_deals',
    key: 'navigation.my_deals',
    category: 'ui_navigation',
    context: 'menu_item',
    defaultValue: 'My Deals',
    currentValue: 'My Deals',
    description: 'Saved deals navigation item',
    maxLength: 15
  },
  {
    id: 'nav_profile',
    key: 'navigation.profile',
    category: 'ui_navigation',
    context: 'menu_item',
    defaultValue: 'Profile',
    currentValue: 'Profile',
    description: 'User profile navigation item',
    maxLength: 15
  },
  {
    id: 'nav_preferences',
    key: 'navigation.preferences',
    category: 'ui_navigation',
    context: 'menu_item',
    defaultValue: 'Preferences',
    currentValue: 'Preferences',
    description: 'User preferences navigation item',
    maxLength: 15
  },
  {
    id: 'nav_settings',
    key: 'navigation.settings',
    category: 'ui_navigation',
    context: 'menu_item',
    defaultValue: 'Settings',
    currentValue: 'Settings',
    description: 'App settings navigation item',
    maxLength: 15
  },
  {
    id: 'nav_faq',
    key: 'navigation.faq',
    category: 'ui_navigation',
    context: 'menu_item',
    defaultValue: 'FAQ',
    currentValue: 'FAQ',
    description: 'FAQ navigation item',
    maxLength: 10
  },
  {
    id: 'nav_admin_panel',
    key: 'navigation.admin_panel',
    category: 'ui_navigation',
    context: 'menu_item',
    defaultValue: 'Admin Panel',
    currentValue: 'Admin Panel',
    description: 'Admin panel navigation item',
    maxLength: 20
  },
  {
    id: 'nav_sign_in',
    key: 'navigation.sign_in',
    category: 'ui_navigation',
    context: 'menu_item',
    defaultValue: 'Sign In',
    currentValue: 'Sign In',
    description: 'Sign in navigation item',
    maxLength: 15
  },

  // Deal Categories
  {
    id: 'category_all',
    key: 'categories.all',
    category: 'ui_labels',
    context: 'filter',
    defaultValue: 'All',
    currentValue: 'All',
    description: 'All categories filter option',
    maxLength: 10
  },
  {
    id: 'category_cfd_prop',
    key: 'categories.cfd_prop',
    category: 'ui_labels',
    context: 'filter',
    defaultValue: 'CFD Prop',
    currentValue: 'CFD Prop',
    description: 'CFD Prop trading category',
    maxLength: 15
  },
  {
    id: 'category_futures_prop',
    key: 'categories.futures_prop',
    category: 'ui_labels',
    context: 'filter',
    defaultValue: 'Futures Prop',
    currentValue: 'Futures Prop',
    description: 'Futures Prop trading category',
    maxLength: 15
  },
  {
    id: 'category_broker_bonuses',
    key: 'categories.broker_bonuses',
    category: 'ui_labels',
    context: 'filter',
    defaultValue: 'Broker Bonuses',
    currentValue: 'Broker Bonuses',
    description: 'Broker bonuses category',
    maxLength: 20
  },

  // Progress & Status
  {
    id: 'progress_label',
    key: 'status.progress',
    category: 'ui_labels',
    context: 'label',
    defaultValue: 'Progress',
    currentValue: 'Progress',
    description: 'Progress indicator label',
    maxLength: 15
  },
  {
    id: 'swipe_pass',
    key: 'actions.pass',
    category: 'ui_labels',
    context: 'button',
    defaultValue: 'Pass',
    currentValue: 'Pass',
    description: 'Swipe pass action label',
    maxLength: 10
  },
  {
    id: 'swipe_save',
    key: 'actions.save',
    category: 'ui_labels',
    context: 'button',
    defaultValue: 'Save',
    currentValue: 'Save',
    description: 'Swipe save action label',
    maxLength: 10
  },

  // Toast Notifications
  {
    id: 'toast_saved_to_deals',
    key: 'notifications.saved_to_deals',
    category: 'notifications',
    context: 'toast',
    defaultValue: 'saved to "My Deals"',
    currentValue: 'saved to "My Deals"',
    description: 'Success message when deal is saved',
    maxLength: 30
  },
  {
    id: 'toast_already_saved',
    key: 'notifications.already_saved',
    category: 'notifications',
    context: 'toast',
    defaultValue: 'Already in your deals folder!',
    currentValue: 'Already in your deals folder!',
    description: 'Info message when deal is already saved',
    maxLength: 40
  },
  {
    id: 'toast_deal_dismissed',
    key: 'notifications.deal_dismissed',
    category: 'notifications',
    context: 'toast',
    defaultValue: 'Deal dismissed',
    currentValue: 'Deal dismissed',
    description: 'Info message when deal is dismissed',
    maxLength: 25
  },
  {
    id: 'toast_all_deals_viewed',
    key: 'notifications.all_deals_viewed',
    category: 'notifications',
    context: 'toast',
    defaultValue: "You've seen all deals! Starting over...",
    currentValue: "You've seen all deals! Starting over...",
    description: 'Info message when all deals have been viewed',
    maxLength: 50
  },
  {
    id: 'toast_expired_cleared',
    key: 'notifications.expired_cleared',
    category: 'notifications',
    context: 'toast',
    defaultValue: 'Expired deals cleared!',
    currentValue: 'Expired deals cleared!',
    description: 'Success message when expired deals are cleared',
    maxLength: 30
  },
  {
    id: 'toast_deal_removed',
    key: 'notifications.deal_removed',
    category: 'notifications',
    context: 'toast',
    defaultValue: 'Deal removed from saved!',
    currentValue: 'Deal removed from saved!',
    description: 'Success message when deal is removed',
    maxLength: 30
  },
  {
    id: 'toast_logged_out',
    key: 'notifications.logged_out',
    category: 'notifications',
    context: 'toast',
    defaultValue: 'Logged out successfully',
    currentValue: 'Logged out successfully',
    description: 'Success message when user logs out',
    maxLength: 30
  },

  // Dialog Messages
  {
    id: 'dialog_wait_dont_miss',
    key: 'dialogs.wait_dont_miss',
    category: 'ui_messages',
    context: 'dialog_title',
    defaultValue: "Wait, don't miss out!",
    currentValue: "Wait, don't miss out!",
    description: 'Reject confirmation dialog title',
    maxLength: 30
  },
  {
    id: 'dialog_save_instead',
    key: 'dialogs.save_instead',
    category: 'ui_messages',
    context: 'dialog_description',
    defaultValue: "You're about to dismiss this exclusive deal. Why not save it for later instead?",
    currentValue: "You're about to dismiss this exclusive deal. Why not save it for later instead?",
    description: 'Reject confirmation dialog description',
    maxLength: 100
  },
  {
    id: 'dialog_save_to_deals',
    key: 'dialogs.save_to_deals',
    category: 'ui_buttons',
    context: 'button',
    defaultValue: 'Save to My Deals',
    currentValue: 'Save to My Deals',
    description: 'Button to save deal in confirmation dialog',
    maxLength: 20
  },
  {
    id: 'dialog_go_back',
    key: 'dialogs.go_back',
    category: 'ui_buttons',
    context: 'button',
    defaultValue: 'Go Back',
    currentValue: 'Go Back',
    description: 'Button to cancel action in dialog',
    maxLength: 15
  },
  {
    id: 'dialog_reject',
    key: 'dialogs.reject',
    category: 'ui_buttons',
    context: 'button',
    defaultValue: 'Reject',
    currentValue: 'Reject',
    description: 'Button to confirm rejection in dialog',
    maxLength: 15
  },

  // Empty States
  {
    id: 'empty_no_deals_found',
    key: 'empty_states.no_deals_found',
    category: 'ui_messages',
    context: 'description',
    defaultValue: 'No deals found',
    currentValue: 'No deals found',
    description: 'Title when no deals are available',
    maxLength: 25
  },
  {
    id: 'empty_adjust_filters',
    key: 'empty_states.adjust_filters',
    category: 'ui_messages',
    context: 'description',
    defaultValue: 'Try adjusting your filters or check back later for new deals.',
    currentValue: 'Try adjusting your filters or check back later for new deals.',
    description: 'Message when no deals match filters',
    maxLength: 80
  },
  {
    id: 'empty_show_all_deals',
    key: 'empty_states.show_all_deals',
    category: 'ui_buttons',
    context: 'button',
    defaultValue: 'Show All Deals',
    currentValue: 'Show All Deals',
    description: 'Button to reset filters and show all deals',
    maxLength: 20
  },
  {
    id: 'empty_reset',
    key: 'empty_states.reset',
    category: 'ui_buttons',
    context: 'button',
    defaultValue: 'Reset',
    currentValue: 'Reset',
    description: 'Button to reset current state',
    maxLength: 10
  },

  // Status Indicators
  {
    id: 'status_social_scanning',
    key: 'status.social_scanning',
    category: 'ui_labels',
    context: 'label',
    defaultValue: 'Social scanning',
    currentValue: 'Social scanning',
    description: 'Status indicator for social media scanning',
    maxLength: 20
  },
  {
    id: 'status_real_time',
    key: 'status.real_time',
    category: 'ui_labels',
    context: 'label',
    defaultValue: 'Real time',
    currentValue: 'Real time',
    description: 'Status indicator for real-time updates',
    maxLength: 15
  },
  {
    id: 'status_live_count',
    key: 'status.live_count',
    category: 'ui_labels',
    context: 'label',
    defaultValue: '15 live',
    currentValue: '15 live',
    description: 'Status indicator showing live deal count',
    maxLength: 10
  }
];

export function StringManager() {
  const [strings, setStrings] = useState<EditableString[]>(DEFAULT_STRINGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<StringCategory | 'all'>('all');
  const [editingString, setEditingString] = useState<EditableString | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const categories: { value: StringCategory | 'all'; label: string; count: number }[] = [
    { value: 'all', label: 'All Categories', count: strings.length },
    { value: 'ui_navigation', label: 'Navigation', count: strings.filter(s => s.category === 'ui_navigation').length },
    { value: 'ui_buttons', label: 'Buttons', count: strings.filter(s => s.category === 'ui_buttons').length },
    { value: 'ui_labels', label: 'Labels', count: strings.filter(s => s.category === 'ui_labels').length },
    { value: 'ui_messages', label: 'Messages', count: strings.filter(s => s.category === 'ui_messages').length },
    { value: 'content_titles', label: 'Titles', count: strings.filter(s => s.category === 'content_titles').length },
    { value: 'content_descriptions', label: 'Descriptions', count: strings.filter(s => s.category === 'content_descriptions').length },
    { value: 'notifications', label: 'Notifications', count: strings.filter(s => s.category === 'notifications').length },
    { value: 'deal_content', label: 'Deal Content', count: strings.filter(s => s.category === 'deal_content').length },
    { value: 'errors_warnings', label: 'Errors & Warnings', count: strings.filter(s => s.category === 'errors_warnings').length },
    { value: 'placeholders', label: 'Placeholders', count: strings.filter(s => s.category === 'placeholders').length }
  ];

  const filteredStrings = strings.filter(string => {
    const matchesSearch = searchQuery === '' || 
      string.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      string.currentValue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      string.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || string.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleEditString = (string: EditableString) => {
    setEditingString({ ...string });
    setIsEditDialogOpen(true);
  };

  const handleSaveString = () => {
    if (!editingString) return;

    setStrings(prev => 
      prev.map(string => 
        string.id === editingString.id 
          ? { ...editingString }
          : string
      )
    );

    toast.success(`Updated "${editingString.key}"`);
    setIsEditDialogOpen(false);
    setEditingString(null);
  };

  const handleResetString = (stringId: string) => {
    const defaultString = DEFAULT_STRINGS.find(s => s.id === stringId);
    if (!defaultString) return;

    setStrings(prev => 
      prev.map(string => 
        string.id === stringId 
          ? { ...string, currentValue: defaultString.defaultValue }
          : string
      )
    );

    toast.success('String reset to default');
  };

  const handleResetAllStrings = () => {
    setStrings(DEFAULT_STRINGS.map(s => ({ ...s, currentValue: s.defaultValue })));
    toast.success('All strings reset to defaults');
  };

  const handleExportStrings = () => {
    const exportData = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      strings: strings.reduce((acc, string) => {
        acc[string.key] = {
          value: string.currentValue,
          description: string.description,
          category: string.category,
          context: string.context
        };
        return acc;
      }, {} as Record<string, any>)
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'coupza-strings.json';
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Strings exported successfully');
  };

  const getCategoryIcon = (category: StringCategory) => {
    switch (category) {
      case 'ui_navigation': return '🧭';
      case 'ui_buttons': return '🔘';
      case 'ui_labels': return '🏷️';
      case 'ui_messages': return '💬';
      case 'content_titles': return '📰';
      case 'content_descriptions': return '📝';
      case 'deal_content': return '🎯';
      case 'notifications': return '🔔';
      case 'errors_warnings': return '⚠️';
      case 'placeholders': return '💭';
      default: return '📄';
    }
  };

  const getCategoryColor = (category: StringCategory) => {
    switch (category) {
      case 'ui_navigation': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'ui_buttons': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'ui_labels': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'ui_messages': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'content_titles': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'content_descriptions': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'deal_content': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300';
      case 'notifications': return 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300';
      case 'errors_warnings': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'placeholders': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-700/30 shadow-lg p-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Type className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  String Manager
                </h1>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Edit and manage all text strings used throughout COUPZA. Changes here will update the user interface.
            </p>
          </div>
        </div>

        {/* Filters and Actions */}
        <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-white/30 dark:border-slate-700/30 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-500" />
              Filters & Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label>Search Strings</Label>
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by key, value, or description..."
                  className="mt-1"
                />
              </div>
              <div className="flex-1">
                <Label>Category</Label>
                <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as StringCategory | 'all')}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        <div className="flex items-center gap-2">
                          <span>{category.value !== 'all' ? getCategoryIcon(category.value as StringCategory) : '📋'}</span>
                          <span>{category.label}</span>
                          <Badge variant="secondary" className="ml-auto">
                            {category.count}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleExportStrings}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
              >
                <Globe className="w-4 h-4 mr-2" />
                Export Strings
              </Button>
              <Button
                onClick={handleResetAllStrings}
                variant="outline"
                className="rounded-xl"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset All
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Strings List */}
        <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-white/30 dark:border-slate-700/30 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                Strings ({filteredStrings.length})
              </div>
              {searchQuery && (
                <Badge variant="outline">
                  Filtered: {filteredStrings.length} of {strings.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredStrings.map(string => (
                <div
                  key={string.id}
                  className="bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`text-xs ${getCategoryColor(string.category)}`}>
                          {getCategoryIcon(string.category)} {string.category.replace('_', ' ')}
                        </Badge>
                        <code className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded text-slate-600 dark:text-slate-400">
                          {string.key}
                        </code>
                        {string.isRequired && (
                          <Badge variant="outline" className="text-xs border-red-300 text-red-600">
                            Required
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          "{string.currentValue}"
                        </div>
                        {string.description && (
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            {string.description}
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                          <span>Context: {string.context}</span>
                          {string.maxLength && (
                            <span className={string.currentValue.length > string.maxLength ? 'text-red-500' : ''}>
                              Length: {string.currentValue.length}
                              {string.maxLength && `/${string.maxLength}`}
                              {string.currentValue.length > string.maxLength && (
                                <AlertTriangle className="w-3 h-3 inline ml-1" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleEditString(string)}
                        className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResetString(string.id)}
                        className="rounded-xl"
                        disabled={string.currentValue === string.defaultValue}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredStrings.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                    No strings found
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Try adjusting your search query or category filter.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit3 className="w-5 h-5" />
                Edit String
              </DialogTitle>
            </DialogHeader>
            
            {editingString && (
              <div className="space-y-4">
                <div>
                  <Label>String Key</Label>
                  <Input
                    value={editingString.key}
                    disabled
                    className="mt-1 bg-slate-100 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <Label>Current Value</Label>
                  <Textarea
                    value={editingString.currentValue}
                    onChange={(e) => setEditingString({
                      ...editingString,
                      currentValue: e.target.value
                    })}
                    className="mt-1"
                    rows={3}
                  />
                  {editingString.maxLength && (
                    <div className={`text-xs mt-1 ${
                      editingString.currentValue.length > editingString.maxLength 
                        ? 'text-red-500' 
                        : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      {editingString.currentValue.length} / {editingString.maxLength} characters
                      {editingString.currentValue.length > editingString.maxLength && (
                        <span className="ml-2">⚠️ Exceeds maximum length</span>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={editingString.description || ''}
                    onChange={(e) => setEditingString({
                      ...editingString,
                      description: e.target.value
                    })}
                    className="mt-1"
                    rows={2}
                    placeholder="Describe where and how this string is used..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Select 
                      value={editingString.category} 
                      onValueChange={(value) => setEditingString({
                        ...editingString,
                        category: value as StringCategory
                      })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.filter(c => c.value !== 'all').map(category => (
                          <SelectItem key={category.value} value={category.value}>
                            <div className="flex items-center gap-2">
                              <span>{getCategoryIcon(category.value as StringCategory)}</span>
                              <span>{category.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Context</Label>
                    <Input
                      value={editingString.context}
                      onChange={(e) => setEditingString({
                        ...editingString,
                        context: e.target.value
                      })}
                      className="mt-1"
                      placeholder="e.g., button, menu_item, dialog_title"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                    className="rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveString}
                    className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// Export function to get a string by key (for use in components)
export function getString(key: string, fallback?: string): string {
  // In a real implementation, this would fetch from your string store
  // For now, return the key as fallback
  return fallback || key;
}