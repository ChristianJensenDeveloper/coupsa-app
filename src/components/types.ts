export interface Coupon {
  id: string;
  title: string;
  description: string;
  discount: string;
  category: 'CFD' | 'Futures' | 'Crypto' | 'Brokers' | 'Casinos' | 'Giveaways';
  merchant: string;
  validUntil: string;
  startDate: string;
  endDate: string;
  terms: string;
  code: string;
  isClaimed: boolean;
  imageUrl: string;
  logoUrl?: string;
  affiliateLink: string;
  firmId?: string;
  status?: 'Draft' | 'Published' | 'Archived';
  hasVerificationBadge?: boolean;
  cardNotes?: string;
  // Button configuration
  buttonConfig?: 'both' | 'claim-only' | 'code-only';
  // Background image properties
  backgroundImageUrl?: string;
  backgroundImagePosition?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  backgroundBlur?: number; // 0-20, blur intensity in pixels
}

export type CouponCategory = 'All' | 'CFD' | 'Futures' | 'Crypto' | 'Brokers' | 'Casinos' | 'Giveaways';

export type AppPage = 'home' | 'profile' | 'my-deals' | 'preferences' | 'faq' | 'settings' | 'share-leaderboard' | 'contact' | 'what-is-koocao' | 'giveaways' | 'terms' | 'privacy' | 'broker-register' | 'broker-dashboard' | 'logo-ideas';

export type LoginMethod = 'facebook' | 'google' | 'apple' | 'email';

export interface User {
  id: string;
  loginMethod: LoginMethod;
  name?: string;
  phoneNumber: string;
  email?: string;
  joinedAt: string;
  status?: 'active' | 'suspended' | 'banned';
  country?: string;
  countryCode?: string; // ISO 2-letter code
  ipAddress?: string;
  lastActive?: string;
  // Consent preferences
  consents?: {
    termsAccepted: boolean;
    gdprAccepted: boolean;
    marketingConsent: boolean;
    emailMarketing: boolean;
    smsMarketing: boolean;
    whatsappMarketing: boolean;
    pushNotifications: boolean;
    consentDate: string;
  };
  // Notification preferences
  notificationPreferences?: {
    smsNotifications: boolean;
    whatsappNotifications: boolean;
    updatedAt: string;
  };
}

export interface UserActivity {
  totalCouponClicks: number;
  totalAffiliateClicks: number;
  companyClicks: CompanyClick[];
  dailyActivity: DailyActivity[];
}

export interface CompanyClick {
  companyName: string;
  companyId: string;
  clicks: number;
  logoUrl?: string;
}

export interface DailyActivity {
  date: string;
  clicks: number;
  affiliateClicks: number;
  couponClicks: number;
}

export type AdminCategory = 'CFD' | 'Futures' | 'Crypto' | 'Brokers' | 'Casinos' | 'Giveaways';

export interface Firm {
  id: string;
  name: string;
  logo?: string;
  affiliateLink: string;
  couponCode?: string; // Made optional
  category: 'CFD' | 'Futures' | 'Crypto' | 'Brokers' | 'Casinos';
  createdAt: string;
  status: 'Active' | 'Inactive';
}

export interface AdminDeal {
  id: string;
  firmId: string;
  title: string;
  discountPercentage: number;
  couponCode?: string; // Made optional
  category: AdminCategory;
  startDate: string;
  endDate: string;
  status: 'Draft' | 'Published' | 'Archived';
  hasVerificationBadge: boolean;
  cardNotes: string;
  campaignLogo?: string;
  affiliateLink?: string;
  discountType?: 'percentage' | 'fixed' | 'free';
  fixedAmount?: string;
  freeText?: string;
  // Button configuration
  buttonConfig?: 'both' | 'claim-only' | 'code-only';
  // Background image properties
  backgroundImageUrl?: string;
  backgroundImagePosition?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  backgroundBlur?: number; // 0-20, blur intensity in pixels
}

// Tracking & Analytics Types
export type PlatformType = 'google_gtm' | 'google_ga4' | 'meta_pixel' | 'twitter_pixel' | 'linkedin_insight' | 'tiktok_pixel';

export interface TrackingCode {
  id: string;
  platform: PlatformType;
  mode: 'id' | 'snippet';
  value: string;
  placement: 'head' | 'body';
  load: 'async' | 'defer' | 'none';
  enabled: boolean;
  environments: ('dev' | 'staging' | 'prod')[];
  requiresConsent: boolean;
  order: number;
  lastModified: string;
  lastModifiedBy: string;
}

