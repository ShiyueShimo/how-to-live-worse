import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { guideChapters } from '@/content/guide/data';
import { articles } from '@/content/library/articles';
import { glossaryEntries } from '@/content/library/glossary';

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function sitemapUrl(path: string, priority: string) {
  const origin = envConfigs.app_url.replace(/\/$/, '');
  return `<url><loc>${escapeXml(`${origin}${path}`)}</loc><changefreq>weekly</changefreq><priority>${priority}</priority></url>`;
}

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: () => {
        const paths = [
          sitemapUrl('/', '1.0'),
          sitemapUrl('/book', '0.9'),
          ...guideChapters.map((chapter) =>
            sitemapUrl(`/book/${chapter.id}`, '0.8')
          ),
          ...guideChapters.flatMap((chapter) =>
            chapter.entryIds.map((id) => sitemapUrl(`/entry/${id}`, '0.6'))
          ),
          ...articles.map((article) =>
            sitemapUrl(`/articles/${article.slug}`, '0.6')
          ),
          sitemapUrl('/articles', '0.7'),
          ...glossaryEntries.map((entry) =>
            sitemapUrl(`/glossary/${entry.slug}`, '0.5')
          ),
          sitemapUrl('/glossary', '0.6'),
          ...[
            '/checkup',
            '/top-50',
            '/quiz',
            '/daily',
            '/bingo',
            '/dashboard',
            '/focus',
            '/value',
            '/lab',
            '/changelog',
            '/national-day',
            '/book/download',
            '/about',
            '/contact',
            '/sources',
            '/privacy-policy',
            '/terms-of-service',
          ].map((path) => sitemapUrl(path, '0.5')),
        ];
        const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.join('')}</urlset>`;
        return new Response(xml, {
          headers: { 'Content-Type': 'application/xml; charset=utf-8' },
        });
      },
    },
  },
});
