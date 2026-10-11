import type { GuideSearchRecord } from '@/content/guide/types';
import type { DailyPrompt } from '@/content/play/daily-prompts';
import type { QuizQuestion, QuizTheme } from '@/content/play/quiz-questions';

type Seed = number | string;

function seedValue(seed: Seed): number {
  if (typeof seed === 'number') return seed >>> 0;
  let hash = 2166136261;
  for (const character of seed)
    hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return hash >>> 0;
}

function seededShuffle<T>(items: readonly T[], seed: Seed): T[] {
  const shuffled = [...items];
  let state = seedValue(seed);
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    state += 0x6d2b79f5;
    let random = state;
    random = Math.imul(random ^ (random >>> 15), random | 1);
    random ^= random + Math.imul(random ^ (random >>> 7), random | 61);
    const unit = ((random ^ (random >>> 14)) >>> 0) / 4294967296;
    const swapIndex = Math.floor(unit * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }
  return shuffled;
}

const quizThemes: QuizTheme[] = [
  'Attention',
  'Course shopping',
  'Relationships',
  'Learning',
  'Leisure',
];

export function createQuizRound(
  questions: readonly QuizQuestion[],
  seed: Seed
): QuizQuestion[] {
  const round = quizThemes.flatMap((theme, index) => {
    const themeQuestions = questions.filter(
      (question) => question.theme === theme
    );
    if (themeQuestions.length < 12)
      throw new Error(
        `Quiz theme ${theme} has ${themeQuestions.length} questions; 12 are required.`
      );
    return seededShuffle(themeQuestions, `${String(seed)}:${theme}`).slice(
      0,
      4
    );
  });
  return seededShuffle(round, `${String(seed)}:round`).map((question) => {
    const answerOrder = seededShuffle(
      [0, 1, 2, 3],
      `${String(seed)}:${question.id}:options`
    );
    return {
      ...question,
      options: answerOrder.map(
        (index) => question.options[index]
      ) as QuizQuestion['options'],
      answerIndex: answerOrder.indexOf(question.answerIndex),
    };
  });
}

export function createTopFifty(
  records: readonly GuideSearchRecord[],
  seed: Seed
): GuideSearchRecord[] {
  const safeRecords = records.filter((record) => record.riskClass === 'low');
  if (safeRecords.length < 50)
    throw new Error(
      `Top 50 needs at least 50 low-risk entries; found ${safeRecords.length}.`
    );
  return seededShuffle(safeRecords, seed).slice(0, 50);
}

export function createBingoBoard(
  prompts: readonly DailyPrompt[],
  seed: Seed
): DailyPrompt[] {
  const uniquePrompts = [
    ...new Map(prompts.map((prompt) => [prompt.id, prompt])).values(),
  ];
  if (uniquePrompts.length < 9)
    throw new Error(
      `Bingo needs at least nine unique prompts; found ${uniquePrompts.length}.`
    );
  return seededShuffle(uniquePrompts, seed).slice(0, 9);
}

export function parseBingoShareBoard(
  rawPromptIds: string | null,
  rawCompletedIds: string | null,
  prompts: readonly DailyPrompt[]
): { prompts: DailyPrompt[]; completedIds: string[] } | undefined {
  if (!rawPromptIds) return undefined;
  const promptIds = rawPromptIds.split(',');
  if (promptIds.length !== 9 || new Set(promptIds).size !== 9) return undefined;

  const promptsById = new Map(prompts.map((prompt) => [prompt.id, prompt]));
  const boardPrompts = promptIds.map((id) => promptsById.get(id));
  if (boardPrompts.some((prompt) => prompt === undefined)) return undefined;

  const completedIds = rawCompletedIds ? rawCompletedIds.split(',') : [];
  if (
    new Set(completedIds).size !== completedIds.length ||
    completedIds.some((id) => !promptIds.includes(id))
  )
    return undefined;
  return { prompts: boardPrompts as DailyPrompt[], completedIds };
}

export function rerollBingoCell(
  board: readonly DailyPrompt[],
  prompts: readonly DailyPrompt[],
  cellIndex: number,
  seed: Seed
): DailyPrompt[] {
  if (
    !Number.isInteger(cellIndex) ||
    cellIndex < 0 ||
    cellIndex >= board.length
  )
    throw new Error(`Bingo cell index ${cellIndex} is out of range.`);
  const currentIds = new Set(board.map((prompt) => prompt.id));
  const replacements = prompts.filter((prompt) => !currentIds.has(prompt.id));
  if (!replacements.length)
    throw new Error('No unused bingo prompts remain for this board.');
  const [replacement] = seededShuffle(replacements, seed);
  return board.map((prompt, index) =>
    index === cellIndex ? replacement : prompt
  );
}

export function checkupRecommendations(
  records: readonly GuideSearchRecord[],
  chapterIds: readonly string[],
  seed: Seed
): GuideSearchRecord[] {
  const safeRecords = records.filter((record) => record.riskClass === 'low');
  const matched = safeRecords.filter((record) =>
    chapterIds.includes(record.chapterId)
  );
  const candidates =
    matched.length >= 10
      ? matched
      : [
          ...matched,
          ...safeRecords.filter(
            (record) => !chapterIds.includes(record.chapterId)
          ),
        ];
  return seededShuffle(candidates, seed).slice(0, 10);
}

export function localDateKey(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export type QuizSharePayload = {
  score: number;
  themeCounts: Record<string, number>;
  sourceIds: string[];
};

export function safeSharePayload(value: {
  score: number;
  themeCounts: Record<string, number>;
  sourceIds: string[];
  notes?: unknown;
  answers?: unknown;
}): QuizSharePayload {
  return {
    score: Math.min(100, Math.max(0, Math.round(value.score))),
    themeCounts: Object.fromEntries(
      Object.entries(value.themeCounts)
        .filter(([, count]) => Number.isFinite(count))
        .map(([theme, count]) => [theme, Math.max(0, Math.round(count))])
    ),
    sourceIds: [
      ...new Set(value.sourceIds.filter((id) => /^\d{2}-\d{3}$/.test(id))),
    ],
  };
}

export function toCsv(rows: readonly (readonly string[])[]): string {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const safeCell = /^\s*[=+\-@]/.test(cell) ? `'${cell}` : cell;
          return /[",\r\n]/.test(safeCell)
            ? `"${safeCell.replaceAll('"', '""')}"`
            : safeCell;
        })
        .join(',')
    )
    .join('\n');
}
