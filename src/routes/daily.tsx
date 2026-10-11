import { useEffect, useMemo, useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';

import { localDateKey } from '@/lib/guide-interactions';
import { useGuideState } from '@/lib/use-guide-state';
import { LocalStateRecovery } from '@/components/guide-checklist-control';
import { GuideShell } from '@/components/guide-shell';
import { dailyPrompts } from '@/content/play/daily-prompts';

function DailyPage() {
  const { result, hydrated, updateGuideState, removeGuideState } =
    useGuideState();
  const [today, setToday] = useState('');
  const [draw, setDraw] = useState(0);
  useEffect(() => setToday(localDateKey(new Date())), []);
  const index = useMemo(
    () =>
      today
        ? [...today].reduce(
            (total, character) => total + character.charCodeAt(0),
            draw * 17
          ) % dailyPrompts.length
        : 0,
    [draw, today]
  );
  const prompt = dailyPrompts[index];
  const isCorrupt = result.status === 'corrupt';
  const completed =
    today && !isCorrupt && result.state.dailyCompletions[today] === prompt.id;

  function completePrompt() {
    if (!today) return;
    updateGuideState((state) => ({
      ...state,
      dailyCompletions: { ...state.dailyCompletions, [today]: prompt.id },
    }));
  }

  function undoPrompt() {
    if (!today) return;
    updateGuideState((state) => {
      const dailyCompletions = { ...state.dailyCompletions };
      delete dailyCompletions[today];
      return { ...state, dailyCompletions };
    });
  }

  return (
    <GuideShell active="play">
      <main className="article-page site-container">
        <p className="site-overline">
          30 SAFE PROMPTS · LOCAL DATE · EASY TO SKIP
        </p>
        <h1>Today’s tiny low-ROI detour.</h1>
        <p className="library-intro">
          A small absurdity you can ignore, change or undo. It is not a streak
          challenge and does not ask you to spend money or take a risk.
        </p>
        {isCorrupt ? (
          <LocalStateRecovery
            rawValue={result.rawValue}
            issue={result.issue}
            onClear={removeGuideState}
          />
        ) : null}
        <article className="daily-prompt-card">
          <p className="site-overline">
            {today || 'YOUR LOCAL DAY'} · {prompt.id.toUpperCase()}
          </p>
          <h2>{prompt.prompt}</h2>
          <p>{prompt.exitHatch}</p>
          <Link
            className="text-link"
            to="/entry/$entryId"
            params={{ entryId: prompt.guideId }}
          >
            The source entry: {prompt.guideId} →
          </Link>
          <div className="home-actions">
            <button
              className="button button-outline"
              type="button"
              onClick={() => setDraw((current) => current + 1)}
            >
              Swap this card
            </button>
            <button
              className="button button-dark"
              type="button"
              onClick={completed ? undoPrompt : completePrompt}
              disabled={!hydrated || isCorrupt || !today}
            >
              {completed ? 'Undo today’s mark' : 'Mark this silly detour done'}
            </button>
          </div>
          {completed ? (
            <p className="reference-note" aria-live="polite">
              Marked locally for {today}. You can undo it above; there is no
              streak or public score.
            </p>
          ) : null}
        </article>
        <p className="reference-note">
          Completion history stays in this browser.{' '}
          <Link to="/dashboard">Review or export your local list</Link>.
        </p>
      </main>
    </GuideShell>
  );
}

export const Route = createFileRoute('/daily')({
  head: () => ({
    meta: [
      { title: 'A tiny daily detour | HowToLiveWorse' },
      {
        name: 'description',
        content:
          'Draw a safe, reversible low-ROI prompt for today. Skip, reroll or undo it.',
      },
    ],
  }),
  component: DailyPage,
});
