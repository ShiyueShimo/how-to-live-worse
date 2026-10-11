import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { GuideEntryCard } from '@/components/guide-entry-card';
import { GuideShell } from '@/components/guide-shell';
import { guideChapters, guideManifest } from '@/content/guide/data';
import { getGuideChapterRecords } from '@/content/guide/chapter-data';
import { envConfigs } from '@/config';
import { getLocale, localizeUrl } from '@/paraglide/runtime.js';

function ChapterPage() {
  const { chapter, records } = Route.useLoaderData();

  return (
    <GuideShell active="book">
      <main className="site-container content-page">
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link to="/book">All chapters</Link><span>/</span><span>{chapter.id}</span></nav>
        <header className="page-heading chapter-heading">
          <p className="site-overline">CHAPTER {chapter.id} · {records.length} SOURCE ENTRIES</p>
          <h1>{chapter.englishTitle}</h1>
          <p className="original-chapter-title" lang="zh">{chapter.title}</p>
          <p className="page-intro">{chapter.summary}</p>
          <a className="text-link" href={records[0]?.chapterSourceUrl} target="_blank" rel="noreferrer">Open this pinned source chapter ↗</a>
        </header>
        <div className="chapter-entry-list">
          {records.map((record) => <GuideEntryCard key={record.id} record={record} />)}
        </div>
        <p className="source-snapshot-note">Source snapshot: {guideManifest.commitSha}. Every original stays available in Chinese alongside the English edition.</p>
      </main>
    </GuideShell>
  );
}

export const Route = createFileRoute('/book/$chapterId')({
  loader: async ({ params }) => {
    const chapter = guideChapters.find((candidate) => candidate.id === params.chapterId);
    if (!chapter) throw notFound();
    const records = await getGuideChapterRecords(chapter.id);
    return { chapter, records };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: 'Chapter | HowToLiveWorse' }] };
    const locale = getLocale();
    const canonical = localizeUrl(`${envConfigs.app_url.replace(/\/$/, '')}/book/${loaderData.chapter.id}`, { locale }).href;
    return { meta: [{ title: `${loaderData.chapter.englishTitle} | HowToLiveWorse` }, { name: 'description', content: `Every source entry and reverse card in chapter ${loaderData.chapter.id}.` }], links: [{ rel: 'canonical', href: canonical }] };
  },
  component: ChapterPage,
});
