import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { buildSitemapXml } from '@/lib/public-discovery';
import { guideChapters } from '@/content/guide/data';
import { articles } from '@/content/library/articles';
import { glossaryEntries } from '@/content/library/glossary';

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: () => {
        const xml = buildSitemapXml(envConfigs.app_url, {
          chapters: guideChapters.map((chapter) => ({
            id: chapter.id,
            entryIds: chapter.entryIds,
          })),
          articleSlugs: articles.map((article) => article.slug),
          glossarySlugs: glossaryEntries.map((entry) => entry.slug),
        });
        return new Response(xml, {
          headers: { 'Content-Type': 'application/xml; charset=utf-8' },
        });
      },
    },
  },
});
