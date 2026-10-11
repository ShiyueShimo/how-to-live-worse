import { useMemo, useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { GuideEntryCard } from '@/components/guide-entry-card';
import { GuideShell } from '@/components/guide-shell';
import { useGuideCatalog } from '@/lib/use-guide-catalog';
import { createTopFifty } from '@/lib/guide-interactions';

function TopFiftyPage() {
  const catalog = useGuideCatalog(true);
  const [drawNumber, setDrawNumber] = useState(0);
  const seed = drawNumber === 0 ? 'daily-first-draw' : `draw-${drawNumber}`;
  const records = useMemo(() => catalog.records ? createTopFifty(catalog.records, seed) : [], [catalog.records, seed]);

  return (
    <GuideShell active="play">
      <main className="site-container content-page">
        <div className="page-heading">
          <p className="site-overline">50 FROM THE WHOLE BOOK · LOW-RISK POOL</p>
          <h1>Today’s unranked shortlist.</h1>
          <p className="page-intro">A seeded sample of 50 low-risk source entries, drawn from the full catalogue. It is not a ranking, a life score or a claim that everyone should do these things.</p>
          <div className="home-actions">
            <button className="button button-dark" type="button" onClick={() => setDrawNumber((current) => current + 1)}>Draw another 50</button>
            <Link className="button button-outline" to="/book">Open all chapters</Link>
          </div>
        </div>
        {catalog.loading ? <p>Drawing from the complete source index…</p> : null}
        {catalog.error ? <p className="empty-state">{catalog.error}</p> : null}
        {records.map((record) => <GuideEntryCard key={record.id} record={record} />)}
      </main>
    </GuideShell>
  );
}

export const Route = createFileRoute('/top-50')({
  head: () => ({ meta: [{ title: 'A rotating 50 | HowToLiveWorse' }, { name: 'description', content: 'Draw 50 distinct low-risk entries from the complete 675-entry guide. No ranking and no shortlist limit.' }] }),
  component: TopFiftyPage,
});
