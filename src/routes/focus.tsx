import { useEffect, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';

import { GuideInfoPage, InfoSection } from '@/components/guide-info-page';

function FocusPage() {
  const [minutes, setMinutes] = useState(15);
  const [secondsLeft, setSecondsLeft] = useState(15 * 60);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    const interval = window.setInterval(
      () => setSecondsLeft((current) => Math.max(0, current - 1)),
      1000
    );
    return () => window.clearInterval(interval);
  }, [running]);
  useEffect(() => {
    if (secondsLeft === 0) setRunning(false);
  }, [secondsLeft]);

  const time = `${String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:${String(secondsLeft % 60).padStart(2, '0')}`;

  function changeMinutes(value: number) {
    const nextMinutes = Math.min(60, Math.max(1, value || 1));
    setMinutes(nextMinutes);
    setSecondsLeft(nextMinutes * 60);
  }

  function toggleTimer() {
    if (secondsLeft === 0) setSecondsLeft(minutes * 60);
    setRunning((current) => !current);
  }

  function resetTimer() {
    setRunning(false);
    setSecondsLeft(minutes * 60);
  }

  return (
    <GuideInfoPage
      eyebrow="OPTIONAL · LOCAL · NO STREAK"
      title="A timer with a very clear off switch."
      intro="Use a short focus block if it helps. Pause, reset, leave or ignore it; the timer does not record what you did or report a result."
    >
      <InfoSection title="Choose a length, then decide">
        <div className="tool-card focus-timer">
          <label className="filter-field">
            <span>Minutes, from 1 to 60</span>
            <input
              type="number"
              min="1"
              max="60"
              value={minutes}
              disabled={running}
              onChange={(event) =>
                changeMinutes(Number(event.currentTarget.value))
              }
            />
          </label>
          <div
            className="timer-display"
            role="timer"
            aria-label={`${Math.floor(secondsLeft / 60)} minutes ${secondsLeft % 60} seconds remaining`}
          >
            {time}
          </div>
          <div className="home-actions">
            <button
              className="button button-dark"
              type="button"
              onClick={toggleTimer}
            >
              {running ? 'Pause' : secondsLeft === 0 ? 'Start again' : 'Start'}
            </button>
            <button
              className="button button-outline"
              type="button"
              onClick={resetTimer}
            >
              Reset
            </button>
            <button
              className="plain-button"
              type="button"
              onClick={() => setRunning(false)}
            >
              Stop
            </button>
          </div>
          <p aria-live="polite">
            {secondsLeft === 0
              ? 'Time is up. You can stop here; no streak was created.'
              : running
                ? 'The timer is running in this browser tab.'
                : 'Not running. Nothing has been saved.'}
          </p>
        </div>
      </InfoSection>
    </GuideInfoPage>
  );
}

export const Route = createFileRoute('/focus')({
  head: () => ({
    meta: [
      { title: 'Optional focus timer | HowToLiveWorse' },
      {
        name: 'description',
        content:
          'A dismissible local focus timer with no account, tracking or streaks.',
      },
    ],
  }),
  component: FocusPage,
});
