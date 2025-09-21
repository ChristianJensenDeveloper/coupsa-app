import { useEffect } from 'react';
import { AppPage } from './types';

interface SEOHeadProps {
  currentPage: AppPage;
  dealCount?: number;
  userName?: string;
}

interface PageMeta {
  title: string;
  description: string;
  keywords: string;
  ogTitle?: string;
  ogDescription?: string;
  canonical?: string;
}

const PAGE_META: Record<AppPage | 'default', PageMeta> = {
  default: {
    title: 'COUPSA - Save Money on Prop Trading Challenges & Broker Bonuses',
    description: 'Discover exclusive deals and discounts on prop trading firm challenges, futures accounts, crypto trading, and broker bonuses. Save up to 50% on your next trading challenge with verified deals updated daily.',
    keywords: 'prop trading deals, prop firm discounts, trading challenge coupons, FTMO discount, prop trading coupons, broker bonuses, futures trading deals, crypto trading discounts, trading account deals',
    ogTitle: 'COUPSA - Your #1 Source for Prop Trading Deals',
    ogDescription: 'Save money on prop trading challenges with exclusive deals from top firms. Verified discounts updated daily.'
  },
  home: {
    title: 'COUPSA - Save Money on Prop Trading Challenges & Broker Bonuses',
    description: 'Discover exclusive deals and discounts on prop trading firm challenges, futures accounts, crypto trading, and broker bonuses. Save up to 50% on your next trading challenge with verified deals updated daily.',
    keywords: 'prop trading deals, prop firm discounts, trading challenge coupons, FTMO discount, prop trading coupons, broker bonuses, futures trading deals, crypto trading discounts, trading account deals',
    canonical: '/'
  },
  'my-deals': {
    title: 'My Saved Deals - COUPSA',
    description: 'View and manage your saved prop trading deals and broker bonuses. Track expiration dates and claim your discounts before they expire.',
    keywords: 'saved deals, prop trading bookmarks, my coupons, trading deal tracker',
    canonical: '/my-deals'
  },
  profile: {
    title: 'Profile Settings - COUPSA',
    description: 'Manage your COUPSA account settings, preferences, and deal notifications. Customize your trading deal discovery experience.',
    keywords: 'account settings, profile, notifications, preferences',
    canonical: '/profile'
  },
  preferences: {
    title: 'Deal Preferences - COUPSA',
    description: 'Customize your deal preferences to receive notifications about the best prop trading and broker deals that match your trading style.',
    keywords: 'deal preferences, notifications, trading style, customization',
    canonical: '/preferences'
  },
  giveaways: {
    title: 'Giveaways & Contests - COUPSA',
    description: 'Enter exclusive giveaways and contests for free prop trading challenges, funded accounts, and trading software. Win valuable trading prizes.',
    keywords: 'trading giveaways, prop firm contests, free challenges, trading prizes, funded account giveaways',
    canonical: '/giveaways'
  },
  faq: {
    title: 'Frequently Asked Questions - COUPSA',
    description: 'Get answers to common questions about prop trading deals, how to use COUPSA, and maximizing your savings on trading challenges.',
    keywords: 'FAQ, help, prop trading questions, deal questions, support',
    canonical: '/faq'
  },
  contact: {
    title: 'Contact Us - COUPSA',
    description: 'Get in touch with the COUPSA team. We\'re here to help you find the best prop trading deals and answer any questions.',
    keywords: 'contact, support, help, customer service',
    canonical: '/contact'
  },
  'what-is-coupsa': {
    title: 'What is COUPSA? - About Our Prop Trading Deal Platform',
    description: 'Learn about COUPSA, the leading platform for discovering exclusive prop trading deals, broker bonuses, and trading discounts. Save money and find verified deals from top trading firms.',
    keywords: 'about COUPSA, prop trading platform, deal finder, how it works, affiliate disclosure',
    canonical: '/about'
  },
  settings: {
    title: 'Settings - COUPSA',
    description: 'Configure your COUPSA account settings, privacy preferences, and notification options for prop trading deals.',
    keywords: 'settings, account, privacy, notifications',
    canonical: '/settings'
  },
  'share-leaderboard': {
    title: 'Share Leaderboard - COUPSA',
    description: 'Check your position on the COUPSA sharing leaderboard and earn rewards for helping others discover great prop trading deals.',
    keywords: 'leaderboard, sharing rewards, referrals, points',
    canonical: '/leaderboard'
  },
  'broker-register': {
    title: 'List Your Deals - COUPSA Partner Portal',
    description: 'Are you a prop trading firm or broker? Partner with COUPSA to showcase your deals to thousands of active traders looking for the best offers.',
    keywords: 'broker registration, prop firm partner, list deals, business partnership',
    canonical: '/partners/register'
  },
  'broker-dashboard': {
    title: 'Partner Dashboard - COUPSA',
    description: 'Manage your prop firm or broker deals, track performance, and reach more traders through the COUPSA platform.',
    keywords: 'partner dashboard, deal management, broker portal, analytics',
    canonical: '/partners/dashboard'
  },
  terms: {
    title: 'Terms of Service - COUPSA',
    description: 'Read the COUPSA terms of service and user agreement for our prop trading deal platform.',
    keywords: 'terms of service, user agreement, legal',
    canonical: '/terms'
  },
  privacy: {
    title: 'Privacy Policy - COUPSA',
    description: 'Learn how COUPSA protects your privacy and handles your data on our prop trading deal platform.',
    keywords: 'privacy policy, data protection, GDPR, privacy',
    canonical: '/privacy'
  }
};

