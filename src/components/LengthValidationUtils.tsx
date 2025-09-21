// Utility functions for text length validation and overflow detection

export interface LengthValidationRule {
  maxLengthRatio: number; // e.g., 1.2 for 120% of source
  warningThreshold: number; // e.g., 1.1 for 110% warning
  errorThreshold: number; // e.g., 1.3 for 130% error
  criticalThreshold: number; // e.g., 1.5 for 150% critical
}

export interface TextMetrics {
  characterCount: number;
  wordCount: number;
  estimatedPixelWidth?: number;
  lineCount?: number;
}

export interface ValidationResult {
  isValid: boolean;
  severity: 'ok' | 'warning' | 'error' | 'critical';
  ratio: number;
  overflowPercentage: number;
  recommendation?: string;
  suggestedFixes?: string[];
}

// Default validation rules
export const DEFAULT_LENGTH_RULES: LengthValidationRule = {
  maxLengthRatio: 1.2,
  warningThreshold: 1.1,
  errorThreshold: 1.3,
  criticalThreshold: 1.5
};

// Context-specific rules for different UI elements
export const CONTEXT_SPECIFIC_RULES: Record<string, LengthValidationRule> = {
  'button': {
    maxLengthRatio: 1.1, // Buttons need to be more strict
    warningThreshold: 1.05,
    errorThreshold: 1.15,
    criticalThreshold: 1.3
  },
  'menu_item': {
    maxLengthRatio: 1.15,
    warningThreshold: 1.1,
    errorThreshold: 1.2,
    criticalThreshold: 1.4
  },
  'dialog_title': {
    maxLengthRatio: 1.3,
    warningThreshold: 1.2,
    errorThreshold: 1.4,
    criticalThreshold: 1.6
  },
  'notification': {
    maxLengthRatio: 1.4,
    warningThreshold: 1.3,
    errorThreshold: 1.5,
    criticalThreshold: 1.8
  },
  'description': {
    maxLengthRatio: 1.5, // Descriptions can be more flexible
    warningThreshold: 1.3,
    errorThreshold: 1.6,
    criticalThreshold: 2.0
  }
};

export function getTextMetrics(text: string, element?: HTMLElement): TextMetrics {
  const characterCount = text.length;
  const wordCount = text.trim().split(/\s+/).length;
  
  let estimatedPixelWidth: number | undefined;
  let lineCount: number | undefined;
  
  if (element) {
    // Create a temporary element to measure text
    const measurer = document.createElement('div');
    measurer.style.position = 'absolute';
    measurer.style.left = '-9999px';
    measurer.style.top = '-9999px';
    measurer.style.whiteSpace = 'nowrap';
    measurer.style.font = getComputedStyle(element).font;
    measurer.textContent = text;
    
    document.body.appendChild(measurer);
    estimatedPixelWidth = measurer.offsetWidth;
    document.body.removeChild(measurer);
    
    // Estimate line count based on container width
    const containerWidth = element.offsetWidth;
    if (containerWidth > 0 && estimatedPixelWidth > 0) {
      lineCount = Math.ceil(estimatedPixelWidth / containerWidth);
    }
  } else {
    // Rough estimation: average character is ~8px wide in most fonts
    estimatedPixelWidth = characterCount * 8;
  }
  
  return {
    characterCount,
    wordCount,
    estimatedPixelWidth,
    lineCount
  };
}

export function validateTextLength(
  sourceText: string,
  translatedText: string,
  context?: string,
  customRules?: Partial<LengthValidationRule>
): ValidationResult {
  const rules = customRules 
    ? { ...DEFAULT_LENGTH_RULES, ...customRules }
    : (context && CONTEXT_SPECIFIC_RULES[context]) 
      ? CONTEXT_SPECIFIC_RULES[context]
      : DEFAULT_LENGTH_RULES;
  
  const sourceLength = sourceText.length;
  const translatedLength = translatedText.length;
  
  if (sourceLength === 0) {
    return {
      isValid: true,
      severity: 'ok',
      ratio: 0,
      overflowPercentage: 0
    };
  }
  
  const ratio = translatedLength / sourceLength;
  const overflowPercentage = Math.max(0, Math.round((ratio - 1) * 100));
  
  let severity: ValidationResult['severity'] = 'ok';
  let isValid = true;
  let recommendation: string | undefined;
  let suggestedFixes: string[] = [];
  
  if (ratio >= rules.criticalThreshold) {
    severity = 'critical';
    isValid = false;
    recommendation = 'Text is critically too long and will likely break the UI layout.';
    suggestedFixes = ['Rephrase to be much shorter', 'Use abbreviations', 'Split into multiple lines', 'Consider alternative wording'];
  } else if (ratio >= rules.errorThreshold) {
    severity = 'error';
    isValid = false;
    recommendation = 'Text is significantly longer and may cause layout issues.';
    suggestedFixes = ['Rephrase more concisely', 'Use common abbreviations', 'Check for redundant words'];
  } else if (ratio >= rules.warningThreshold) {
    severity = 'warning';
    recommendation = 'Text is longer than recommended but should still fit in most layouts.';
    suggestedFixes = ['Consider slight rewording', 'Check if abbreviations are appropriate'];
  }
  
  // Context-specific recommendations
  if (context === 'button' && ratio > 1.1) {
    suggestedFixes.unshift('Use action verbs', 'Remove unnecessary words like "Please" or "Click to"');
  } else if (context === 'menu_item' && ratio > 1.15) {
    suggestedFixes.unshift('Use shorter menu labels', 'Consider icons with text');
  }
  
  return {
    isValid,
    severity,
    ratio,
    overflowPercentage,
    recommendation,
    suggestedFixes
  };
}

