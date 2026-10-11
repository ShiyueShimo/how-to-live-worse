import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createZipArchive, readZipArchive } from '../scripts/zip';
import chapters from '../src/content/guide/chapters.json';
import entries from '../src/content/guide/entries.json';
import {
  createAnkiTsv,
  createGuideHtml,
  createGuideJson,
  createGuideMarkdown,
} from '../src/content/guide/exports';
import manifest from '../src/content/guide/source/manifest.json';
import type {
  GuideChapter,
  GuideRecord,
  SourceManifest,
} from '../src/content/guide/types';

const allEntries = entries as GuideRecord[];
const allChapters = chapters as GuideChapter[];
const sourceManifest = manifest as SourceManifest;

test('offline editions retain the complete source count, attribution and reversible entries', () => {
  const markdown = createGuideMarkdown(sourceManifest, allChapters, allEntries);
  const html = createGuideHtml(sourceManifest, allChapters, allEntries);
  const tsv = createAnkiTsv(sourceManifest, allEntries);
  const json = JSON.parse(
    createGuideJson(sourceManifest, allChapters, allEntries)
  ) as {
    manifest: SourceManifest;
    chapters: GuideChapter[];
    entries: GuideRecord[];
  };

  assert.match(markdown, new RegExp(sourceManifest.commitSha));
  assert.ok(sourceManifest.translation);
  assert.ok(markdown.includes(sourceManifest.translation.commitSha));
  assert.ok(html.includes(sourceManifest.translation.commitSha));
  assert.ok(tsv.includes(sourceManifest.translation.commitSha));
  assert.match(markdown, /675 source entries/);
  assert.match(markdown, /## 34\./);
  assert.match(markdown, /Possible trade-off/);
  const exportedIds = new Set(
    [...markdown.matchAll(/^### (\d{2}-\d{3}) —/gm)].map((match) => match[1])
  );
  assert.deepEqual(
    exportedIds,
    new Set(allEntries.map((entry) => entry.id)),
    'The offline Markdown must include all 675 stable entry IDs.'
  );
  assert.equal(json.manifest.commitSha, sourceManifest.commitSha);
  assert.equal(
    json.manifest.translation?.commitSha,
    sourceManifest.translation?.commitSha
  );
  assert.equal(json.chapters.length, sourceManifest.chapterCount);
  assert.equal(json.entries.length, sourceManifest.entryCount);
  assert.match(html, /HowToLiveWorse/);
  assert.match(html, /03-001/);
  const citedUrl = allEntries
    .flatMap((entry) => entry.sources.map((source) => source.url))
    .find((url) => url?.startsWith('https://'));
  assert.ok(
    citedUrl && html.includes(citedUrl.replaceAll('&', '&amp;')),
    'Offline HTML should retain clickable source citations.'
  );
  assert.equal(tsv.trimEnd().split('\n').length, allEntries.length);
  assert.ok(
    tsv.includes(
      `Attribution: eternity4719/HowToLiveBetter, CC BY 4.0, commit ${sourceManifest.commitSha}`
    )
  );
  const malformedRows = tsv
    .trimEnd()
    .split('\n')
    .map((line, index) => ({ index, count: line.split('\t').length }))
    .filter((row) => row.count !== 2);
  assert.deepEqual(
    malformedRows,
    [],
    'Anki import must have exactly two tab-separated fields per row.'
  );
});

test('offline HTML escapes source text as text, not markup', () => {
  const unsafe = [
    { ...allEntries[0], englishText: '<script>alert("x")</script>' },
  ];
  const html = createGuideHtml(sourceManifest, [allChapters[0]], unsafe);
  assert.doesNotMatch(html, /<script>alert/);
  assert.match(html, /&lt;script&gt;alert/);
});

test('offline document archives can be reopened and retain Unicode source text', () => {
  const archive = createZipArchive([
    { name: 'edition/原文.txt', contents: '生活指南 · source' },
    { name: 'mimetype', contents: 'application/epub+zip', store: true },
  ]);
  const files = readZipArchive(archive);
  assert.equal(files.get('edition/原文.txt')?.toString(), '生活指南 · source');
  assert.equal(files.get('mimetype')?.toString(), 'application/epub+zip');
});
