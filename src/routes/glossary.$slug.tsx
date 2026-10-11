import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { GuideShell } from '@/components/guide-shell';
import { glossaryEntries } from '@/content/library/glossary';

export const Route = createFileRoute('/glossary/$slug')({
  loader: ({ params }) => {
    const entry = glossaryEntries.find((candidate) => candidate.slug === params.slug);
    if (!entry) throw notFound();
    return { entry };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.entry.term ?? 'Glossary'} | HowToLiveWorse` },
      { name: 'description', content: loaderData?.entry.factualDefinition ?? 'A factual definition with a clearly labeled analogy.' },
    ],
  }),
  component: GlossaryEntryPage,
});

function GlossaryEntryPage() {
  const { entry } = Route.useLoaderData();
  return (
    <GuideShell>
      <main className="article-page site-container">
        <Link className="text-link" to="/glossary">← All 41 terms</Link>
        <p className="site-overline">FACT FIRST · ANALOGY SECOND</p>
        <h1>{entry.term}</h1>
        <section className="definition-card">
          <h2>Factual definition</h2>
          <p>{entry.factualDefinition}</p>
        </section>
        <section className="analogy-card">
          <p className="site-overline">SATIRICAL ANALOGY — NOT A DEFINITION</p>
          <p>{entry.satiricalAnalogy}</p>
        </section>
        <aside className="article-boundary"><strong>Scope:</strong> {entry.applicability}</aside>
        <section className="article-sources">
          <h2>Related entries in the source book</h2>
          <p>These are reading links, not claims that the guide entry defines this term.</p>
          <ul>{entry.guideIds.map((id) => <li key={id}><Link to="/entry/$entryId" params={{ entryId: id }}>{id} — read the original evidence and limits</Link></li>)}</ul>
        </section>
      </main>
    </GuideShell>
  );
}
