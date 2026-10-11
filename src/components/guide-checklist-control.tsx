import { useEffect, useState } from 'react';
import { defaultGuideState } from '@/lib/guide-state';
import { useGuideState } from '@/lib/use-guide-state';

const statusOptions = [
  { id: 'habit', label: 'I do this' },
  { id: 'later', label: 'Later' },
  { id: 'undoing', label: 'Undoing it' },
] as const;

export function GuideChecklistControl({ guideId }: { guideId: string }) {
  const { result, hydrated, updateGuideState, removeGuideState } = useGuideState();
  const state = result.status === 'corrupt' ? defaultGuideState() : result.state;
  const savedNote = state.notes[guideId] ?? '';
  const [note, setNote] = useState(savedNote);
  const isCorrupt = result.status === 'corrupt';
  const status = state.statuses[guideId];
  const isFavorite = state.favorites.includes(guideId);

  useEffect(() => setNote(savedNote), [savedNote]);

  function setStatus(nextStatus: (typeof statusOptions)[number]['id']) {
    updateGuideState((state) => {
      const statuses = { ...state.statuses };
      if (statuses[guideId] === nextStatus) delete statuses[guideId];
      else statuses[guideId] = nextStatus;
      return { ...state, statuses };
    });
  }

  function toggleFavorite() {
    updateGuideState((state) => ({
      ...state,
      favorites: isFavorite ? state.favorites.filter((id) => id !== guideId) : [...state.favorites, guideId],
    }));
  }

  function saveNote() {
    updateGuideState((state) => {
      const notes = { ...state.notes };
      if (note.trim()) notes[guideId] = note.trim();
      else delete notes[guideId];
      return { ...state, notes };
    });
  }

  return (
    <section className="checklist-control" aria-labelledby={`checklist-${guideId}`}>
      <div className="checklist-heading"><div><p className="site-overline">YOUR PRIVATE LIST</p><h2 id={`checklist-${guideId}`}>Choose what to do with this idea</h2></div>
        <button className="plain-button" type="button" aria-pressed={isFavorite} disabled={isCorrupt || !hydrated} onClick={toggleFavorite}>{isFavorite ? '★ Saved' : '☆ Save'}</button>
      </div>
      {isCorrupt ? <LocalStateRecovery rawValue={result.rawValue} issue={result.issue} onClear={removeGuideState} /> : <>
        <div className="checklist-status" role="group" aria-label="Private progress status">
          {statusOptions.map((option) => <button className={status === option.id ? 'status-option is-selected' : 'status-option'} key={option.id} type="button" aria-pressed={status === option.id} disabled={!hydrated} onClick={() => setStatus(option.id)}>{option.label}</button>)}
        </div>
        <label className="private-note-field"><span>Private note <small>saved only in this browser</small></span>
          <textarea maxLength={4000} value={note} onChange={(event) => setNote(event.currentTarget.value)} placeholder="Optional note for yourself" />
        </label>
        <button className="plain-button" type="button" onClick={saveNote} disabled={!hydrated || note === savedNote}>Save note</button>
      </>}
    </section>
  );
}

export function LocalStateRecovery({ rawValue, issue, onClear }: { rawValue: string; issue: string; onClear: () => void }) {
  return (
    <div className="local-state-warning" role="alert">
      <strong>Your saved guide data needs attention.</strong>
      <p>{issue} It has not been changed. Copy the original text below if you want to keep a backup, or clear this site’s saved state to start again.</p>
      <textarea aria-label="Unchanged local data backup" readOnly value={rawValue} />
      <button className="plain-button" type="button" onClick={onClear}>Clear saved guide data</button>
    </div>
  );
}
