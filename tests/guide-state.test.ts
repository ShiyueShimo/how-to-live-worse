import assert from 'node:assert/strict';
import { test } from 'node:test';

import entries from '../src/content/guide/entries.json';
import type { GuideRecord } from '../src/content/guide/types';
import {
  clearGuideState,
  defaultGuideState,
  readGuideState,
  writeGuideState,
  type StorageLike,
} from '../src/lib/guide-state';

const records = entries as GuideRecord[];
const knownIds = new Set(records.map((record) => record.id));

function memoryStorage(
  seed?: string
): StorageLike & { values: Map<string, string> } {
  const values = new Map<string, string>();
  if (seed !== undefined) values.set('how-to-live-worse:guide-state:v1', seed);
  return {
    values,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value);
    },
    removeItem: (key) => {
      values.delete(key);
    },
  };
}

test('round-trips validated personal state against the pinned guide IDs', () => {
  const storage = memoryStorage();
  const state = {
    ...defaultGuideState(),
    statuses: { '01-001': 'habit' as const },
    favorites: ['04-003'],
    notes: { '04-003': 'Private note' },
    dailyCompletions: { '2026-01-01': 'daily-01' },
  };
  writeGuideState(storage, state, knownIds);
  assert.deepEqual(readGuideState(storage, knownIds), {
    status: 'valid',
    state,
  });
});

test('rejects unknown guide IDs before writing personal state', () => {
  const storage = memoryStorage();
  assert.throws(
    () =>
      writeGuideState(
        storage,
        { ...defaultGuideState(), favorites: ['99-999'] },
        knownIds
      ),
    /99-999/
  );
  assert.equal(storage.getItem('how-to-live-worse:guide-state:v1'), null);
});

test('rejects a daily completion that does not reference a known prompt', () => {
  const storage = memoryStorage();
  const state = {
    ...defaultGuideState(),
    dailyCompletions: { '2026-01-01': '01-001' },
  };
  assert.throws(
    () => writeGuideState(storage, state, knownIds),
    /unknown prompt ID 01-001/
  );
});

test('reports corrupt storage without replacing the raw value', () => {
  const rawValue = '{broken';
  const storage = memoryStorage(rawValue);
  assert.deepEqual(readGuideState(storage, knownIds), {
    status: 'corrupt',
    rawValue,
    issue: 'Stored guide state is not valid JSON.',
  });
  assert.equal(storage.getItem('how-to-live-worse:guide-state:v1'), rawValue);
});

test('clears only this guide state key', () => {
  const storage = memoryStorage();
  storage.setItem('unrelated', 'keep');
  writeGuideState(storage, defaultGuideState(), knownIds);
  clearGuideState(storage);
  assert.equal(storage.getItem('how-to-live-worse:guide-state:v1'), null);
  assert.equal(storage.getItem('unrelated'), 'keep');
});
