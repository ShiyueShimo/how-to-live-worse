import { dailyPrompts } from '@/content/play/daily-prompts';

export type GuideStatus = 'habit' | 'later' | 'undoing';

export type GuideUserState = {
  version: 1;
  statuses: Record<string, GuideStatus>;
  favorites: string[];
  notes: Record<string, string>;
  dailyCompletions: Record<string, string>;
  bingoBoards: Record<string, { promptIds: string[]; completedIds: string[] }>;
};

export type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

export type GuideStateResult =
  | { status: 'valid' | 'missing'; state: GuideUserState }
  | { status: 'corrupt'; rawValue: string; issue: string };

export const guideStateKey = 'how-to-live-worse:guide-state:v1';
const knownDailyPromptIds = new Set(dailyPrompts.map((prompt) => prompt.id));

export function defaultGuideState(): GuideUserState {
  return {
    version: 1,
    statuses: {},
    favorites: [],
    notes: {},
    dailyCompletions: {},
    bingoBoards: {},
  };
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every((item) => typeof item === 'string')
  );
}

function validateGuideState(
  value: unknown,
  knownIds: ReadonlySet<string>
): { state?: GuideUserState; issue?: string } {
  if (typeof value !== 'object' || value === null || Array.isArray(value))
    return { issue: 'Stored guide state must be an object.' };
  const candidate = value as Record<string, unknown>;
  if (candidate.version !== 1)
    return {
      issue: `Unsupported guide-state version ${String(candidate.version)}.`,
    };

  const statuses = candidate.statuses;
  if (!isStringRecord(statuses))
    return { issue: 'Stored statuses must be a string record.' };
  for (const [id, status] of Object.entries(statuses)) {
    if (!knownIds.has(id))
      return { issue: `Stored status references unknown guide ID ${id}.` };
    if (status !== 'habit' && status !== 'later' && status !== 'undoing')
      return { issue: `Stored status for ${id} is invalid.` };
  }

  const favorites = candidate.favorites;
  if (
    !Array.isArray(favorites) ||
    !favorites.every((id) => typeof id === 'string')
  )
    return { issue: 'Stored favorites must be a list of guide IDs.' };
  for (const id of favorites)
    if (!knownIds.has(id))
      return { issue: `Stored favorite references unknown guide ID ${id}.` };
  if (new Set(favorites).size !== favorites.length)
    return { issue: 'Stored favorites contain duplicates.' };

  const notes = candidate.notes;
  if (!isStringRecord(notes))
    return { issue: 'Stored notes must be a string record.' };
  for (const [id, note] of Object.entries(notes)) {
    if (!knownIds.has(id))
      return { issue: `Stored note references unknown guide ID ${id}.` };
    if (note.length > 4000)
      return { issue: `Stored note for ${id} exceeds 4000 characters.` };
  }

  const dailyCompletions = candidate.dailyCompletions;
  if (!isStringRecord(dailyCompletions))
    return {
      issue: 'Stored daily completions must be a date-to-prompt-ID record.',
    };
  for (const [date, id] of Object.entries(dailyCompletions)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
      return { issue: `Stored daily completion has invalid date ${date}.` };
    if (!knownDailyPromptIds.has(id))
      return {
        issue: `Stored daily completion references unknown prompt ID ${id}.`,
      };
  }

  const bingoBoards = candidate.bingoBoards;
  if (
    typeof bingoBoards !== 'object' ||
    bingoBoards === null ||
    Array.isArray(bingoBoards)
  )
    return { issue: 'Stored bingo boards must be an object.' };
  for (const [boardId, board] of Object.entries(bingoBoards)) {
    if (typeof board !== 'object' || board === null || Array.isArray(board))
      return { issue: `Stored bingo board ${boardId} is invalid.` };
    const promptIds = (board as Record<string, unknown>).promptIds;
    const completedIds = (board as Record<string, unknown>).completedIds;
    if (
      !Array.isArray(promptIds) ||
      !promptIds.every((id) => typeof id === 'string')
    )
      return { issue: `Stored bingo prompts for ${boardId} are invalid.` };
    if (promptIds.length !== 9)
      return {
        issue: `Stored bingo board ${boardId} must contain nine prompts.`,
      };
    for (const id of promptIds)
      if (!knownDailyPromptIds.has(id))
        return {
          issue: `Stored bingo board ${boardId} references unknown prompt ${id}.`,
        };
    if (
      !Array.isArray(completedIds) ||
      !completedIds.every(
        (id) => typeof id === 'string' && promptIds.includes(id)
      )
    )
      return { issue: `Stored bingo completions for ${boardId} are invalid.` };
    if (
      new Set(promptIds).size !== promptIds.length ||
      new Set(completedIds).size !== completedIds.length
    )
      return { issue: `Stored bingo board ${boardId} contains duplicates.` };
  }

  return {
    state: {
      version: 1,
      statuses: statuses as Record<string, GuideStatus>,
      favorites: [...favorites] as string[],
      notes: { ...notes },
      dailyCompletions: { ...dailyCompletions },
      bingoBoards: Object.fromEntries(
        Object.entries(bingoBoards).map(([id, board]) => {
          const value = board as {
            promptIds: string[];
            completedIds: string[];
          };
          return [
            id,
            {
              promptIds: [...value.promptIds],
              completedIds: [...value.completedIds],
            },
          ];
        })
      ),
    },
  };
}

export function readGuideState(
  storage: StorageLike,
  knownIds: ReadonlySet<string>
): GuideStateResult {
  const rawValue = storage.getItem(guideStateKey);
  if (rawValue === null)
    return { status: 'missing', state: defaultGuideState() };

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawValue);
  } catch {
    return {
      status: 'corrupt',
      rawValue,
      issue: 'Stored guide state is not valid JSON.',
    };
  }

  const validation = validateGuideState(parsed, knownIds);
  return validation.state
    ? { status: 'valid', state: validation.state }
    : {
        status: 'corrupt',
        rawValue,
        issue: validation.issue ?? 'Stored guide state is invalid.',
      };
}

export function writeGuideState(
  storage: StorageLike,
  state: GuideUserState,
  knownIds: ReadonlySet<string>
): void {
  const validation = validateGuideState(state, knownIds);
  if (!validation.state)
    throw new Error(`Cannot save guide state: ${validation.issue}`);
  storage.setItem(guideStateKey, JSON.stringify(validation.state));
}

export function clearGuideState(storage: StorageLike): void {
  storage.removeItem(guideStateKey);
}

export function exportGuideState(state: GuideUserState): string {
  return JSON.stringify(state, null, 2);
}