export function detectLengthIssues(
  translations: Record<string, { source: string; translated: string; context?: string }>,
  locale: string
) {
  const issues = [];
  
  for (const [key, { source, translated, context }] of Object.entries(translations)) {
    const validation = validateTextLength(source, translated, context);
    
    if (validation.severity !== 'ok') {
      issues.push({
        key,
        sourceText: source,
        translatedText: translated,
        sourceLength: source.length,
        translatedLength: translated.length,
        overflowPercentage: validation.overflowPercentage,
        locale,
        severity: validation.severity,
        context,
        recommendation: validation.recommendation,
        suggestedFixes: validation.suggestedFixes
      });
    }
  }
  
  return issues.sort((a, b) => {
    // Sort by severity, then by overflow percentage
    const severityOrder = { critical: 3, error: 2, warning: 1 };
    const aSeverity = severityOrder[a.severity as keyof typeof severityOrder] || 0;
    const bSeverity = severityOrder[b.severity as keyof typeof severityOrder] || 0;
    
    if (aSeverity !== bSeverity) {
      return bSeverity - aSeverity;
    }
    
    return b.overflowPercentage - a.overflowPercentage;
  });
}

// Responsive text helpers
export function getResponsiveTextClasses(
  ratio: number,
  context?: string,
  enableAutoFix = false
): string {
  if (!enableAutoFix || ratio <= 1.2) return '';
  
  const classes = [];
  
  // Reduce font size for longer text
  if (ratio >= 1.5) {
    classes.push('text-sm');
  } else if (ratio >= 1.3) {
    classes.push('text-sm');
  }
  
  // Allow text wrapping for specific contexts
  if (context === 'button' || context === 'menu_item') {
    if (ratio >= 1.3) {
      classes.push('break-words');
    }
  }
  
  // Add line height adjustments
  if (ratio >= 1.4) {
    classes.push('leading-tight');
  }
  
  return classes.join(' ');
}

// CSS-in-JS style generator for auto-fixing
export function getAutoFixStyles(
  ratio: number,
  context?: string,
  enableAutoFix = false
): React.CSSProperties {
  if (!enableAutoFix || ratio <= 1.2) return {};
  
  const styles: React.CSSProperties = {};
  
  // Font size reduction
  if (ratio >= 1.5) {
    styles.fontSize = '0.85em';
  } else if (ratio >= 1.3) {
    styles.fontSize = '0.9em';
  }
  
  // Line height adjustment
  if (ratio >= 1.4) {
    styles.lineHeight = '1.3';
  }
  
  // Word breaking for buttons and menu items
  if ((context === 'button' || context === 'menu_item') && ratio >= 1.3) {
    styles.wordBreak = 'break-word';
  }
  
  return styles;
}

// Translation guidelines generator
export function generateTranslationGuidelines(
  sourceText: string,
  context?: string
): {
  maxCharacters: number;
  recommendedCharacters: number;
  guidelines: string[];
} {
  const rules = context && CONTEXT_SPECIFIC_RULES[context] 
    ? CONTEXT_SPECIFIC_RULES[context]
    : DEFAULT_LENGTH_RULES;
  
  const maxCharacters = Math.floor(sourceText.length * rules.maxLengthRatio);
  const recommendedCharacters = Math.floor(sourceText.length * rules.warningThreshold);
  
  const guidelines = [
    `Keep translation under ${maxCharacters} characters (currently ${sourceText.length} in English)`,
    `Aim for ${recommendedCharacters} characters or less for best results`
  ];
  
  // Context-specific guidelines
  if (context === 'button') {
    guidelines.push(
      'Use action verbs and imperative mood',
      'Avoid unnecessary words like "Please click" - just use the action',
      'Consider if an icon could replace some text'
    );
  } else if (context === 'menu_item') {
    guidelines.push(
      'Use concise, scannable labels',
      'Consider hierarchical grouping if menu becomes too long',
      'Icons can help distinguish items with shorter text'
    );
  } else if (context === 'dialog_title') {
    guidelines.push(
      'Keep titles descriptive but brief',
      'Use sentence case, not title case',
      'Focus on the primary action or content'
    );
  }
  
  return {
    maxCharacters,
    recommendedCharacters,
    guidelines
  };
}