export function SEOHead({ currentPage, dealCount, userName }: SEOHeadProps) {
  useEffect(() => {
    const meta = PAGE_META[currentPage] || PAGE_META.default;
    
    // Update title
    document.title = meta.title;
    
    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, property?: boolean) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let element = document.querySelector(selector) as HTMLMetaElement;
      
      if (!element) {
        element = document.createElement('meta');
        if (property) {
          element.setAttribute('property', name);
        } else {
          element.setAttribute('name', name);
        }
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Basic SEO meta tags
    updateMetaTag('description', meta.description);
    updateMetaTag('keywords', meta.keywords);
    updateMetaTag('author', 'COUPSA');
    updateMetaTag('robots', 'index, follow');
    updateMetaTag('viewport', 'width=device-width, initial-scale=1.0');
    
    // Open Graph tags for social media
    updateMetaTag('og:title', meta.ogTitle || meta.title, true);
    updateMetaTag('og:description', meta.ogDescription || meta.description, true);
    updateMetaTag('og:type', 'website', true);
    updateMetaTag('og:url', `https://coupsa.com${meta.canonical || '/'}`, true);
    updateMetaTag('og:site_name', 'COUPSA', true);
    updateMetaTag('og:image', 'https://coupsa.com/og-image.jpg', true);
    updateMetaTag('og:image:width', '1200', true);
    updateMetaTag('og:image:height', '630', true);
    updateMetaTag('og:image:alt', 'COUPSA - Save Money on Prop Trading Challenges', true);
    updateMetaTag('og:locale', 'en_US', true);
    
    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', meta.ogTitle || meta.title);
    updateMetaTag('twitter:description', meta.ogDescription || meta.description);
    updateMetaTag('twitter:image', 'https://coupsa.com/twitter-image.jpg');
    updateMetaTag('twitter:image:alt', 'COUPSA - Save Money on Prop Trading Challenges');
    updateMetaTag('twitter:site', '@COUPSA');
    updateMetaTag('twitter:creator', '@COUPSA');
    
    // Additional SEO tags
    updateMetaTag('theme-color', '#3b82f6');
    updateMetaTag('apple-mobile-web-app-capable', 'yes');
    updateMetaTag('apple-mobile-web-app-status-bar-style', 'default');
    updateMetaTag('apple-mobile-web-app-title', 'COUPSA');
    
    // Canonical URL
    let canonicalElement = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalElement) {
      canonicalElement = document.createElement('link');
      canonicalElement.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalElement);
    }
    canonicalElement.setAttribute('href', `https://coupsa.com${meta.canonical || '/'}`);
    
    // Structured Data (JSON-LD)
    let structuredDataElement = document.querySelector('#structured-data') as HTMLScriptElement;
    if (!structuredDataElement) {
      structuredDataElement = document.createElement('script');
      structuredDataElement.setAttribute('type', 'application/ld+json');
      structuredDataElement.setAttribute('id', 'structured-data');
      document.head.appendChild(structuredDataElement);
    }

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'COUPSA',
      alternateName: 'COUPSA Deal Finder',
      url: 'https://coupsa.com',
      description: 'Discover exclusive deals and discounts on prop trading firm challenges, futures accounts, crypto trading, and broker bonuses.',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://coupsa.com/search?q={search_term_string}'
        },
        'query-input': 'required name=search_term_string'
      },
      mainEntity: {
        '@type': 'Service',
        name: 'COUPSA Deal Discovery Platform',
        serviceType: 'Financial Deal Aggregation',
        provider: {
          '@type': 'Organization',
          name: 'COUPSA',
          url: 'https://coupsa.com',
          logo: 'https://coupsa.com/logo.png',
          description: 'COUPSA helps traders find the best deals on prop trading challenges, broker bonuses, and trading account offers.',
          foundingDate: '2024',
          knowsAbout: [
            'Prop Trading',
            'Trading Challenges', 
            'Broker Bonuses',
            'Financial Markets',
            'Trading Discounts'
          ],
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Trading Deals Catalog',
            itemListElement: [
              {
                '@type': 'Offer',
                category: 'CFD Trading Deals'
              },
              {
                '@type': 'Offer', 
                category: 'Futures Trading Deals'
              },
              {
                '@type': 'Offer',
                category: 'Crypto Trading Deals'
              },
              {
                '@type': 'Offer',
                category: 'Broker Bonuses'
              }
            ]
          }
        },
        areaServed: 'Worldwide',
        audience: {
          '@type': 'Audience',
          audienceType: 'Traders and Financial Market Participants'
        }
      }
    };

    // Add page-specific structured data safely
    try {
      if (currentPage === 'home' && dealCount && typeof dealCount === 'number') {
        // Safely add numberOfItems to the offer catalog
        if (structuredData.mainEntity?.provider?.hasOfferCatalog) {
          structuredData.mainEntity.provider.hasOfferCatalog.numberOfItems = dealCount;
        }
      }

      if (currentPage === 'my-deals' && userName) {
        // Create a new structure for profile pages
        const profileData = {
          '@context': 'https://schema.org',
          '@type': 'ProfilePage',
          mainEntity: {
            '@type': 'Person',
            name: userName,
            description: `${userName}'s saved deals on COUPSA`
          }
        };
        Object.assign(structuredData, profileData);
      }
    } catch (error) {
      console.warn('Error adding page-specific structured data:', error);
    }

    structuredDataElement.textContent = JSON.stringify(structuredData);

    // Add breadcrumb structured data for non-home pages
    if (currentPage !== 'home') {
      let breadcrumbElement = document.querySelector('#breadcrumb-data') as HTMLScriptElement;
      if (!breadcrumbElement) {
        breadcrumbElement = document.createElement('script');
        breadcrumbElement.setAttribute('type', 'application/ld+json');
        breadcrumbElement.setAttribute('id', 'breadcrumb-data');
        document.head.appendChild(breadcrumbElement);
      }

      const breadcrumbData = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://coupsa.com'
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: meta.title.replace(' - COUPSA', ''),
            item: `https://coupsa.com${meta.canonical || '/'}`
          }
        ]
      };

      breadcrumbElement.textContent = JSON.stringify(breadcrumbData);
    } else {
      // Remove breadcrumb data on home page
      const breadcrumbElement = document.querySelector('#breadcrumb-data');
      if (breadcrumbElement) {
        breadcrumbElement.remove();
      }
    }

  }, [currentPage, dealCount, userName]);

  return null; // This component doesn't render anything
}