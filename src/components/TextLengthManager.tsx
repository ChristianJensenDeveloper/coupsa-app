import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { AlertTriangle, Scissors, Type, ArrowsUpDown, Edit, RotateCw, Eye, AlertCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface TextLengthIssue {
  key: string;
  sourceText: string;
  translatedText: string;
  sourceLength: number;
  translatedLength: number;
  overflowPercentage: number;
  locale: string;
  severity: 'warning' | 'error' | 'critical';
  context?: string;
  maxLength?: number;
}

interface TextLengthManagerProps {
  issues: TextLengthIssue[];
  onResolveLengthIssue: (key: string, locale: string, newText: string, strategy: string) => void;
  className?: string;
}

const LENGTH_STRATEGIES = [
  {
    id: 'truncate',
    name: 'Smart Truncate',
    description: 'Intelligently truncate while preserving meaning',
    icon: Scissors
  },
  {
    id: 'abbreviate',
    name: 'Use Abbreviations',
    description: 'Replace common words with shorter forms',
    icon: Type
  },
  {
    id: 'rephrase',
    name: 'Rephrase Shorter',
    description: 'Rewrite to convey same meaning in fewer words',
    icon: Edit
  },
  {
    id: 'multi-line',
    name: 'Multi-line Layout',
    description: 'Allow text to wrap to multiple lines',
    icon: ArrowsUpDown
  },
  {
    id: 'font-adjust',
    name: 'Font Size Adjustment',
    description: 'Reduce font size for this translation',
    icon: Type
  }
];

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    case 'error': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
    case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  }
};

// Smart truncation function that tries to preserve meaning
const smartTruncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  
  // Try to cut at sentence boundary first
  const sentences = text.split(/[.!?]+/);
  if (sentences.length > 1) {
    let result = sentences[0];
    for (let i = 1; i < sentences.length; i++) {
      const withNext = result + sentences[i];
      if (withNext.length <= maxLength - 3) {
        result = withNext;
      } else {
        break;
      }
    }
    if (result.length < text.length) return result.trim() + '...';
  }
  
  // Cut at word boundary
  const words = text.split(' ');
  let result = '';
  for (const word of words) {
    if ((result + ' ' + word).length <= maxLength - 3) {
      result += (result ? ' ' : '') + word;
    } else {
      break;
    }
  }
  
  return result + (result.length < text.length ? '...' : '');
};

// Abbreviation replacements for common terms
const COMMON_ABBREVIATIONS: Record<string, string> = {
  // English
  'and': '&',
  'with': 'w/',
  'without': 'w/o',
  'information': 'info',
  'number': 'no.',
  'percent': '%',
  'maximum': 'max',
  'minimum': 'min',
  'approximately': '~',
  'versus': 'vs',
  'etcetera': 'etc',
  // Spanish
  'información': 'info',
  'número': 'no.',
  'por ciento': '%',
  'máximo': 'máx',
  'mínimo': 'mín',
  'aproximadamente': '~',
  // Portuguese
  'informação': 'info',
  'número': 'nº',
  'por cento': '%',
  'máximo': 'máx',
  'mínimo': 'mín',
  // French
  'information': 'info',
  'numéro': 'nº',
  'pour cent': '%',
  'maximum': 'max',
  'minimum': 'min',
  'approximativement': '~',
  'paramètres': 'config',
  // German
  'Information': 'Info',
  'Nummer': 'Nr.',
  'Prozent': '%',
  'Maximum': 'Max',
  'Minimum': 'Min',
  'ungefähr': '~',
  'Einstellungen': 'Config',
  // Italian
  'informazione': 'info',
  'numero': 'nº',
  'per cento': '%',
  'massimo': 'max',
  'minimo': 'min',
  'approssimativamente': '~',
  'impostazioni': 'config',
  // Polish
  'informacja': 'info',
  'numer': 'nr',
  'procent': '%',
  'maksimum': 'maks',
  'minimum': 'min',
  'około': '~',
  'ustawienia': 'config',
  // Dutch
  'informatie': 'info',
  'nummer': 'nr.',
  'procent': '%',
  'maximum': 'max',
  'minimum': 'min',
  'ongeveer': '~',
  'instellingen': 'config',
  // Greek
  'πληροφορίες': 'info',
  'αριθμός': 'αρ.',
  'τοις εκατό': '%',
  'μέγιστο': 'μάξ',
  'ελάχιστο': 'μιν',
  'περίπου': '~',
  // Czech
  'informace': 'info',
  'číslo': 'č.',
  'procento': '%',
  'maximum': 'max',
  'minimum': 'min',
  'přibližně': '~',
  'nastavení': 'config',
  // Turkish
  'bilgi': 'info',
  'numara': 'no.',
  'yüzde': '%',
  'maksimum': 'maks',
  'minimum': 'min',
  'yaklaşık': '~',
  'ayarlar': 'config'
};

