import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { test } from 'node:test';
import { setTimeout as delay } from 'node:timers/promises';

const projectRoot = process.cwd();

async function reserveLocalPort() {
  const listener = createServer();
  listener.listen(0, '127.0.0.1');
  await new Promise((resolve, reject) => {
    listener.once('listening', resolve);
    listener.once('error', reject);
  });
  const address = listener.address();
  if (!address || typeof address === 'string') {
    throw new Error('Could not reserve a local HTTP port.');
  }
  await new Promise((resolve, reject) => {
    listener.close((error) => (error ? reject(error) : resolve()));
  });
  return address.port;
}

test(
  'home renders the guide brand without database, auth, or analytics configuration',
  { timeout: 90_000 },
  async () => {
    const port = await reserveLocalPort();
    const cleanEnvironment = { ...process.env };
    for (const key of Object.keys(cleanEnvironment)) {
      if (
        /^(DATABASE|AUTH_|VITE_APP_|VITE_.*(ANALYTICS|ADS|CRISP|TAWK))/i.test(
          key
        )
      ) {
        delete cleanEnvironment[key];
      }
    }
    const server = spawn(
      process.execPath,
      [
        'node_modules/vite/bin/vite.js',
        'dev',
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--strictPort',
      ],
      {
        cwd: projectRoot,
        env: cleanEnvironment,
        stdio: ['ignore', 'pipe', 'pipe'],
      }
    );
    let serverOutput = '';
    let spawnError;
    let lastFetchError;
    server.once('error', (error) => (spawnError = error));
    server.stdout
      .setEncoding('utf8')
      .on('data', (chunk) => (serverOutput += chunk));
    server.stderr
      .setEncoding('utf8')
      .on('data', (chunk) => (serverOutput += chunk));

    try {
      let response;
      for (let attempt = 0; attempt < 300; attempt += 1) {
        if (spawnError) {
          throw new Error('Could not launch Vite: ' + spawnError.message);
        }
        if (server.exitCode !== null) {
          throw new Error(
            'Vite exited before serving the home page:\n' + serverOutput
          );
        }
        try {
          response = await fetch('http://127.0.0.1:' + port + '/', {
            signal: AbortSignal.timeout(700),
          });
          break;
        } catch (error) {
          lastFetchError = error;
          await delay(200);
        }
      }
      assert.ok(
        response,
        'Vite did not answer the smoke request: ' +
          lastFetchError +
          '\n' +
          serverOutput
      );
      const html = await response.text();
      assert.equal(
        response.status,
        200,
        'Home request failed:\n' + html + '\n' + serverOutput
      );
      assert.match(html, /HowToLiveWorse/i);
      assert.match(html, /CC BY 4.0/);
      assert.match(html, /eternity4719/);
      assert.match(html, /og:image/);
      assert.match(html, /reading-nook-v2\.png/);
      assert.doesNotMatch(html, /hrefLang":"zh"|hreflang="zh"|\/zh"/i);
      assert.doesNotMatch(
        html,
        /生财有术|ShipAny|pagead2\.googlesyndication\.com|googletagmanager|plausible\.io|client\.crisp\.chat|tawk\.to/i
      );

      for (const route of [
        { path: '/book', expected: /675/ },
        {
          path: '/book/01',
          expected: /01-001/,
          expectedHeading: 'Avoiding Premature Death',
        },
        { path: '/entry/01-001', expected: /seat belts/i },
        { path: '/articles', expected: /10 original counter-essays/i },
        {
          path: '/articles/marriage',
          expected: /quarterly business review/i,
          expectedHeading:
            'Turn a relationship into a quarterly business review',
        },
        { path: '/glossary', expected: /41 terms/i },
        {
          path: '/glossary/hr',
          expected: /Hazard ratio/i,
          expectedHeading: 'HR',
        },
        { path: '/checkup', expected: /5 QUESTIONS/ },
        { path: '/top-50', expected: /unranked shortlist/i },
        { path: '/quiz', expected: /Can you spot the excuse/i },
        { path: '/daily', expected: /tiny low-ROI detour/i },
        { path: '/bingo', expected: /Low-ROI bingo/i },
        { path: '/dashboard', expected: /Your list of familiar detours/i },
        { path: '/focus', expected: /clear off switch/i },
        { path: '/value', expected: /How much of the plan is planning/i },
        { path: '/lab', expected: /reversible experiment lab/i },
        { path: '/book/download', expected: /Take the whole guide with you/i },
        { path: '/about', expected: /A mirror with the facts left in/i },
        { path: '/sources', expected: /Every detour points back/i },
        {
          path: '/contact',
          expected: /github.com\/ShiyueShimo\/how-to-live-worse/i,
        },
        {
          path: '/privacy-policy',
          expected: /hosted on Vercel/i,
        },
        {
          path: '/terms-of-service',
          expected: /A reading project, not a life score/i,
        },
        { path: '/changelog', expected: /What changed in this edition/i },
        {
          path: '/national-day',
          expected: /day off that became a planning project/i,
        },
      ]) {
        const routeResponse = await fetch(
          `http://127.0.0.1:${port}${route.path}`
        );
        const routeHtml = await routeResponse.text();
        assert.equal(
          routeResponse.status,
          200,
          `${route.path} should render.\n${routeHtml}`
        );
        assert.match(routeHtml, /HowToLiveWorse/i);
        assert.match(routeHtml, route.expected);
        if (route.expectedHeading) {
          const renderedHeading = routeHtml
            .match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]
            ?.replace(/<[^>]*>/g, '')
            .trim();
          assert.equal(
            renderedHeading,
            route.expectedHeading,
            `${route.path} should render its own detail heading.`
          );
        }
      }

      const missingResponse = await fetch(
        `http://127.0.0.1:${port}/entry/99-999`
      );
      assert.equal(
        missingResponse.status,
        404,
        'Unknown guide IDs should use the not-found route.'
      );

      for (const path of [
        '/articles/missing-essay',
        '/glossary/missing-term',
      ]) {
        const response = await fetch(`http://127.0.0.1:${port}${path}`);
        assert.equal(
          response.status,
          404,
          `${path} should use the not-found route.`
        );
      }

      for (const path of [
        '/pricing',
        '/sign-in',
        '/admin',
        '/settings',
        '/blog',
        '/api/auth',
      ]) {
        const response = await fetch(`http://127.0.0.1:${port}${path}`);
        assert.equal(
          response.status,
          404,
          `${path} should not expose a ShipAny SaaS page or endpoint.`
        );
      }

      const catalogResponse = await fetch(
        `http://127.0.0.1:${port}/data/guide-catalog.json`
      );
      assert.equal(
        catalogResponse.status,
        200,
        'The full-text index should be served as static JSON.'
      );
      assert.equal(
        (await catalogResponse.json()).length,
        675,
        'The on-demand index should contain every source entry.'
      );

      const attributionResponse = await fetch(
        `http://127.0.0.1:${port}/LICENSE-CONTENT.md`
      );
      assert.equal(
        attributionResponse.status,
        200,
        'The public attribution statement should be accessible.'
      );
      assert.match(await attributionResponse.text(), /CC BY 4.0/);

      const llmsResponse = await fetch(`http://127.0.0.1:${port}/llms.txt`);
      assert.equal(
        llmsResponse.status,
        200,
        'The machine-readable site index should render.'
      );
      assert.match(await llmsResponse.text(), /675 entries/);

      const fullIndexResponse = await fetch(
        `http://127.0.0.1:${port}/llms-full.txt`
      );
      assert.equal(
        fullIndexResponse.status,
        200,
        'The complete machine-readable guide should be available.'
      );
      const fullIndexReader = fullIndexResponse.body.getReader();
      const fullIndexChunk = await fullIndexReader.read();
      assert.ok(fullIndexChunk.value?.byteLength);
      await fullIndexReader.cancel();

      const skillResponse = await fetch(
        `http://127.0.0.1:${port}/howtoliveworse-skill.md`
      );
      assert.equal(
        skillResponse.status,
        200,
        'The site reader skill should be downloadable.'
      );
      assert.match(
        await skillResponse.text(),
        /Never present the inversion as advice/
      );

      const robotsResponse = await fetch(`http://127.0.0.1:${port}/robots.txt`);
      const robotsText = await robotsResponse.text();
      assert.equal(robotsResponse.status, 200);
      assert.match(robotsText, /Sitemap: .*\/sitemap\.xml/);
      assert.match(robotsText, /Disallow: \/admin/);
      assert.match(robotsText, /Disallow: \/zh/);

      const sitemapResponse = await fetch(
        `http://127.0.0.1:${port}/sitemap.xml`
      );
      const sitemapXml = await sitemapResponse.text();
      assert.equal(sitemapResponse.status, 200);
      for (const path of [
        '/book',
        '/book/download',
        '/sources',
        '/privacy-policy',
      ]) {
        assert.ok(
          sitemapXml.includes(path),
          `The sitemap should include ${path}.`
        );
      }
      for (const path of [
        '/quiz',
        '/bingo',
        '/national-day',
        '/pricing',
        '/blog',
      ]) {
        assert.equal(
          sitemapXml.includes(path),
          false,
          `The sitemap should omit ${path}.`
        );
      }

      for (const filename of [
        'howtoliveworse-guide.md',
        'howtoliveworse-guide.html',
        'howtoliveworse-guide.docx',
        'howtoliveworse-guide.epub',
        'howtoliveworse-guide-anki.tsv',
        'howtoliveworse-guide.json',
      ]) {
        const downloadResponse = await fetch(
          `http://127.0.0.1:${port}/downloads/${filename}`
        );
        assert.equal(
          downloadResponse.status,
          200,
          `${filename} should be downloadable.`
        );
        const reader = downloadResponse.body.getReader();
        const firstChunk = await reader.read();
        assert.ok(
          firstChunk.value?.byteLength,
          `${filename} should not be empty.`
        );
        await reader.cancel();
      }
    } finally {
      if (server.exitCode === null) {
        server.kill('SIGTERM');
      }
    }
  }
);
