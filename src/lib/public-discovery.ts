export const PROJECT_GITHUB_URL =
  'https://github.com/ShiyueShimo/how-to-live-worse';
export const PROJECT_GITHUB_ISSUES_URL = `${PROJECT_GITHUB_URL}/issues`;
export const SOURCE_GUIDE_URL =
  'https://github.com/eternity4719/HowToLiveBetter';
export const SOURCE_LICENSE_URL =
  'https://creativecommons.org/licenses/by/4.0/';
export const SOCIAL_IMAGE_PATH = '/images/reading-nook-v2.png';

const ROBOTS_DISALLOW = [
  '/admin',
  '/settings',
  '/sign-in',
  '/sign-up',
  '/blog',
  '/pricing',
  '/api/',
  '/zh',
];

const INDEXABLE_STATIC_PATHS: { path: string; priority: string }[] = [
  { path: '/', priority: '1.0' },
  { path: '/book', priority: '0.9' },
  { path: '/articles', priority: '0.7' },
  { path: '/glossary', priority: '0.6' },
  { path: '/book/download', priority: '0.5' },
  { path: '/about', priority: '0.5' },
  { path: '/contact', priority: '0.5' },
  { path: '/sources', priority: '0.5' },
  { path: '/privacy-policy', priority: '0.5' },
  { path: '/terms-of-service', priority: '0.5' },
  { path: '/changelog', priority: '0.5' },
];

function stripTrailingSlash(origin: string) {
  return origin.replace(/\/$/, '');
}

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export function absoluteUrl(origin: string, path: string) {
  if (path === '/') return `${stripTrailingSlash(origin)}/`;
  return `${stripTrailingSlash(origin)}${path}`;
}

export function socialImageUrl(origin: string) {
  return absoluteUrl(origin, SOCIAL_IMAGE_PATH);
}

export function buildRobotsTxt(origin: string) {
  const sitemap = `${stripTrailingSlash(origin)}/sitemap.xml`;
  return [
    'User-agent: *',
    'Allow: /',
    ...ROBOTS_DISALLOW.map((path) => `Disallow: ${path}`),
    `Sitemap: ${sitemap}`,
    '',
  ].join('\n');
}

export function buildSitemapXml(
  origin: string,
  inventory: {
    chapters: { id: string; entryIds: string[] }[];
    articleSlugs: string[];
    glossarySlugs: string[];
  }
) {
  const urls = [
    ...INDEXABLE_STATIC_PATHS.map(({ path, priority }) =>
      sitemapUrl(origin, path, priority)
    ),
    ...inventory.chapters.map((chapter) =>
      sitemapUrl(origin, `/book/${chapter.id}`, '0.8')
    ),
    ...inventory.chapters.flatMap((chapter) =>
      chapter.entryIds.map((id) => sitemapUrl(origin, `/entry/${id}`, '0.6'))
    ),
    ...inventory.articleSlugs.map((slug) =>
      sitemapUrl(origin, `/articles/${slug}`, '0.6')
    ),
    ...inventory.glossarySlugs.map((slug) =>
      sitemapUrl(origin, `/glossary/${slug}`, '0.5')
    ),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`;
}

function sitemapUrl(origin: string, path: string, priority: string) {
  return `<url><loc>${escapeXml(absoluteUrl(origin, path))}</loc><changefreq>weekly</changefreq><priority>${priority}</priority></url>`;
}

export function socialHead({
  origin,
  title,
  description,
  path,
}: {
  origin: string;
  title: string;
  description: string;
  path: string;
}) {
  const canonical = absoluteUrl(origin, path);
  const image = socialImageUrl(origin);
  return {
    meta: [
      { title },
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: canonical },
      { property: 'og:image', content: image },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image },
    ],
    links: [
      { rel: 'canonical', href: canonical },
      { rel: 'alternate', hrefLang: 'en', href: canonical },
      { rel: 'alternate', hrefLang: 'x-default', href: canonical },
    ],
  };
}
