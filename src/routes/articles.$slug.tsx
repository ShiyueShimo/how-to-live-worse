import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { GuideShell } from '@/components/guide-shell';
import { articles } from '@/content/library/articles';

export const Route = createFileRoute('/articles/$slug')({
  loader: ({ params }) => {
    const article = articles.find((candidate) => candidate.slug === params.slug);
    if (!article) throw notFound();
    return { article };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.article.title ?? 'Essay'} | HowToLiveWorse` },
      { name: 'description', content: loaderData?.article.summary ?? 'An original counter-essay.' },
    ],
  }),
  component: ArticlePage,
});

function ArticlePage() {
  const { article } = Route.useLoaderData();
  return (
    <GuideShell active="articles">
      <main className="article-page site-container">
        <Link className="text-link" to="/articles">← All essays</Link>
        <p className="site-overline">AN ORIGINAL COUNTER-ESSAY</p>
        <h1>{article.title}</h1>
        <p className="library-intro">{article.summary}</p>
        <aside className="article-boundary"><strong>Scope:</strong> {article.applicability}</aside>
        <div className="article-sections">
          {article.sections.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              <p>{section.body}</p>
            </section>
          ))}
        </div>
        <section className="article-sources" aria-labelledby="article-sources-title">
          <h2 id="article-sources-title">Return to the complete source</h2>
          <p>These entries retain the original wording, citations, evidence label and applicability notes. The essay is a separate satire.</p>
          <ul>{article.mappedGuideIds.map((id) => <li key={id}><Link to="/entry/$entryId" params={{ entryId: id }}>{id} — open source and reverse card</Link></li>)}</ul>
        </section>
      </main>
    </GuideShell>
  );
}
