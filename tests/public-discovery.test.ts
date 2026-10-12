import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  buildRobotsTxt,
  buildSitemapXml,
  PROJECT_GITHUB_ISSUES_URL,
  SOCIAL_IMAGE_PATH,
  SOURCE_GUIDE_URL,
} from '../src/lib/public-discovery';

test('robots.txt allows the public guide and hides leftover SaaS paths', () => {
  const text = buildRobotsTxt('https://how-to-live-worse.vercel.app');
  assert.match(text, /User-agent: \*/);
  assert.match(text, /Allow: \//);
  assert.match(
    text,
    /Sitemap: https:\/\/how-to-live-worse\.vercel\.app\/sitemap\.xml/
  );
  for (const path of [
    '/admin',
    '/settings',
    '/sign-in',
    '/blog',
    '/pricing',
    '/api/',
    '/zh',
  ]) {
    assert.match(
      text,
      new RegExp(`Disallow: ${path.replace('/', '\\/')}`),
      `robots.txt should disallow ${path}`
    );
  }
});

test('sitemap lists source-backed pages and omits play tools and template leftovers', () => {
  const xml = buildSitemapXml('https://example.com', {
    chapters: [{ id: '01', entryIds: ['01-001'] }],
    articleSlugs: ['marriage'],
    glossarySlugs: ['hr'],
  });

  for (const path of [
    'https://example.com/',
    'https://example.com/book',
    'https://example.com/book/01',
    'https://example.com/entry/01-001',
    'https://example.com/articles',
    'https://example.com/articles/marriage',
    'https://example.com/glossary',
    'https://example.com/glossary/hr',
    'https://example.com/about',
    'https://example.com/contact',
    'https://example.com/sources',
    'https://example.com/privacy-policy',
    'https://example.com/terms-of-service',
  ]) {
    assert.ok(
      xml.includes(`<loc>${path}</loc>`),
      `sitemap should include ${path}`
    );
  }

  for (const path of [
    '/pricing',
    '/blog',
    '/admin',
    '/sign-in',
    '/quiz',
    '/bingo',
    '/national-day',
    '/checkup',
    '/zh',
  ]) {
    assert.equal(xml.includes(path), false, `sitemap should omit ${path}`);
  }
});

test('public discovery constants name a real contact channel and attribution targets', () => {
  assert.equal(
    PROJECT_GITHUB_ISSUES_URL,
    'https://github.com/ShiyueShimo/how-to-live-worse/issues'
  );
  assert.equal(
    SOURCE_GUIDE_URL,
    'https://github.com/eternity4719/HowToLiveBetter'
  );
  assert.equal(SOCIAL_IMAGE_PATH, '/images/reading-nook-v2.png');
});
