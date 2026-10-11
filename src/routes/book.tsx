import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import {
  createFileRoute,
  Link,
  Outlet,
  useRouterState,
} from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { getLocale, localizeUrl } from '@/paraglide/runtime.js';
import { GuideEntryCard } from '@/components/guide-entry-card';
import { GuideShell } from '@/components/guide-shell';
import { createGuideSearch } from '@/content/guide/catalog';
import { guideChapters, guideManifest } from '@/content/guide/data';
import type { GuideFilters, GuideSearchRecord } from '@/content/guide/types';

const pageSize = 25;

function BookPage() {
  const [filters, setFilters] = useState<GuideFilters>({});
  const [page, setPage] = useState(1);
  const [catalogRecords, setCatalogRecords] = useState<GuideSearchRecord[]>();
  const [catalogError, setCatalogError] = useState('');
  const isFiltering = Object.values(filters).some(
    (value) => value !== undefined && value !== '' && value !== false
  );
  const search = useMemo(
    () => (catalogRecords ? createGuideSearch(catalogRecords) : undefined),
    [catalogRecords]
  );
  const results = useMemo(
    () => search?.searchGuideRecords(filters) ?? [],
    [filters, search]
  );
  const isCatalogLoading = isFiltering && !catalogRecords && !catalogError;
  const pageCount = Math.max(1, Math.ceil(results.length / pageSize));
  const visibleRecords = results.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => setPage(1), [filters]);

  useEffect(() => {
    if (!isFiltering || catalogRecords || catalogError) return;
    let current = true;
    fetch('/data/guide-catalog.json')
      .then((response) => {
        if (!response.ok)
          throw new Error(`Search index request failed (${response.status}).`);
        return response.json() as Promise<unknown>;
      })
      .then((records) => {
        if (!Array.isArray(records))
          throw new Error('The full-text search index is not an array.');
        if (current) setCatalogRecords(records as GuideSearchRecord[]);
      })
      .catch((error: unknown) => {
        if (current)
          setCatalogError(
            error instanceof Error
              ? error.message
              : 'Could not load the full-text search index.'
          );
      });
    return () => {
      current = false;
    };
  }, [catalogError, catalogRecords, isFiltering]);

  const isChapterDetail = useRouterState({
    select: (state) =>
      state.matches.some((match) => match.routeId === '/book/$chapterId'),
  });

  function updateText(event: ChangeEvent<HTMLInputElement>) {
    const query = event.currentTarget.value;
    setFilters((current) => ({ ...current, query: query || undefined }));
  }

  function updateSelect(
    event: ChangeEvent<HTMLSelectElement>,
    key: 'chapterId' | 'evidenceGrade' | 'resource' | 'cost'
  ) {
    const value = event.currentTarget.value;
    setFilters((current) => ({ ...current, [key]: value || undefined }));
  }

  function clearFilters() {
    setFilters({});
  }

  if (isChapterDetail) return <Outlet />;

  return (
    <GuideShell active="book">
      <main className="site-container content-page">
        <div className="page-heading">
          <h1>The complete guide</h1>
          <p className="page-intro">
            Browse {guideChapters.length} chapters and{' '}
            {guideManifest.entryCount} source-backed ideas, each paired with its
            low-ROI detour. Evidence, limitations, and original sources stay
            attached.
          </p>
          <p className="book-count">
            {guideChapters.length} chapters <span aria-hidden="true">·</span>{' '}
            {guideManifest.entryCount} paired entries
          </p>
        </div>

        <section
          className="catalogue-search"
          aria-labelledby="catalogue-search-title"
        >
          <h2 id="catalogue-search-title">Search the guide</h2>
          <div className="filter-grid">
            <label className="filter-field filter-query">
              <span>Search English or Chinese text</span>
              <input
                type="search"
                value={filters.query ?? ''}
                onChange={updateText}
                placeholder="Try “seat belt”, “拖延”, or a source number"
              />
            </label>
            <label className="filter-field">
              <span>Chapter</span>
              <select
                value={filters.chapterId ?? ''}
                onChange={(event) => updateSelect(event, 'chapterId')}
              >
                <option value="">All chapters</option>
                {guideChapters.map((chapter) => (
                  <option key={chapter.id} value={chapter.id}>
                    {chapter.id}. {chapter.englishTitle}
                  </option>
                ))}
              </select>
            </label>
            <label className="filter-field">
              <span>Evidence</span>
              <select
                value={filters.evidenceGrade ?? ''}
                onChange={(event) => updateSelect(event, 'evidenceGrade')}
              >
                <option value="">Any grade</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </label>
            <label className="filter-field">
              <span>Kind of return</span>
              <select
                value={filters.resource ?? ''}
                onChange={(event) => updateSelect(event, 'resource')}
              >
                <option value="">Any kind</option>
                <option value="lifespan">Lifespan</option>
                <option value="time-energy">Time &amp; energy</option>
                <option value="money">Money</option>
                <option value="freedom">Personal freedom</option>
              </select>
            </label>
            <label className="filter-field">
              <span>Cost</span>
              <select
                value={filters.cost ?? ''}
                onChange={(event) => updateSelect(event, 'cost')}
              >
                <option value="">Any cost</option>
                <option value="money">Money</option>
                <option value="time">Time</option>
                <option value="energy">Energy</option>
                <option value="persistence">Persistence</option>
              </select>
            </label>
          </div>
          <div className="filter-actions">
            <label className="safe-toggle">
              <input
                type="checkbox"
                checked={filters.safeOnly ?? false}
                onChange={(event) => {
                  const checked = event.currentTarget.checked;
                  setFilters((current) => ({
                    ...current,
                    safeOnly: checked || undefined,
                  }));
                }}
              />{' '}
              Keep playful results low-risk
            </label>
            <button
              className="plain-button"
              type="button"
              onClick={clearFilters}
              disabled={!isFiltering}
            >
              Clear filters
            </button>
          </div>
        </section>

        {isFiltering ? (
          <section className="catalogue-results" aria-live="polite">
            {isCatalogLoading ? (
              <p>Loading the complete 675-entry search index…</p>
            ) : null}
            {catalogError ? (
              <div className="empty-state">
                <p>{catalogError}</p>
                <button
                  className="plain-button"
                  type="button"
                  onClick={() => setCatalogError('')}
                >
                  Try again
                </button>
              </div>
            ) : null}
            {catalogRecords ? (
              <>
                <div className="results-heading">
                  <h2>
                    {results.length}{' '}
                    {results.length === 1 ? 'match' : 'matches'}
                  </h2>
                  <p>
                    Search terms and filters combine. Sensitive entries remain
                    readable, but stay out of playful random picks.
                  </p>
                </div>
                {results.length ? (
                  visibleRecords.map((record) => (
                    <GuideEntryCard key={record.id} record={record} />
                  ))
                ) : (
                  <p className="empty-state">
                    No entries match those filters. Try removing one condition.
                  </p>
                )}
                {results.length > pageSize ? (
                  <div className="pagination-controls">
                    <button
                      className="button button-outline"
                      type="button"
                      onClick={() =>
                        setPage((current) => Math.max(1, current - 1))
                      }
                      disabled={page === 1}
                    >
                      Previous
                    </button>
                    <span>
                      Page {page} of {pageCount}
                    </span>
                    <button
                      className="button button-outline"
                      type="button"
                      onClick={() =>
                        setPage((current) => Math.min(pageCount, current + 1))
                      }
                      disabled={page === pageCount}
                    >
                      Next
                    </button>
                  </div>
                ) : null}
              </>
            ) : null}
          </section>
        ) : (
          <section
            className="chapter-directory"
            aria-labelledby="chapter-directory-title"
          >
            <div className="results-heading">
              <h2 id="chapter-directory-title">Browse by chapter</h2>
              <p>
                Pick a section to see every numbered entry and its reverse card.
              </p>
            </div>
            <ol className="chapter-list">
              {guideChapters.map((chapter) => (
                <li key={chapter.id}>
                  <Link
                    to="/book/$chapterId"
                    params={{ chapterId: chapter.id }}
                  >
                    <span className="chapter-number">{chapter.id}</span>
                    <span className="chapter-name">
                      <strong>{chapter.englishTitle}</strong>
                      <small lang="zh">{chapter.title}</small>
                    </span>
                    <span className="chapter-count">
                      {chapter.entryIds.length} entries{' '}
                      <span aria-hidden="true">↗</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        )}

        <p className="source-snapshot-note">
          This edition is pinned to source commit{' '}
          <code>{guideManifest.commitSha.slice(0, 12)}</code>.{' '}
          <Link to="/book/download">Get an offline copy</Link>.
        </p>
      </main>
    </GuideShell>
  );
}

export const Route = createFileRoute('/book')({
  head: () => {
    const locale = getLocale();
    const canonical = localizeUrl(
      `${envConfigs.app_url.replace(/\/$/, '')}/book`,
      { locale }
    ).href;
    return {
      meta: [
        { title: 'The complete guide | HowToLiveWorse' },
        {
          name: 'description',
          content:
            'Browse all 675 source-linked recommendations across 34 chapters, with evidence and low-ROI reverse cards.',
        },
      ],
      links: [{ rel: 'canonical', href: canonical }],
    };
  },
  component: BookPage,
});
