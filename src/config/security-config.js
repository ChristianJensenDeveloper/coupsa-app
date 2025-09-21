// Security configuration for KOOCAO production deployment
// This file contains security headers, CSP policies, and rate limiting configurations

export const securityConfig = {
  // Content Security Policy for production
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // Required for some analytics
        "'unsafe-eval'", // Required for React development
        "https://*.googletagmanager.com",
        "https://*.google-analytics.com",
        "https://*.hotjar.com",
        "https://*.intercom.io",
        "https://*.supabase.co",
        "https://unpkg.com" // For CDN packages if needed
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Required for Tailwind CSS
        "https://fonts.googleapis.com",
        "https://*.intercom.io"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "https://*.intercom.io",
        "data:"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "blob:",
        "https:",
        "http:" // Allow HTTP images for flexibility
      ],
      mediaSrc: [
        "'self'",
        "blob:",
        "https:"
      ],
      connectSrc: [
        "'self'",
        "https://*.supabase.co",
        "https://*.google-analytics.com",
        "https://*.hotjar.com",
        "https://*.intercom.io",
        "wss://*.intercom.io",
        "https://api.unsplash.com",
        "https://images.unsplash.com"
      ],
      frameSrc: [
        "'self'",
        "https://*.intercom.io",
        "https://www.google.com"
      ],
      workerSrc: [
        "'self'",
        "blob:"
      ],
      childSrc: [
        "'self'",
        "blob:"
      ],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: [
        "'self'",
        "https://*.supabase.co"
      ],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: true
    }
  },

  // HTTP Security Headers
  securityHeaders: {
    // Force HTTPS for 2 years, include subdomains, allow preload
    strictTransportSecurity: "max-age=63072000; includeSubDomains; preload",
    
    // Prevent clickjacking
    xFrameOptions: "DENY",
    
    // Prevent MIME type sniffing
    xContentTypeOptions: "nosniff",
    
    // XSS Protection (legacy but still useful)
    xXSSProtection: "1; mode=block",
    
    // Control referrer information
    referrerPolicy: "strict-origin-when-cross-origin",
    
    // Permissions Policy - disable unnecessary features
    permissionsPolicy: [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "payment=()",
      "usb=()",
      "magnetometer=()",
      "gyroscope=()",
      "accelerometer=()",
      "ambient-light-sensor=()",
      "battery=()",
      "display-capture=()",
      "document-domain=()",
      "fullscreen=(self)",
      "midi=()",
      "picture-in-picture=()",
      "publickey-credentials-get=(self)",
      "screen-wake-lock=()",
      "sync-xhr=()",
      "web-share=()",
      "xr-spatial-tracking=()"
    ].join(", "),
    
    // Cross-Origin policies
    crossOriginEmbedderPolicy: "credentialless",
    crossOriginOpenerPolicy: "same-origin",
    crossOriginResourcePolicy: "same-origin"
  },

  // Rate Limiting Configuration
  rateLimiting: {
    // General API requests
    api: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: "Too many requests from this IP, please try again later.",
      standardHeaders: true,
      legacyHeaders: false
    },
    
    // Authentication endpoints
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10, // limit each IP to 10 auth requests per windowMs
      message: "Too many authentication attempts, please try again later.",
      skipSuccessfulRequests: true
    },
    
    // Contact form submissions
    contact: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 5, // limit each IP to 5 contact form submissions per hour
      message: "Too many contact form submissions, please try again later.",
      skipSuccessfulRequests: true
    },
    
    // File uploads
    upload: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 10, // limit each IP to 10 file uploads per hour
      message: "Upload limit exceeded, please try again later.",
      skipSuccessfulRequests: true
    },
    
    // Password reset
    passwordReset: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 3, // limit each IP to 3 password reset attempts per hour
      message: "Too many password reset attempts, please try again later.",
      skipSuccessfulRequests: true
    },
    
    // Company registration
    companyRegistration: {
      windowMs: 24 * 60 * 60 * 1000, // 24 hours
      max: 3, // limit each IP to 3 company registrations per day
      message: "Company registration limit exceeded, please contact support.",
      skipSuccessfulRequests: true
    }
  },

  // CORS Configuration
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://koocao.com', 'https://www.koocao.com'] 
      : true,
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'apikey'
    ]
  },

  // Cookie Security Settings
  cookies: {
    secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
    httpOnly: true, // Prevent XSS attacks
    sameSite: 'strict', // CSRF protection
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    domain: process.env.NODE_ENV === 'production' ? '.koocao.com' : undefined
  },

  // File Upload Security
  fileUpload: {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB max file size
      files: 5, // max 5 files per request
      fieldSize: 1024 * 1024, // 1MB max field size
      fields: 20 // max 20 fields
    },
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'text/csv'
    ],
    virusScan: process.env.NODE_ENV === 'production' // Enable virus scanning in production
  },

  // Input Validation Rules
  validation: {
    email: {
      maxLength: 254,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    password: {
      minLength: 8,
      maxLength: 128,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true
    },
    companyName: {
      minLength: 2,
      maxLength: 100,
      pattern: /^[a-zA-Z0-9\s\-\.&]+$/
    },
    url: {
      maxLength: 2048,
      protocols: ['http:', 'https:']
    },
    phone: {
      pattern: /^\+?[1-9]\d{1,14}$/
    }
  },

  // Monitoring and Alerting
  monitoring: {
    // Security events to monitor
    events: [
      'failed_login_attempts',
      'suspicious_activity',
      'rate_limit_exceeded',
      'csp_violations',
      'file_upload_rejections',
      'malformed_requests'
    ],
    
    // Alert thresholds
    alerts: {
      failedLoginThreshold: 10, // Alert after 10 failed logins from same IP
      suspiciousActivityThreshold: 20, // Alert after 20 suspicious events
      rateLimitThreshold: 50, // Alert after 50 rate limit hits
      cspViolationThreshold: 5 // Alert after 5 CSP violations
    },
    
    // Log retention
    logRetention: {
      security: 90, // days
      access: 30, // days
      error: 60 // days
    }
  },

  // Environment-specific settings
  environment: {
    development: {
      httpsOnly: false,
      strictCSP: false,
      verboseLogging: true
    },
    staging: {
      httpsOnly: true,
      strictCSP: true,
      verboseLogging: true
    },
    production: {
      httpsOnly: true,
      strictCSP: true,
      verboseLogging: false,
      enableHSTS: true,
      enableSecurityHeaders: true
    }
  }
};

// Export individual configurations for easy access
export const {
  contentSecurityPolicy,
  securityHeaders,
  rateLimiting,
  cors,
  cookies,
  fileUpload,
  validation,
  monitoring
} = securityConfig;

export default securityConfig;