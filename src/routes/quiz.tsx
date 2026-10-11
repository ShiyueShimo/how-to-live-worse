import { useEffect, useMemo, useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';

import {
  createQuizRound,
  safeSharePayload,
  type QuizSharePayload,
} from '@/lib/guide-interactions';
import { GuideShell } from '@/components/guide-shell';
import { quizQuestions } from '@/content/play/quiz-questions';

function QuizPage() {
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [roundSeed, setRoundSeed] = useState('first-round');
  const round = useMemo(
    () => createQuizRound(quizQuestions, roundSeed),
    [roundSeed]
  );
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | undefined)[]>(
    Array(20).fill(undefined)
  );
  const [sharedResult, setSharedResult] = useState<QuizSharePayload>();
  const [shareCopied, setShareCopied] = useState(false);
  const [shareFallback, setShareFallback] = useState('');
  useEffect(() => {
    const rawResult = new URLSearchParams(window.location.search).get('result');
    if (!rawResult) return;
    const params = new URLSearchParams(rawResult);
    const scoreValue = Number(params.get('score'));
    const themeCounts = Object.fromEntries(
      (params.get('themes') ?? '')
        .split(',')
        .filter(Boolean)
        .map((pair) => {
          const [theme, count] = pair.split(':');
          return [theme, Number(count)];
        })
    );
    const sourceIds = (params.get('sources') ?? '').split(',').filter(Boolean);
    if (Number.isFinite(scoreValue) && Object.keys(themeCounts).length === 5) {
      setSharedResult(
        safeSharePayload({ score: scoreValue, themeCounts, sourceIds })
      );
    }
  }, []);
  const score = answers.reduce<number>(
    (total, answer, index) =>
      total + (answer === round[index]?.answerIndex ? 1 : 0),
    0
  );
  const themeCounts = useMemo(
    () =>
      Object.fromEntries(
        [...new Set(round.map((question) => question.theme))].map((theme) => [
          theme,
          round.reduce(
            (count, question, index) =>
              count +
              (question.theme === theme &&
              answers[index] === question.answerIndex
                ? 1
                : 0),
            0
          ),
        ])
      ),
    [answers, round]
  );

  function startNewRound() {
    setRoundSeed(String(Date.now()));
    setQuestionIndex(0);
    setAnswers(Array(20).fill(undefined));
    setFinished(false);
    setStarted(true);
  }

  function shareLink() {
    const payload = safeSharePayload({
      score: score * 5,
      themeCounts,
      sourceIds: [...new Set(round.map((question) => question.guideId))],
    });
    const params = new URLSearchParams({
      score: String(payload.score),
      themes: Object.entries(payload.themeCounts)
        .map(([theme, count]) => `${theme}:${count}`)
        .join(','),
      sources: payload.sourceIds.slice(0, 5).join(','),
    });
    return `${window.location.origin}/quiz?result=${encodeURIComponent(params.toString())}`;
  }

  async function copyShareLink() {
    const url = shareLink();
    setShareFallback(url);
    try {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
    } catch {
      setShareCopied(false);
    }
  }

  if (sharedResult && !started)
    return (
      <GuideShell active="play">
        <main className="article-page site-container">
          <p className="site-overline">
            SHARED ROUND SUMMARY · NO ANSWERS INCLUDED
          </p>
          <h1>{sharedResult.score} / 100</h1>
          <p className="library-intro">
            This is a quiz result, not a score about anyone’s life. Your own
            answers and private list are not part of this page.
          </p>
          <div className="quiz-theme-results">
            {Object.entries(sharedResult.themeCounts).map(([theme, count]) => (
              <div className="quiz-theme-result" key={theme}>
                <strong>{theme}</strong>
                <span>{count} / 4 spotted</span>
              </div>
            ))}
          </div>
          <section className="article-sources">
            <h2>Source reading</h2>
            <ul>
              {sharedResult.sourceIds.map((id) => (
                <li key={id}>
                  <Link to="/entry/$entryId" params={{ entryId: id }}>
                    {id} — source facts and limits
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          <button
            className="button button-dark"
            type="button"
            onClick={startNewRound}
          >
            Take your own round
          </button>
        </main>
      </GuideShell>
    );

  if (!started)
    return (
      <GuideShell active="play">
        <main className="article-page site-container">
          <p className="site-overline">
            60 ORIGINAL QUESTIONS · 20 PER ROUND · 5 THEMES
          </p>
          <h1>Can you spot the excuse?</h1>
          <p className="library-intro">
            Every round draws four questions from each of five everyday themes.
            The quiz rewards noticing a low-ROI detour; it does not grade your
            life, health or character.
          </p>
          <div className="article-boundary">
            All questions are linked to low-risk source entries. Choose any
            answer, skip the round, or leave. No account or uploads.
          </div>
          <button
            className="button button-dark"
            type="button"
            onClick={startNewRound}
          >
            Start a fresh round
          </button>
        </main>
      </GuideShell>
    );

  if (finished)
    return (
      <GuideShell active="play">
        <main className="article-page site-container">
          <p className="site-overline">ROUND FINISHED · NOT A LIFE SCORE</p>
          <h1>{score * 5} / 100</h1>
          <p className="library-intro">
            You spotted {score} of {round.length} low-ROI detours in this round.
            The score describes these answers only.
          </p>
          <div className="quiz-theme-results">
            {Object.entries(themeCounts).map(([theme, count]) => (
              <div className="quiz-theme-result" key={theme}>
                <strong>{theme}</strong>
                <span>{count} / 4 spotted</span>
              </div>
            ))}
          </div>
          <div className="home-actions">
            <button
              className="button button-dark"
              type="button"
              onClick={copyShareLink}
            >
              Copy result link
            </button>
            <button
              className="button button-outline"
              type="button"
              onClick={startNewRound}
            >
              Draw another round
            </button>
            <Link className="button button-outline" to="/book">
              Browse the complete book
            </Link>
          </div>
          {shareCopied ? (
            <p className="reference-note" role="status">
              Share link copied.
            </p>
          ) : null}
          {shareFallback && !shareCopied ? (
            <label className="library-search">
              <span>Copy this result-only link</span>
              <input
                readOnly
                value={shareFallback}
                onFocus={(event) => event.currentTarget.select()}
              />
            </label>
          ) : null}
          <section className="article-sources">
            <h2>Read what the questions point to</h2>
            <ul>
              {[...new Set(round.map((question) => question.guideId))].map(
                (id) => (
                  <li key={id}>
                    <Link to="/entry/$entryId" params={{ entryId: id }}>
                      {id} — original facts and limits
                    </Link>
                  </li>
                )
              )}
            </ul>
          </section>
          <p className="reference-note">
            A shared link contains only a round score, five theme counts and up
            to five source IDs. It never contains your answers or private notes.
          </p>
        </main>
      </GuideShell>
    );

  const question = round[questionIndex];
  return (
    <GuideShell active="play">
      <main className="article-page site-container">
        <p className="site-overline">
          QUESTION {questionIndex + 1} OF {round.length} ·{' '}
          {question.theme.toUpperCase()}
        </p>
        <div
          className="quiz-progress"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={round.length}
          aria-valuenow={questionIndex + 1}
        >
          <span
            style={{ width: `${((questionIndex + 1) / round.length) * 100}%` }}
          />
        </div>
        <h1 className="quiz-question-title">{question.prompt}</h1>
        <fieldset className="quiz-options">
          <legend className="visually-hidden">Choose one answer</legend>
          {question.options.map((option, index) => (
            <label
              className={
                answers[questionIndex] === index
                  ? 'quiz-option is-selected'
                  : 'quiz-option'
              }
              key={`${question.id}-${option}`}
            >
              <input
                type="radio"
                name={question.id}
                checked={answers[questionIndex] === index}
                onChange={() =>
                  setAnswers((current) =>
                    current.map((answer, answerIndex) =>
                      answerIndex === questionIndex ? index : answer
                    )
                  )
                }
              />
              <span>{option}</span>
            </label>
          ))}
        </fieldset>
        <p className="reference-note">
          No trick question: the source link is available after the round. You
          can stop at any point.
        </p>
        <div className="home-actions">
          <button
            className="button button-outline"
            type="button"
            onClick={() => setQuestionIndex((index) => Math.max(0, index - 1))}
            disabled={questionIndex === 0}
          >
            Previous
          </button>
          {questionIndex < round.length - 1 ? (
            <button
              className="button button-dark"
              type="button"
              onClick={() =>
                setQuestionIndex((index) =>
                  Math.min(round.length - 1, index + 1)
                )
              }
              disabled={answers[questionIndex] === undefined}
            >
              Next question
            </button>
          ) : (
            <button
              className="button button-dark"
              type="button"
              onClick={() => setFinished(true)}
              disabled={answers[questionIndex] === undefined}
            >
              See this round’s result
            </button>
          )}
          <button
            className="plain-button"
            type="button"
            onClick={() => setStarted(false)}
          >
            Leave quiz
          </button>
        </div>
      </main>
    </GuideShell>
  );
}

export const Route = createFileRoute('/quiz')({
  head: () => ({
    meta: [
      { title: 'Spot the excuse | HowToLiveWorse' },
      {
        name: 'description',
        content:
          'Take a 20-question round drawn from 60 original low-risk scenarios across five themes.',
      },
    ],
  }),
  component: QuizPage,
});
