import assert from 'node:assert/strict';
import { test } from 'node:test';
import catalogJson from '../src/content/guide/catalog.json';
import { createGuideSearch } from '../src/content/guide/catalog';
import type { GuideSearchRecord } from '../src/content/guide/types';

const catalogRecords = catalogJson as GuideSearchRecord[];
const { resolveGuideReference, searchGuideRecords } = createGuideSearch(catalogRecords);

test('intersects query, chapter, evidence, resource, and cost filters', () => {
  const results = searchGuideRecords({
    query: 'seat belts, both front and back',
    chapterId: '01',
    evidenceGrade: 'A',
    resource: 'lifespan',
    cost: 'time',
  });

  assert.deepEqual(results.map((record) => record.id), ['01-001']);
});

test('normalizes case and full-width Unicode characters for search', () => {
  const results = searchGuideRecords({ query: 'ＳＥＡＴ　ＢＥＬＴＳ' });

  assert.ok(results.some((record) => record.id === '01-001'));
  assert.ok(searchGuideRecords({ query: '安全带' }).some((record) => record.id === '01-001'));
});

test('reports an unresolved cross-reference without fabricating a record', () => {
  assert.equal(resolveGuideReference('99-999', {}), undefined);
});

test('resolves a cross-reference hidden by active filters and marks them for clearing', () => {
  const resolved = resolveGuideReference('01-001', { chapterId: '99', query: 'no matching entry' });

  assert.equal(resolved?.record.id, '01-001');
  assert.equal(resolved?.filtersCleared, true);
});

test('safe-only searches exclude health, legal, crisis, and other sensitive entries', () => {
  const results = searchGuideRecords({ safeOnly: true });

  assert.ok(results.length > 0);
  assert.ok(results.every((record) => record.riskClass === 'low'));
  assert.ok(catalogRecords.some((record) => record.riskClass !== 'low'));
});
