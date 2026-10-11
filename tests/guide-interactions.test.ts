import assert from 'node:assert/strict';
import { test } from 'node:test';

import catalogJson from '../src/content/guide/catalog.json';
import entries from '../src/content/guide/entries.json';
import type {
  GuideRecord,
  GuideSearchRecord,
} from '../src/content/guide/types';
import { dailyPrompts } from '../src/content/play/daily-prompts';
import { quizQuestions } from '../src/content/play/quiz-questions';
import {
  createBingoBoard,
  createQuizRound,
  createTopFifty,
  localDateKey,
  parseBingoShareBoard,
  rerollBingoCell,
  safeSharePayload,
  toCsv,
} from '../src/lib/guide-interactions';

const guideRecords = entries as GuideRecord[];
const knownIds = new Set(guideRecords.map((record) => record.id));
const safeIds = new Set(
  guideRecords
    .filter((record) => record.riskClass === 'low')
    .map((record) => record.id)
);
const catalogRecords = catalogJson as GuideSearchRecord[];

test('quiz rounds draw four distinct safe questions from each of five themes', () => {
  const round = createQuizRound(quizQuestions, 20261009);
  assert.equal(round.length, 20);
  const themes = new Map<string, number>();
  for (const question of round) {
    themes.set(question.theme, (themes.get(question.theme) ?? 0) + 1);
    assert.ok(
      safeIds.has(question.guideId),
      `${question.id} includes a non-low-risk source`
    );
    assert.equal(
      new Set(question.options).size,
      4,
      `${question.id} has duplicate options`
    );
    const original = quizQuestions.find((item) => item.id === question.id);
    assert.ok(original);
    assert.equal(
      question.options[question.answerIndex],
      original.options[original.answerIndex],
      `${question.id} must keep its answer correct after shuffling`
    );
  }
  assert.deepEqual([...themes.values()].sort(), [4, 4, 4, 4, 4]);
  assert.equal(new Set(round.map((question) => question.id)).size, 20);
});

test('top-fifty is a seeded unique sample of the entire low-risk corpus', () => {
  const first = createTopFifty(catalogRecords, 'morning-coffee');
  const second = createTopFifty(catalogRecords, 'rainy-day');
  assert.equal(first.length, 50);
  assert.equal(new Set(first.map((record) => record.id)).size, 50);
  assert.ok(
    first.every((record) => safeIds.has(record.id) && knownIds.has(record.id))
  );
  assert.notDeepEqual(
    first.map((record) => record.id),
    second.map((record) => record.id)
  );
});

test('bingo boards contain nine distinct safe, source-linked prompts', () => {
  const board = createBingoBoard(dailyPrompts, 'first-board');
  assert.equal(board.length, 9);
  assert.equal(new Set(board.map((prompt) => prompt.id)).size, 9);
  assert.ok(board.every((prompt) => safeIds.has(prompt.guideId)));
  assert.ok(
    dailyPrompts.every((prompt) => safeIds.has(prompt.guideId)),
    'All prompts must be safe, not only the sampled cells.'
  );
  const rerolled = rerollBingoCell(board, dailyPrompts, 4, 'replacement');
  assert.equal(rerolled.length, 9);
  assert.equal(new Set(rerolled.map((prompt) => prompt.id)).size, 9);
  assert.equal(rerolled[4].id === board[4].id, false);
  assert.deepEqual(
    rerolled.filter((_, index) => index !== 4),
    board.filter((_, index) => index !== 4)
  );
});

test('shared bingo boards accept only nine known unique prompts and valid checked cells', () => {
  const board = createBingoBoard(dailyPrompts, 'shared-board');
  const parsed = parseBingoShareBoard(
    board.map((prompt) => prompt.id).join(','),
    `${board[1].id},${board[4].id}`,
    dailyPrompts
  );
  assert.deepEqual(parsed, {
    prompts: board,
    completedIds: [board[1].id, board[4].id],
  });
  assert.equal(
    parseBingoShareBoard('daily-01,daily-01', '', dailyPrompts),
    undefined
  );
  assert.equal(
    parseBingoShareBoard('daily-01,unknown', '', dailyPrompts),
    undefined
  );
  assert.equal(
    parseBingoShareBoard(
      board.map((prompt) => prompt.id).join(','),
      'daily-30',
      dailyPrompts
    ),
    undefined
  );
});

test('local date keys use the visitor’s calendar date', () => {
  assert.equal(localDateKey(new Date(2026, 0, 1, 0, 5)), '2026-01-01');
});

test('share payload uses a strict allowlist and CSV quotes private-note punctuation', () => {
  const payload = safeSharePayload({
    score: 75,
    themeCounts: { Time: 3 },
    sourceIds: ['04-001'],
    notes: ['keep private'],
    answers: ['A'],
  });
  assert.deepEqual(payload, {
    score: 75,
    themeCounts: { Time: 3 },
    sourceIds: ['04-001'],
  });
  assert.equal(
    toCsv([
      ['id', 'note'],
      ['01-001', 'line 1, "private"\nline 2'],
    ]),
    'id,note\n01-001,"line 1, ""private""\nline 2"'
  );
  assert.equal(
    toCsv([['note'], ['=1+1'], ['  @SUM(A1:A2)']]),
    "note\n'=1+1\n'  @SUM(A1:A2)"
  );
});