export interface TrackingSettings {
  tracking: TrackingCode[];
  useGTM: boolean;
  lastUpdated: string;
  updatedBy: string;
}

// Chat Support Types
export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: 'user' | 'admin';
  senderName: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface ChatConversation {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  status: 'open' | 'closed' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  subject?: string;
  lastMessage?: string;
  lastMessageAt: string;
  createdAt: string;
  assignedAdmin?: string;
  messages: ChatMessage[];
  unreadCount: number;
  tags?: string[];
}

// Giveaways Types
export interface Giveaway {
  id: string;
  title: string;
  prize: string;
  description: string;
  firm?: string;
  logoUrl?: string;
  imageUrl?: string;
  bannerUrl?: string;
  status: 'running' | 'selecting-winner' | 'finished';
  startDate: string;
  endDate: string;
  finishedDate?: string;
  totalEntries: number;
  totalParticipants: number;
  userEntries?: number;
  userRank?: number;
  winner?: {
    name: string;
    entries: number;
  };
  shareUrl?: string;
  rules: string;
}

// Broker/Company Types
export interface Company {
  id: string;
  name: string;
  description: string;
  website: string;
  logoUrl?: string;
  categories: ('CFD' | 'Futures' | 'Crypto' | 'Brokers' | 'Casinos')[]; // Changed to support multiple categories
  country?: string;
  contactEmail: string;
  contactPhone?: string;
  createdAt: string;
  updatedAt?: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended' | 'admin_created' | 'claim_pending' | 'claimed' | 'connected';
  userId?: string; // Optional - Links to the User who created/claimed this company
  // Creation tracking
  createdBy?: 'admin' | 'user'; // Track who originally created this company
  originalCreatorId?: string; // Admin ID who created it initially
  // Claiming system
  claimRequestedBy?: string; // User ID who requested to claim this company
  claimRequestedAt?: string;
  claimToken?: string; // Verification token for claiming process
  claimVerificationMethod?: 'email_domain' | 'email_verification' | 'manual_approval';
  // Admin approval tracking
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  // Company connection tracking (for connecting to existing companies)
  connectedToCompanyId?: string; // ID of the existing company this was connected to
  connectionNotes?: string; // Admin notes about the connection
  // Company verification data
  verificationData?: {
    submittedDocuments?: string[];
    domainVerified?: boolean;
    emailVerified?: boolean;
    phoneVerified?: boolean;
  };
  // Additional fields for existing companies
  hasActiveDeals?: boolean;
  dealCount?: number;
  // Marketing data - source of truth for affiliate links and coupon codes
  defaultMarketingData?: {
    affiliateLink?: string;
    defaultCouponCode?: string;
    trackingParameters?: string;
    conversionPixel?: string;
    notes?: string;
    isComplete?: boolean; // Tracks if marketing data is complete for deal approval
    updatedAt?: string;
    updatedBy?: string; // Admin ID who last updated
  };
}

export interface BrokerDeal {
  id: string;
  companyId: string;
  title: string;
  description: string;
  category: 'CFD' | 'Futures' | 'Crypto' | 'Brokers' | 'Casinos';
  startDate: string;
  endDate: string;
  terms: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'archived';
  createdAt: string;
  updatedAt: string;
  // Note: No affiliate links or coupon codes - admin handles those
  // Admin fields (added after approval)
  affiliateLink?: string;
  couponCode?: string;
  discountType?: 'percentage' | 'fixed' | 'free';
  discountValue?: number;
  fixedAmount?: string;
  freeText?: string;
  hasVerificationBadge?: boolean;
  cardNotes?: string;
  backgroundImageUrl?: string;
  backgroundImagePosition?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  backgroundBlur?: number;
  buttonConfig?: 'both' | 'claim-only' | 'code-only';
  // Admin approval tracking
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  // Marketing data inheritance tracking
  marketingDataSource?: 'inherited' | 'override' | 'manual';
  inheritedFromCompany?: boolean; // Whether this deal inherited marketing data from company
  marketingDataOverrides?: {
    affiliateLink?: string;
    couponCode?: string;
    trackingParameters?: string;
    notes?: string;
    overriddenAt?: string;
    overriddenBy?: string; // Admin ID who made the override
  };
  // Validation flags
  canGoLive?: boolean; // Whether deal has complete marketing data and can be approved
  missingMarketingFields?: string[]; // Array of missing required fields
}

export type CompanyStatus = 'pending' | 'approved' | 'rejected' | 'suspended' | 'admin_created' | 'claim_pending' | 'claimed' | 'connected';
export type BrokerDealStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'archived';