const applyAbbreviations = (text: string): string => {
  let result = text;
  Object.entries(COMMON_ABBREVIATIONS).forEach(([full, abbrev]) => {
    const regex = new RegExp(`\\b${full}\\b`, 'gi');
    result = result.replace(regex, abbrev);
  });
  return result;
};

export function TextLengthManager({ issues, onResolveLengthIssue, className = '' }: TextLengthManagerProps) {
  const [selectedIssue, setSelectedIssue] = useState<TextLengthIssue | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<string>('');
  const [editedText, setEditedText] = useState<string>('');
  const [previewText, setPreviewText] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (selectedIssue && selectedStrategy) {
      generatePreview();
    }
  }, [selectedIssue, selectedStrategy, editedText]);

  const generatePreview = () => {
    if (!selectedIssue) return;
    
    let preview = selectedIssue.translatedText;
    const maxLength = Math.floor(selectedIssue.sourceLength * 1.2); // 120% of source
    
    switch (selectedStrategy) {
      case 'truncate':
        preview = smartTruncate(preview, maxLength);
        break;
      case 'abbreviate':
        preview = applyAbbreviations(preview);
        if (preview.length > maxLength) {
          preview = smartTruncate(preview, maxLength);
        }
        break;
      case 'rephrase':
        preview = editedText || preview;
        break;
      case 'multi-line':
        preview = preview; // No change to text, layout handles it
        break;
      case 'font-adjust':
        preview = preview; // No change to text, CSS handles it
        break;
    }
    
    setPreviewText(preview);
  };

  const handleApplyFix = () => {
    if (!selectedIssue || !selectedStrategy) return;
    
    let finalText = previewText;
    
    // For manual rephrase, use the edited text
    if (selectedStrategy === 'rephrase' && editedText) {
      finalText = editedText;
    }
    
    onResolveLengthIssue(selectedIssue.key, selectedIssue.locale, finalText, selectedStrategy);
    toast.success(`Length issue resolved using ${LENGTH_STRATEGIES.find(s => s.id === selectedStrategy)?.name}`);
    setIsDialogOpen(false);
    resetDialog();
  };

  const resetDialog = () => {
    setSelectedIssue(null);
    setSelectedStrategy('');
    setEditedText('');
    setPreviewText('');
  };

  const handleIssueClick = (issue: TextLengthIssue) => {
    setSelectedIssue(issue);
    setEditedText(issue.translatedText);
    setIsDialogOpen(true);
  };

  const criticalIssues = issues.filter(issue => issue.severity === 'critical');
  const errorIssues = issues.filter(issue => issue.severity === 'error');
  const warningIssues = issues.filter(issue => issue.severity === 'warning');

  if (issues.length === 0) {
    return (
      <div className={`flex items-center gap-2 text-sm text-green-600 dark:text-green-400 ${className}`}>
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span>All translations within length limits</span>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={`space-y-4 ${className}`}>
        {/* Summary Stats */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          <div className="flex-1">
            <div className="font-medium text-slate-900 dark:text-slate-100">Length Issues Detected</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {issues.length} translation{issues.length !== 1 ? 's' : ''} exceed recommended length
            </div>
          </div>
          <div className="flex gap-2">
            {criticalIssues.length > 0 && (
              <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                {criticalIssues.length} Critical
              </Badge>
            )}
            {errorIssues.length > 0 && (
              <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                {errorIssues.length} Error
              </Badge>
            )}
            {warningIssues.length > 0 && (
              <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                {warningIssues.length} Warning
              </Badge>
            )}
          </div>
        </div>

        {/* Issues List */}
        <div className="space-y-2">
          {issues.map((issue) => (
            <div
              key={`${issue.key}-${issue.locale}`}
              className="p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              onClick={() => handleIssueClick(issue)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <code className="text-sm bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                      {issue.key}
                    </code>
                    <Badge className="text-xs uppercase">{issue.locale}</Badge>
                    <Badge className={`text-xs ${getSeverityColor(issue.severity)}`}>
                      +{issue.overflowPercentage}%
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">English ({issue.sourceLength} chars):</div>
                      <div className="text-sm text-slate-600 dark:text-slate-300 truncate">
                        {issue.sourceText}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                        Translation ({issue.translatedLength} chars):
                      </div>
                      <div className="text-sm text-slate-900 dark:text-slate-100 truncate">
                        {issue.translatedText}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-xs text-slate-500 dark:text-slate-400">Length Ratio</div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      {((issue.translatedLength / issue.sourceLength) * 100).toFixed(0)}%
                    </div>
                  </div>
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Fix Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Scissors className="w-5 h-5 text-blue-500" />
                Fix Length Overflow
              </DialogTitle>
              <DialogDescription>
                Choose a strategy to fix the length overflow for this translation.
              </DialogDescription>
            </DialogHeader>

            {selectedIssue && (
              <div className="space-y-6">
                {/* Issue Details */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">
                        String Key
                      </div>
                      <code className="text-sm bg-white dark:bg-slate-700 px-2 py-1 rounded border">
                        {selectedIssue.key}
                      </code>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">
                        Language
                      </div>
                      <Badge>{selectedIssue.locale}</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
                        English Original ({selectedIssue.sourceLength} chars)
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-700 rounded border text-sm">
                        {selectedIssue.sourceText}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
                        Current Translation ({selectedIssue.translatedLength} chars)
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-700 rounded border text-sm">
                        <span className="bg-red-100 dark:bg-red-900/30 px-1 rounded">
                          {selectedIssue.translatedText}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 text-sm text-orange-600 dark:text-orange-400">
                    <AlertTriangle className="w-4 h-4 inline mr-1" />
                    {selectedIssue.overflowPercentage}% over recommended length
                  </div>
                </div>

                {/* Strategy Selection */}
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">
                    Select Fix Strategy
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {LENGTH_STRATEGIES.map((strategy) => {
                      const Icon = strategy.icon;
                      return (
                        <button
                          key={strategy.id}
                          onClick={() => setSelectedStrategy(strategy.id)}
                          className={`p-3 text-left border rounded-lg transition-colors ${
                            selectedStrategy === strategy.id
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className="w-4 h-4" />
                            <span className="font-medium text-sm">{strategy.name}</span>
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">
                            {strategy.description}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Manual Edit for Rephrase Strategy */}
                {selectedStrategy === 'rephrase' && (
                  <div>
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
                      Rephrase Translation
                    </div>
                    <Textarea
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      placeholder="Enter a shorter version of the translation..."
                      className="min-h-24"
                    />
                    <div className="flex justify-between items-center mt-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>Target: ≤{Math.floor(selectedIssue.sourceLength * 1.2)} characters</span>
                      <span className={editedText.length > selectedIssue.sourceLength * 1.2 ? 'text-red-500' : 'text-green-500'}>
                        {editedText.length} characters
                      </span>
                    </div>
                  </div>
                )}

                {/* Preview */}
                {selectedStrategy && (
                  <div>
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Preview Result
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="text-sm text-slate-900 dark:text-slate-100 mb-2">
                        {previewText}
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400">
                        ✓ {previewText.length} characters ({((previewText.length / selectedIssue.sourceLength) * 100).toFixed(0)}% of original)
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetDialog();
                    }}
                  >
                    Cancel
                  </Button>
                  
                  <div className="flex gap-2">
                    {selectedStrategy && (
                      <Button
                        variant="outline"
                        onClick={generatePreview}
                      >
                        <RotateCw className="w-4 h-4 mr-2" />
                        Regenerate Preview
                      </Button>
                    )}
                    <Button
                      onClick={handleApplyFix}
                      disabled={!selectedStrategy || (selectedStrategy === 'rephrase' && !editedText.trim())}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      Apply Fix
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}