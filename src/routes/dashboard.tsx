import { createFileRoute, Link } from '@tanstack/react-router';
import { GuideShell } from '@/components/guide-shell';
import { LocalStateRecovery } from '@/components/guide-checklist-control';
import { defaultGuideState, exportGuideState } from '@/lib/guide-state';
import { toCsv } from '@/lib/guide-interactions';
import { useGuideState } from '@/lib/use-guide-state';

function downloadText(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function DashboardPage() {
  const { result, hydrated, updateGuideState, removeGuideState } = useGuideState();
  const isCorrupt = result.status === 'corrupt';
  const state = isCorrupt ? defaultGuideState() : result.state;
  const savedIds = [...new Set([...Object.keys(state.statuses), ...state.favorites, ...Object.keys(state.notes)])].sort();
  const completedCount = Object.values(state.statuses).filter((status) => status === 'habit').length;

  function exportCsv() {
    const rows = [['guide_id', 'status', 'favorite', 'private_note'], ...savedIds.map((id) => [id, state.statuses[id] ?? '', String(state.favorites.includes(id)), state.notes[id] ?? ''])];
    downloadText('howtoliveworse-private-list.csv', toCsv(rows), 'text/csv;charset=utf-8');
  }

  function exportJson() {
    downloadText('howtoliveworse-private-list.json', exportGuideState(state), 'application/json;charset=utf-8');
  }

  function clearAll() {
    if (window.confirm('Clear this browser’s saved statuses, favorites, notes and game progress? This cannot be undone.')) removeGuideState();
  }

  return (
    <GuideShell active="list">
      <main className="site-container content-page">
        <div className="page-heading">
          <p className="site-overline">PRIVATE · LOCAL TO THIS BROWSER</p>
          <h1>Your list of familiar detours.</h1>
          <p className="page-intro">This page describes only the items you marked. It does not rate your health, money, personality or life quality.</p>
          <div className="book-stats"><strong>{savedIds.length}</strong><span>entries touched</span><strong>{completedCount}</strong><span>marked “I do this”</span></div>
        </div>
        {!hydrated ? <p>Reading this browser’s private list…</p> : null}
        {isCorrupt ? <LocalStateRecovery rawValue={result.rawValue} issue={result.issue} onClear={removeGuideState} /> : <>
          <div className="home-actions">
            <button className="button button-outline" type="button" onClick={exportCsv} disabled={!hydrated}>Export CSV</button>
            <button className="button button-outline" type="button" onClick={exportJson} disabled={!hydrated}>Export JSON</button>
            <button className="plain-button" type="button" onClick={clearAll} disabled={!hydrated}>Clear local data</button>
          </div>
          {savedIds.length ? <div className="dashboard-list">
            {savedIds.map((id) => <article className="dashboard-row" key={id}>
              <div><p className="site-overline">{id}</p><h2><Link to="/entry/$entryId" params={{ entryId: id }}>Open this source entry</Link></h2></div>
              <span>{state.statuses[id] ?? (state.favorites.includes(id) ? 'Saved' : '')}</span>
              {state.notes[id] ? <p className="dashboard-note">{state.notes[id]}</p> : null}
              <button className="plain-button" type="button" onClick={() => updateGuideState((current) => ({ ...current, favorites: current.favorites.filter((favorite) => favorite !== id), statuses: Object.fromEntries(Object.entries(current.statuses).filter(([savedId]) => savedId !== id)), notes: Object.fromEntries(Object.entries(current.notes).filter(([savedId]) => savedId !== id)) }))}>Remove from list</button>
            </article>)}
          </div> : <div className="empty-state"><h2>Your private list is empty.</h2><p>Open any entry to save a status, favorite or note. Nothing is sent to an account.</p><Link className="text-link" to="/book">Browse the full guide →</Link></div>}
          <p className="reference-note">Exports contain the private notes you chose to write. Keep the downloaded file somewhere you control; it is never uploaded by this site.</p>
        </>}
      </main>
    </GuideShell>
  );
}

export const Route = createFileRoute('/dashboard')({
  head: () => ({ meta: [{ title: 'My local list | HowToLiveWorse' }, { name: 'description', content: 'A private, browser-only guide list with notes and export controls.' }] }),
  component: DashboardPage,
});
