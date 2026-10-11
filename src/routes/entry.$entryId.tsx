import { createFileRoute, Link, notFound } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { getLocale, localizeUrl } from '@/paraglide/runtime.js';
import { GuideChecklistControl } from '@/components/guide-checklist-control';
import { GuideMarkdown } from '@/components/guide-markdown';
import { GuideShell } from '@/components/guide-shell';
import { getGuideRecord } from '@/content/guide/chapter-data';
import { guideChapters, guideManifest } from '@/content/guide/data';
import type { GuideRecord } from '@/content/guide/types';

function referenceHref(reference: string) {
  if (reference.startsWith('chapter:'))
    return `/book/${reference.slice('chapter:'.length)}`;
  return `/entry/${reference}`;
}

function EntryPage() {
  const { record } = Route.useLoaderData();
  const chapter = guideChapters.find(
    (candidate) => candidate.id === record.chapterId
  );

  return (
    <GuideShell active="book">
      <main className="site-container content-page entry-page">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link to="/book">All chapters</Link>
          <span>/</span>
          {chapter ? (
            <Link to="/book/$chapterId" params={{ chapterId: chapter.id }}>
              {chapter.englishTitle}
            </Link>
          ) : null}
          <span>/</span>
          <span>{record.id}</span>
        </nav>
        {record.riskClass !== 'low' ? (
          <aside className="safety-banner" role="note">
            <strong>Read the source facts first.</strong> This reverse card
            jokes about a familiar excuse; it is not counter-advice for a
            health, legal, financial, emergency, or safety decision.
          </aside>
        ) : null}
        <header className="page-heading entry-heading">
          <p className="site-overline">
            {record.id} · EVIDENCE {record.evidenceGrade} ·{' '}
            {record.riskClass === 'low'
              ? 'LOW-RISK READING'
              : 'SOURCE-SENSITIVE'}
          </p>
          <h1>{record.englishTitle}</h1>
          <p className="entry-original-title" lang="zh">
            {record.title}
          </p>
          <div className="entry-metrics">
            <div>
              <span>Source cost</span>
              <p>{record.costSummary}</p>
            </div>
            <div>
              <span>Source return</span>
              <p>{record.benefitSummary}</p>
            </div>
            <div>
              <span>Evidence grade</span>
              <p>{record.evidenceGrade}</p>
            </div>
          </div>
        </header>

        <section
          className="inversion-feature"
          aria-labelledby="inversion-title"
        >
          <div className="inversion-feature-label">
            <span>THE LOW-ROI DETOUR</span>
            <span>Satire, not advice</span>
          </div>
          <h2 id="inversion-title">{record.inversion.headline}</h2>
          <div className="inversion-grid">
            <div>
              <h3>The excuse</h3>
              <p>{record.inversion.rationalization}</p>
            </div>
            <div>
              <h3>What feels good now</h3>
              <p>{record.inversion.immediateReward}</p>
            </div>
            <div>
              <h3>What the source says</h3>
              <p>{record.inversion.possibleTradeoff}</p>
            </div>
          </div>
          <p className="recovery-link">{record.inversion.recoveryLink}</p>
        </section>

        <section
          className="original-reading"
          aria-labelledby="english-source-title"
        >
          <div className="section-heading-row">
            <div>
              <p className="site-overline">THE ENGLISH EDITION</p>
              <h2 id="english-source-title">
                Original recommendation and evidence
              </h2>
            </div>
            <span>Source commit {guideManifest.commitSha.slice(0, 12)}</span>
          </div>
          <GuideMarkdown markdown={record.englishText} />
          <div className="source-link-list">
            <h3>Source links</h3>
            <ul>
              {record.sources.map((source, index) => (
                <li key={`${record.id}-source-${index}`}>
                  {source.url ? (
                    <a href={source.url} target="_blank" rel="noreferrer">
                      {source.label || source.url} ↗
                    </a>
                  ) : (
                    <span>{source.label}</span>
                  )}
                </li>
              ))}
              <li>
                <a
                  href={record.chapterSourceUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Pinned original chapter on GitHub ↗
                </a>
              </li>
            </ul>
          </div>
        </section>

        <details className="original-language">
          <summary>Read the complete Chinese source and notes</summary>
          <GuideMarkdown markdown={record.originalText} lang="zh" />
          {record.authorNotes ? (
            <p className="author-note">
              <strong>Author's scope notes:</strong> {record.authorNotes}
            </p>
          ) : null}
        </details>

        <GuideChecklistControl guideId={record.id} />

        {record.references.length > 0 ? (
          <section
            className="cross-reference-section"
            aria-labelledby="cross-reference-title"
          >
            <h2 id="cross-reference-title">Related source entries</h2>
            <ul>
              {record.references.map((reference) => (
                <li key={reference}>
                  <a href={referenceHref(reference)}>
                    {reference.startsWith('chapter:')
                      ? `Chapter ${reference.slice(8)}`
                      : reference}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <footer className="entry-attribution">
          <p>
            Original content by eternity4719 under CC BY 4.0. English
            translation is credited in the source notes. HowToLiveWorse adds a
            clearly labeled satirical response.
          </p>
          <Link to="/sources">Full source and adaptation notes</Link>
        </footer>
      </main>
    </GuideShell>
  );
}

export const Route = createFileRoute('/entry/$entryId')({
  loader: async ({ params }) => {
    const record: GuideRecord | undefined = await getGuideRecord(
      params.entryId
    );
    if (!record) throw notFound();
    return { record };
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return { meta: [{ title: 'Guide entry | HowToLiveWorse' }] };
    const locale = getLocale();
    const canonical = localizeUrl(
      `${envConfigs.app_url.replace(/\/$/, '')}/entry/${loaderData.record.id}`,
      { locale }
    ).href;
    return {
      meta: [
        { title: `${loaderData.record.englishTitle} | HowToLiveWorse` },
        { name: 'description', content: loaderData.record.benefitSummary },
      ],
      links: [{ rel: 'canonical', href: canonical }],
    };
  },
  component: EntryPage,
});
