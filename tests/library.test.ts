import assert from 'node:assert/strict';
import { test } from 'node:test';
import inventory from '../src/content/reference-site/inventory.json';
import entries from '../src/content/guide/entries.json';
import { articles } from '../src/content/library/articles';
import { glossaryEntries } from '../src/content/library/glossary';
import type { GuideRecord } from '../src/content/guide/types';

const guideIds = new Set((entries as GuideRecord[]).map((entry) => entry.id));

test('every observed reference article has a complete original counterpart', () => {
  assert.equal(articles.length, inventory.articles.length);
  assert.deepEqual(new Set(articles.map((article) => article.slug)), new Set(inventory.articles.map((article) => article.slug)));

  for (const article of articles) {
    assert.ok(article.summary.trim(), `${article.slug} needs a summary`);
    assert.ok(article.sections.length >= 2, `${article.slug} needs original editorial sections`);
    assert.ok(article.mappedGuideIds.length > 0, `${article.slug} needs source-book links`);
    for (const id of article.mappedGuideIds) assert.ok(guideIds.has(id), `${article.slug} points to unknown ${id}`);
  }
});

test('all observed glossary terms have separate facts, satire, and source links', () => {
  assert.equal(glossaryEntries.length, 41);
  assert.equal(glossaryEntries.length, inventory.glossaryTerms.length);
  assert.deepEqual(new Set(glossaryEntries.map((entry) => entry.slug)), new Set(inventory.glossaryTerms.map((entry) => entry.slug)));

  for (const entry of glossaryEntries) {
    assert.ok(entry.factualDefinition.trim(), `${entry.term} needs a factual definition`);
    assert.ok(entry.satiricalAnalogy.trim(), `${entry.term} needs a separately labeled analogy`);
    assert.ok(entry.guideIds.length > 0, `${entry.term} needs a source-book link`);
    for (const id of entry.guideIds) assert.ok(guideIds.has(id), `${entry.term} points to unknown ${id}`);
  }
});
