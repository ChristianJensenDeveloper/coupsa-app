// Security utilities and configuration for KOOCAO

export interface SecurityHeaders {
  'Content-Security-Policy': string;
  'Strict-Transport-Security': string;
  'X-Frame-Options': string;
  'X-Content-Type-Options': string;
  'X-XSS-Protection': string;
  'Referrer-Policy': string;
  'Permissions-Policy': string;
  'Cross-Origin-Embedder-Policy': string;
  'Cross-Origin-Opener-Policy': string;
  'Cross-Origin-Resource-Policy': string;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (request: any) => string;
}

// Security headers configuration for production
export const SECURITY_HEADERS: SecurityHeaders = {
  // Content Security Policy - Comprehensive CSP for KOOCAO
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googletagmanager.com https://*.google-analytics.com https://*.hotjar.com https://*.intercom.io https://*.supabase.co https://unpkg.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.intercom.io",
    "font-src 'self' https://fonts.gstatic.com https://*.intercom.io data:",
    "img-src 'self' data: blob: https: http:",
    "media-src 'self' blob: https:",
    "connect-src 'self' https://*.supabase.co https://*.google-analytics.com https://*.hotjar.com https://*.intercom.io wss://*.intercom.io https://api.unsplash.com https://images.unsplash.com",
    "frame-src 'self' https://*.intercom.io https://www.google.com",
    "worker-src 'self' blob:",
    "child-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://*.supabase.co",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; '),

  // HTTP Strict Transport Security - Force HTTPS for 2 years
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',

  // Prevent clickjacking attacks
  'X-Frame-Options': 'DENY',

  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',

  // XSS Protection (legacy but still useful)
  'X-XSS-Protection': '1; mode=block',

  // Control referrer information
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Permissions Policy - Disable unnecessary features
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()',
    'ambient-light-sensor=()',
    'battery=()',
    'display-capture=()',
    'document-domain=()',
    'fullscreen=(self)',
    'midi=()',
    'picture-in-picture=()',
    'publickey-credentials-get=(self)',
    'screen-wake-lock=()',
    'sync-xhr=()',
    'web-share=()',
    'xr-spatial-tracking=()'
  ].join(', '),

  // Cross-Origin Embedder Policy
  'Cross-Origin-Embedder-Policy': 'credentialless',

  // Cross-Origin Opener Policy
  'Cross-Origin-Opener-Policy': 'same-origin',

  // Cross-Origin Resource Policy
  'Cross-Origin-Resource-Policy': 'same-origin'
};

// Rate limiting configurations for different endpoints
export const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  // General API rate limiting
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    skipSuccessfulRequests: false
  },

  // Authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10,
    skipSuccessfulRequests: true
  },

  // Deal creation/modification (for brokers)
  dealModification: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 20,
    skipSuccessfulRequests: true
  },

  // Company registration
  companyRegistration: {
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    maxRequests: 3,
    skipSuccessfulRequests: true
  },

  // Contact form submissions
  contact: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5,
    skipSuccessfulRequests: true
  },

  // File uploads
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    skipSuccessfulRequests: true
  },

  // Search queries
  search: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
    skipSuccessfulRequests: true
  },

  // Password reset
  passwordReset: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    skipSuccessfulRequests: true
  }
};

// Simple in-memory rate limiter (for client-side usage)
class InMemoryRateLimiter {
  private requests: Map<string, number[]> = new Map();

  isAllowed(key: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const windowStart = now - config.windowMs;
    
    // Get existing requests for this key
    const keyRequests = this.requests.get(key) || [];
    
    // Filter out expired requests
    const validRequests = keyRequests.filter(time => time > windowStart);
    
    // Check if we're within the limit
    if (validRequests.length >= config.maxRequests) {
      return false;
    }
    
    // Add this request
    validRequests.push(now);
    this.requests.set(key, validRequests);
    
    return true;
  }

  getRemainingRequests(key: string, config: RateLimitConfig): number {
    const now = Date.now();
    const windowStart = now - config.windowMs;
    
    const keyRequests = this.requests.get(key) || [];
    const validRequests = keyRequests.filter(time => time > windowStart);
    
    return Math.max(0, config.maxRequests - validRequests.length);
  }

  getResetTime(key: string, config: RateLimitConfig): number {
    const keyRequests = this.requests.get(key) || [];
    if (keyRequests.length === 0) return 0;
    
    const oldestRequest = Math.min(...keyRequests);
    return oldestRequest + config.windowMs;
  }

  clear(): void {
    this.requests.clear();
  }
}

// Client-side rate limiter instance
export const clientRateLimiter = new InMemoryRateLimiter();

// Security validation utilities
export class SecurityValidator {
  // Validate input for potential XSS
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>\"']/g, '') // Remove dangerous characters
      .trim()
      .slice(0, 1000); // Limit length
  }

  // Validate email format
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  // Validate URL format
  static isValidURL(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      return ['http:', 'https:'].includes(parsedUrl.protocol);
    } catch {
      return false;
    }
  }

  // Check for suspicious patterns
  static containsSuspiciousContent(content: string): boolean {
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+=/i,
      /data:text\/html/i,
      /vbscript:/i,
      /expression\(/i
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(content));
  }

  // Validate file upload
  static isValidFileUpload(file: File): { valid: boolean; error?: string } {
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { valid: false, error: 'File size exceeds 5MB limit' };
    }

    // Check file type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'text/csv'
    ];

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'File type not allowed' };
    }

    // Check filename for suspicious patterns
    if (this.containsSuspiciousContent(file.name)) {
      return { valid: false, error: 'Suspicious filename detected' };
    }

    return { valid: true };
  }
}

