import { useMemo, useState } from 'react';
import {
  createFileRoute,
  Link,
  Outlet,
  useRouterState,
} from '@tanstack/react-router';

import { GuideShell } from '@/components/guide-shell';
import { articles } from '@/content/library/articles';

function ArticlesPage() {
  const [query, setQuery] = useState('');
  const visibleArticles = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('en');
    return articles.filter((article) =>
      `${article.title} ${article.summary}`
        .toLocaleLowerCase('en')
        .includes(normalized)
    );
  }, [query]);
  const isArticleDetail = useRouterState({
    select: (state) =>
      state.matches.some((match) => match.routeId === '/articles/$slug'),
  });

  if (isArticleDetail) return <Outlet />;

  return (
    <GuideShell active="articles">
      <main className="library-page site-container">
        <p className="site-overline">
          10 original counter-essays · source-linked
        </p>
        <h1>When a small shortcut grows legs.</h1>
        <p className="library-intro">
          Ten fresh essays riff on the reference site’s visible article topics.
          They keep the jokes on familiar habits and keep health, safety and
          legal facts out of the punchline.
        </p>
        <label className="library-search">
          <span>Find an essay</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder="Search a topic"
          />
        </label>
        <div className="article-grid">
          {visibleArticles.map((article, index) => (
            <article className="article-tile" key={article.slug}>
              <p className="site-overline">
                ESSAY {String(index + 1).padStart(2, '0')}
              </p>
              <h2>
                <Link to="/articles/$slug" params={{ slug: article.slug }}>
                  {article.title}
                </Link>
              </h2>
              <p>{article.summary}</p>
              <Link
                className="text-link"
                to="/articles/$slug"
                params={{ slug: article.slug }}
              >
                Read the essay <span aria-hidden="true">→</span>
              </Link>
            </article>
          ))}
        </div>
        {visibleArticles.length === 0 ? (
          <p className="empty-state">No essay found. Try a shorter search.</p>
        ) : null}
        <p className="reference-note">
          The reference article index displayed 10 items on 2026-10-09; its
          llms.txt still says 8. This edition maps all 10 visible topics with
          new writing.
        </p>
      </main>
    </GuideShell>
  );
}

export const Route = createFileRoute('/articles')({
  head: () => ({
    meta: [
      { title: 'Counter-essays | HowToLiveWorse' },
      {
        name: 'description',
        content:
          'Original low-ROI essays about habits, planning, and trade-offs, with links back to the complete source guide.',
      },
    ],
  }),
  component: ArticlesPage,
});
