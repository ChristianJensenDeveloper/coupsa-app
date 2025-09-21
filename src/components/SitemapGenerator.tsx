// This component generates sitemap data for SEO
// In production, you would typically generate a static sitemap.xml file

export const SITEMAP_URLS = [
  {
    loc: 'https://koocao.com/',
    changefreq: 'daily',
    priority: '1.0',
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    loc: 'https://koocao.com/about',
    changefreq: 'monthly',
    priority: '0.8',
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    loc: 'https://koocao.com/giveaways',
    changefreq: 'weekly',
    priority: '0.9',
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    loc: 'https://koocao.com/faq',
    changefreq: 'monthly',
    priority: '0.7',
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    loc: 'https://koocao.com/contact',
    changefreq: 'monthly',
    priority: '0.6',
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    loc: 'https://koocao.com/partners/register',
    changefreq: 'monthly',
    priority: '0.8',
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    loc: 'https://koocao.com/terms',
    changefreq: 'yearly',
    priority: '0.3',
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    loc: 'https://koocao.com/privacy',
    changefreq: 'yearly',
    priority: '0.3',
    lastmod: new Date().toISOString().split('T')[0]
  }
];

export function generateSitemap(): string {
  const urls = SITEMAP_URLS.map(url => `
  <url>
    <loc>${url.loc}</loc>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
    <lastmod>${url.lastmod}</lastmod>
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls}
</urlset>`;
}

// Component for displaying sitemap info in admin
export function SitemapInfo() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Sitemap URLs</h3>
      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
          The following URLs are included in the sitemap for search engine indexing:
        </p>
        <div className="space-y-2">
          {SITEMAP_URLS.map((url, index) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <span className="font-mono text-blue-600 dark:text-blue-400">{url.loc}</span>
              <div className="flex gap-2 text-xs text-slate-500">
                <span>{url.changefreq}</span>
                <span>({url.priority})</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          <strong>Note:</strong> In production, you should generate a static sitemap.xml file and submit it to Google Search Console for better SEO performance.
        </p>
      </div>
    </div>
  );
}