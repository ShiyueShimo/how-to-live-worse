import { createFileRoute } from '@tanstack/react-router';

import { guideChapters, guideManifest } from '@/content/guide/data';
import { articles } from '@/content/library/articles';
import { glossaryEntries } from '@/content/library/glossary';

export const Route = createFileRoute('/llms.txt')({
  server: {
    handlers: {
      GET: () => {
        const content = [
          '# HowToLiveWorse',
          '',
          '> An independent source-linked satire. Original evidence, scope and safety notes remain visible. Not advice or a life score.',
          '',
          '## Core pages',
          '- [Complete guide](/book): all source chapters and entries.',
          '- [Source and attribution](/sources): pinned commits, licenses and adaptations.',
          '- [Original essays](/articles): ten original counter-essays.',
          '- [Glossary](/glossary): factual definitions and separate satirical analogies.',
          '- [Offline editions](/book/download): downloadable reading formats.',
          '- [Privacy](/privacy-policy): local browser state and hosting notes.',
          '- [Full AI-readable edition](/llms-full.txt): all chapters, entries and source attribution.',
          '- [Reader skill](/howtoliveworse-skill.md): instructions for AI tools that summarize this site.',
          '',
          '## Play and tools',
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
          ].map((path) => `- ${path}`),
          '',
          '## Pinned guide snapshot',
          `- Repository: ${guideManifest.repositoryUrl}`,
          `- Commit: ${guideManifest.commitSha}`,
          `- Contents: ${guideChapters.length} chapters, ${guideManifest.entryCount} entries.`,
          `- Essays: ${articles.length}; glossary entries: ${glossaryEntries.length}.`,
          '- Machine-readable search catalogue: /data/guide-catalog.json',
          '- Detailed entry pages preserve original-language text, English rendering, evidence grade, applicability and source URLs.',
          '',
          'For all entry details, use /book and follow each source link. The original recommendation remains authoritative over its satirical inversion.',
          '',
        ].join('\n');
        return new Response(content, {
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      },
    },
  },
});
