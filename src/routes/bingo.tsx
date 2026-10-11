import { useEffect, useMemo, useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';

import {
  createBingoBoard,
  localDateKey,
  parseBingoShareBoard,
  rerollBingoCell,
} from '@/lib/guide-interactions';
import { defaultGuideState } from '@/lib/guide-state';
import { useGuideState } from '@/lib/use-guide-state';
import { LocalStateRecovery } from '@/components/guide-checklist-control';
import { GuideShell } from '@/components/guide-shell';
import { dailyPrompts } from '@/content/play/daily-prompts';

function BingoPage() {
  const { result, hydrated, updateGuideState, removeGuideState } =
    useGuideState();
  const [today, setToday] = useState('');
  const [draw, setDraw] = useState(0);
  const [sharedBoard, setSharedBoard] =
    useState<ReturnType<typeof parseBingoShareBoard>>();
  const [shareCopied, setShareCopied] = useState(false);
  const [shareFallback, setShareFallback] = useState('');
  useEffect(() => setToday(localDateKey(new Date())), []);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSharedBoard(
      parseBingoShareBoard(
        params.get('board'),
        params.get('done'),
        dailyPrompts
      )
    );
  }, []);
  const isCorrupt = result.status === 'corrupt';
  const state = isCorrupt ? defaultGuideState() : result.state;
  const savedBoard = today ? state.bingoBoards[today] : undefined;
  const isSharedBoard = sharedBoard !== undefined;
  const board = useMemo(
    () =>
      sharedBoard?.prompts ??
      savedBoard?.promptIds
        .map((id) => dailyPrompts.find((prompt) => prompt.id === id))
        .filter((prompt) => prompt !== undefined) ??
      [],
    [savedBoard, sharedBoard]
  );
  const completedIds = isSharedBoard
    ? sharedBoard.completedIds
    : (savedBoard?.completedIds ?? []);

  useEffect(() => {
    if (!hydrated || !today || isCorrupt || savedBoard || sharedBoard) return;
    const nextBoard = createBingoBoard(dailyPrompts, `${today}-${draw}`);
    updateGuideState((current) => ({
      ...current,
      bingoBoards: {
        ...current.bingoBoards,
        [today]: {
          promptIds: nextBoard.map((prompt) => prompt.id),
          completedIds: [],
        },
      },
    }));
  }, [
    draw,
    hydrated,
    isCorrupt,
    savedBoard,
    sharedBoard,
    today,
    updateGuideState,
  ]);

  function saveCompletions(completedIds: string[]) {
    if (!today) return;
    updateGuideState((current) => ({
      ...current,
      bingoBoards: {
        ...current.bingoBoards,
        [today]: { promptIds: board.map((prompt) => prompt.id), completedIds },
      },
    }));
  }

  function toggleCompletion(promptId: string) {
    const completed = new Set(completedIds);
    if (completed.has(promptId)) completed.delete(promptId);
    else completed.add(promptId);
    saveCompletions([...completed]);
  }

  function swapCell(cellIndex: number) {
    const nextBoard = rerollBingoCell(
      board,
      dailyPrompts,
      cellIndex,
      `${today}-${cellIndex}-${Date.now()}`
    );
    const nextIds = nextBoard.map((prompt) => prompt.id);
    const nextCompletedIds = completedIds.filter((id) => nextIds.includes(id));
    updateGuideState((current) => ({
      ...current,
      bingoBoards: {
        ...current.bingoBoards,
        [today]: { promptIds: nextIds, completedIds: nextCompletedIds },
      },
    }));
  }

  function drawNewBoard() {
    if (!today) return;
    const nextDraw = draw + 1;
    const nextBoard = createBingoBoard(dailyPrompts, `${today}-${nextDraw}`);
    setSharedBoard(undefined);
    setDraw(nextDraw);
    updateGuideState((current) => ({
      ...current,
      bingoBoards: {
        ...current.bingoBoards,
        [today]: {
          promptIds: nextBoard.map((prompt) => prompt.id),
          completedIds: [],
        },
      },
    }));
  }

  async function copyBoardLink() {
    const params = new URLSearchParams({
      board: board.map((prompt) => prompt.id).join(','),
      done: completedIds.join(','),
    });
    const url = `${window.location.origin}/bingo?${params}`;
    setShareFallback(url);
    try {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
    } catch {
      setShareCopied(false);
    }
  }

  return (
    <GuideShell active="play">
      <main className="article-page site-container">
        <p className="site-overline">A 3 × 3 BOARD · SAFE · LOCAL</p>
        <h1>Low-ROI bingo.</h1>
        <p className="library-intro">
          Nine tiny, reversible detours. Mark one if you feel like it, swap any
          square, or leave the board unfinished. Nothing uploads and no streak
          is counted.
        </p>
        {isCorrupt ? (
          <LocalStateRecovery
            rawValue={result.rawValue}
            issue={result.issue}
            onClear={removeGuideState}
          />
        ) : null}
        <div className="bingo-toolbar">
          <span>
            {isSharedBoard
              ? 'Shared board · view only'
              : today
                ? `Today · ${today}`
                : 'Preparing today’s board…'}
          </span>
          <button
            className="button button-outline"
            type="button"
            onClick={drawNewBoard}
            disabled={!hydrated || isCorrupt || !today}
          >
            Draw a new board
          </button>
          {!isSharedBoard ? (
            <button
              className="plain-button"
              type="button"
              onClick={copyBoardLink}
              disabled={!board.length}
            >
              Copy share link
            </button>
          ) : null}
        </div>
        {isSharedBoard ? (
          <p className="reference-note">
            You are viewing someone’s shared board. It is not saved in your
            browser. <Link to="/bingo">Open your own board</Link>.
          </p>
        ) : null}
        <div
          className="bingo-board"
          role="group"
          aria-label="Nine-square low-ROI bingo board"
        >
          {board.map((prompt, index) => {
            const isComplete = completedIds.includes(prompt.id);
            return (
              <article
                className={isComplete ? 'bingo-cell is-complete' : 'bingo-cell'}
                key={prompt.id}
              >
                <p className="site-overline">
                  SQUARE {String(index + 1).padStart(2, '0')}
                </p>
                <p>{prompt.prompt}</p>
                {!isSharedBoard ? (
                  <button
                    className="plain-button"
                    type="button"
                    aria-pressed={isComplete}
                    disabled={!hydrated || isCorrupt}
                    onClick={() => toggleCompletion(prompt.id)}
                  >
                    {isComplete ? '✓ Marked · undo' : 'Mark this square'}
                  </button>
                ) : isComplete ? (
                  <span className="bingo-mark-label">✓ Marked</span>
                ) : null}
                {!isSharedBoard ? (
                  <button
                    className="bingo-swap"
                    type="button"
                    disabled={!hydrated || isCorrupt}
                    onClick={() => swapCell(index)}
                  >
                    Swap this square
                  </button>
                ) : null}
                <Link to="/entry/$entryId" params={{ entryId: prompt.guideId }}>
                  Source {prompt.guideId}
                </Link>
              </article>
            );
          })}
        </div>
        {!isSharedBoard && shareCopied ? (
          <p className="reference-note" role="status">
            Share link copied.
          </p>
        ) : null}
        {!isSharedBoard && shareFallback && !shareCopied ? (
          <label className="library-search">
            <span>Copy this board-only link</span>
            <input
              readOnly
              value={shareFallback}
              onFocus={(event) => event.currentTarget.select()}
            />
          </label>
        ) : null}
        <p className="reference-note">
          Your checked squares stay in this browser only.{' '}
          <Link to="/dashboard">Review or clear local progress</Link>.
        </p>
      </main>
    </GuideShell>
  );
}

export const Route = createFileRoute('/bingo')({
  head: () => ({
    meta: [
      { title: 'Low-ROI bingo | HowToLiveWorse' },
      {
        name: 'description',
        content:
          'A local, safe and reversible 3 by 3 low-ROI bingo board. Swap squares, mark progress or stop anytime.',
      },
    ],
  }),
  component: BingoPage,
});
