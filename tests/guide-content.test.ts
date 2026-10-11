import assert from 'node:assert/strict';
import { test } from 'node:test';
import entriesJson from '../src/content/guide/entries.json';
import { guideChapters, guideManifest } from '../src/content/guide/data';
import { loadGuideChapterRecords, loadGuideRecord, type ChapterLoader } from '../src/content/guide/chapter-loader';
import type { GuideRecord } from '../src/content/guide/types';
import { validateGuideCorpus } from '../src/content/guide/validation';

const guideRecords = entriesJson as GuideRecord[];

const pinnedManifest = {
  repositoryUrl: 'https://github.com/eternity4719/HowToLiveBetter',
  commitSha: 'a994b6a0c90598b0fe15cb837343f438dbf7b95d',
  capturedAt: '2026-10-09',
  chapterCount: 1,
  entryCount: 1,
  contentLicense: {
    name: 'CC BY 4.0',
    url: 'https://creativecommons.org/licenses/by/4.0/',
  },
};

const validEntry = {
  id: '01-001',
  chapterId: '01',
  chapterNumber: 1,
  entryNumber: 1,
  title: 'Example recommendation',
  englishTitle: 'Example recommendation',
  originalText: '原文建议',
  englishText: 'Original recommendation',
  costs: ['time'],
  costSummary: 'A small time cost.',
  benefits: ['time-energy'],
  benefitSummary: 'Saves time.',
  evidenceGrade: 'B',
  applicability: 'Applies to the stated population.',
  authorNotes: '',
  references: [],
  sources: [{ label: 'Primary source', url: 'https://example.org/source' }],
  riskClass: 'low',
  chapterSourceUrl: 'https://github.com/eternity4719/HowToLiveBetter/blob/main/book/chapter.md',
  translationSource: 'maintainer-edition',
};

test('rejects duplicate guide IDs and reports the duplicated key', () => {
  const result = validateGuideCorpus([validEntry, validEntry], {
    ...pinnedManifest,
    entryCount: 2,
  });

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes('01-001') && /duplicate/i.test(error)));
});

test('reports missing source fields with the exact guide ID', () => {
  const result = validateGuideCorpus([{ ...validEntry, title: '' }], pinnedManifest);

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes('01-001') && /title/i.test(error)));
});

test('requires a pinned source manifest whose totals match the parsed corpus', () => {
  const missingCommit = validateGuideCorpus([validEntry], { ...pinnedManifest, commitSha: '' });
  const wrongChapterCount = validateGuideCorpus([validEntry], { ...pinnedManifest, chapterCount: 34 });

  assert.equal(missingCommit.valid, false);
  assert.ok(missingCommit.errors.some((error) => /commit/i.test(error)));
  assert.equal(wrongChapterCount.valid, false);
  assert.ok(wrongChapterCount.errors.some((error) => /chapter/i.test(error)));
});

test('every pinned source entry has exactly one complete English and inverse record', () => {
  assert.equal(guideChapters.length, 34);
  assert.equal(guideRecords.length, guideManifest.entryCount);
  assert.equal(new Set(guideRecords.map((record) => record.id)).size, guideRecords.length);

  for (const record of guideRecords) {
    assert.ok(record.title.length > 0, `${record.id} has no source title`);
    assert.ok(record.englishTitle.length > 0, `${record.id} has no English title`);
    assert.ok(record.englishText.length > 0, `${record.id} has no English reading text`);
    assert.equal(record.inversion.id, record.id, `${record.id} has a mismatched inversion`);
    for (const field of ['headline', 'rationalization', 'immediateReward', 'possibleTradeoff', 'recoveryLink'] as const) {
      assert.ok(record.inversion[field].trim(), `${record.id} has an empty inversion ${field}`);
    }
  }
});

test('sensitive inversions only frame excuses and retain a safe route back to facts', () => {
  const sensitive = guideRecords.filter((record) => record.riskClass !== 'low');

  assert.ok(sensitive.length > 0);
  for (const record of sensitive) {
    assert.match(record.inversion.possibleTradeoff, /not a personal forecast/i, record.id);
    assert.match(record.inversion.recoveryLink, /original facts and limits/i, record.id);
    assert.match(record.inversion.recoveryLink, /qualified local professional or service/i, record.id);
  }
});

test('loads one chapter package on demand and resolves only known entry IDs', async () => {
  const chapterLoaders: Record<string, ChapterLoader> = {
    './chapter-records/01.json': async () => guideRecords.filter((record) => record.chapterId === '01'),
  };
  const firstChapter = await loadGuideChapterRecords('01', chapterLoaders);
  const firstEntry = await loadGuideRecord('01-001', chapterLoaders);

  assert.equal(firstChapter.length, guideChapters.find((chapter) => chapter.id === '01')?.entryIds.length);
  assert.ok(firstChapter.every((record) => record.chapterId === '01'));
  assert.equal(firstEntry?.id, '01-001');
  assert.deepEqual(await loadGuideChapterRecords('99', chapterLoaders), []);
  assert.equal(await loadGuideRecord('99-999', chapterLoaders), undefined);
});