// Content Security Policy violation reporting
export class CSPReporter {
  static reportViolation(violation: any): void {
    console.warn('CSP Violation:', violation);
    
    // In production, send to logging service
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'csp_violation', {
        blocked_uri: violation['blocked-uri'],
        document_uri: violation['document-uri'],
        effective_directive: violation['effective-directive'],
        original_policy: violation['original-policy'],
        referrer: violation.referrer,
        violated_directive: violation['violated-directive']
      });
    }
  }

  static setupCSPReporting(): void {
    if (typeof window !== 'undefined') {
      document.addEventListener('securitypolicyviolation', (e) => {
        this.reportViolation({
          'blocked-uri': e.blockedURI,
          'document-uri': e.documentURI,
          'effective-directive': e.effectiveDirective,
          'original-policy': e.originalPolicy,
          referrer: e.referrer,
          'violated-directive': e.violatedDirective,
          'line-number': e.lineNumber,
          'column-number': e.columnNumber,
          'source-file': e.sourceFile
        });
      });
    }
  }
}

// Setup security monitoring
export function initializeSecurity(): void {
  if (typeof window !== 'undefined') {
    // Setup CSP reporting
    CSPReporter.setupCSPReporting();
    
    // Monitor for suspicious activity
    let suspiciousActivityCount = 0;
    const MAX_SUSPICIOUS_ACTIVITY = 5;
    
    const trackSuspiciousActivity = () => {
      suspiciousActivityCount++;
      if (suspiciousActivityCount >= MAX_SUSPICIOUS_ACTIVITY) {
        console.warn('High suspicious activity detected');
        // In production, could trigger additional security measures
      }
    };

    // Monitor for rapid-fire requests
    let requestCount = 0;
    const REQUEST_WINDOW = 10000; // 10 seconds
    
    setInterval(() => {
      if (requestCount > 50) { // More than 50 requests in 10 seconds
        trackSuspiciousActivity();
      }
      requestCount = 0;
    }, REQUEST_WINDOW);

    // Monitor for console access (basic protection)
    const devToolsWarning = () => {
      console.log('%cSTOP!', 'color: red; font-size: 40px; font-weight: bold;');
      console.log('%cThis is a browser feature intended for developers. If someone told you to copy-paste something here to enable a feature or "hack" someone\'s account, it is a scam and will give them access to your account.', 'color: red; font-size: 16px;');
    };

    // Show warning when dev tools might be open
    let devtools = { open: false, orientation: '' };
    const threshold = 160;

    const checkDevTools = () => {
      if (
        window.outerHeight - window.innerHeight > threshold ||
        window.outerWidth - window.innerWidth > threshold
      ) {
        if (!devtools.open) {
          devtools.open = true;
          devToolsWarning();
        }
      } else {
        devtools.open = false;
      }
    };

    // Check every second
    setInterval(checkDevTools, 1000);
  }
}

// Performance and security metrics
export interface SecurityMetrics {
  cspViolations: number;
  suspiciousActivity: number;
  rateLimitHits: number;
  failedAuthentications: number;
  lastSecurityScan: Date;
  securityScore: number;
}

export class SecurityMetricsCollector {
  private metrics: SecurityMetrics = {
    cspViolations: 0,
    suspiciousActivity: 0,
    rateLimitHits: 0,
    failedAuthentications: 0,
    lastSecurityScan: new Date(),
    securityScore: 100
  };

  updateMetric(metric: keyof SecurityMetrics, value: number | Date): void {
    (this.metrics as any)[metric] = value;
  }

  incrementMetric(metric: keyof SecurityMetrics): void {
    if (typeof this.metrics[metric] === 'number') {
      (this.metrics[metric] as number)++;
    }
  }

  getMetrics(): SecurityMetrics {
    return { ...this.metrics };
  }

  calculateSecurityScore(): number {
    let score = 100;
    
    // Deduct points for security issues
    score -= this.metrics.cspViolations * 5;
    score -= this.metrics.suspiciousActivity * 10;
    score -= this.metrics.rateLimitHits * 2;
    score -= this.metrics.failedAuthentications * 3;
    
    // Time decay - older scans reduce score
    const daysSinceLastScan = (Date.now() - this.metrics.lastSecurityScan.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceLastScan > 7) {
      score -= daysSinceLastScan * 2;
    }
    
    this.metrics.securityScore = Math.max(0, Math.min(100, score));
    return this.metrics.securityScore;
  }

  reset(): void {
    this.metrics = {
      cspViolations: 0,
      suspiciousActivity: 0,
      rateLimitHits: 0,
      failedAuthentications: 0,
      lastSecurityScan: new Date(),
      securityScore: 100
    };
  }
}

// Global security metrics collector
export const securityMetrics = new SecurityMetricsCollector();