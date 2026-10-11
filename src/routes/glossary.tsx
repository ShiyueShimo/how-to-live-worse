import { useMemo, useState } from 'react';
import {
  createFileRoute,
  Link,
  Outlet,
  useRouterState,
} from '@tanstack/react-router';

import { GuideShell } from '@/components/guide-shell';
import { glossaryEntries } from '@/content/library/glossary';

function GlossaryPage() {
  const [query, setQuery] = useState('');
  const visibleTerms = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('en');
    return glossaryEntries.filter((entry) =>
      `${entry.term} ${entry.factualDefinition} ${entry.satiricalAnalogy}`
        .toLocaleLowerCase('en')
        .includes(normalized)
    );
  }, [query]);
  const isTermDetail = useRouterState({
    select: (state) =>
      state.matches.some((match) => match.routeId === '/glossary/$slug'),
  });

  if (isTermDetail) return <Outlet />;

  return (
    <GuideShell>
      <main className="library-page site-container">
        <p className="site-overline">
          41 terms · facts kept separate from jokes
        </p>
        <h1>Words that deserve a second look.</h1>
        <p className="library-intro">
          Read the factual definition first. A clearly labeled analogy follows;
          it is there for the smile, not for evidence.
        </p>
        <label className="library-search">
          <span>Search terms</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder="Search a term or definition"
          />
        </label>
        <p className="term-count" aria-live="polite">
          {visibleTerms.length} of {glossaryEntries.length} terms
        </p>
        <div className="term-grid">
          {visibleTerms.map((entry) => (
            <article className="term-tile" key={entry.slug}>
              <h2>
                <Link to="/glossary/$slug" params={{ slug: entry.slug }}>
                  {entry.term}
                </Link>
              </h2>
              <p>{entry.factualDefinition}</p>
              <Link
                className="text-link"
                to="/glossary/$slug"
                params={{ slug: entry.slug }}
              >
                Definition and caveats <span aria-hidden="true">→</span>
              </Link>
            </article>
          ))}
        </div>
        {visibleTerms.length === 0 ? (
          <p className="empty-state">No term found. Try a shorter search.</p>
        ) : null}
        <p className="reference-note">
          Health, statistics and Mainland China legal terms are simplified
          reading aids. Follow each term’s scope note and open the cited source
          entry before using it in a decision.
        </p>
      </main>
    </GuideShell>
  );
}

export const Route = createFileRoute('/glossary')({
  head: () => ({
    meta: [
      { title: 'Glossary | HowToLiveWorse' },
      {
        name: 'description',
        content:
          'Forty-one concise statistical, health, safety and legal definitions, with clearly separate satirical analogies.',
      },
    ],
  }),
  component: GlossaryPage,
});
