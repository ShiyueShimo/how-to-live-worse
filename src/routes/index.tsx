import { createFileRoute, Link } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { m } from '@/paraglide/messages.js';
import { getLocale, locales, localizeUrl } from '@/paraglide/runtime.js';
import { GuideShell } from '@/components/guide-shell';
import { guideManifest } from '@/content/guide/data';

function HomePage() {
  return (
    <GuideShell>
      <main>
        <section className="home-hero site-container">
          <div className="home-hero-copy">
            <h1 className="home-title">
              {m['worse.home.titleLead']()}
              <br />
              {m['worse.home.titleMiddle']()}
              <br />
              <span className="home-title-highlight">
                {m['worse.home.titleHighlight']()}
              </span>
              <br />
              {m['worse.home.titleEnd']()}
            </h1>
            <p className="home-lede">{m['worse.home.description']()}</p>
            <div className="home-actions">
              <Link className="button button-dark" to="/checkup">
                {m['worse.home.primary']()}
              </Link>
              <Link className="button button-outline" to="/book">
                {m['worse.home.secondary']()}
              </Link>
            </div>
            <p className="home-count">
              {guideManifest.chapterCount} chapters · {guideManifest.entryCount}{' '}
              paired entries
            </p>
          </div>
          <div className="home-art" aria-hidden="true">
            <img
              className="home-illustration"
              src="/images/reading-nook-v2.png"
              alt=""
              width="1536"
              height="1024"
              fetchPriority="high"
            />
          </div>
        </section>

        <section
          className="home-method site-container"
          id="how-it-works"
          aria-labelledby="home-method-title"
        >
          <h2 id="home-method-title">{m['worse.home.methodTitle']()}</h2>
          <div className="method-list">
            <article className="method-item">
              <span className="method-icon" aria-hidden="true">
                <svg viewBox="0 0 64 64">
                  <path d="M32 18c-7-5-15-5-23-3v31c8-2 16-2 23 3 7-5 15-5 23-3V15c-8-2-16-2-23 3Z" />
                  <path d="M32 18v31M14 23c5-.8 9-.4 13 1M14 31c5-.8 9-.4 13 1M50 23c-5-.8-9-.4-13 1M50 31c-5-.8-9-.4-13 1" />
                </svg>
              </span>
              <span className="method-number">01</span>
              <h3>{m['worse.home.methodSourceTitle']()}</h3>
              <p>{m['worse.home.methodSourceBody']()}</p>
            </article>
            <article className="method-item">
              <span className="method-icon" aria-hidden="true">
                <svg viewBox="0 0 64 64">
                  <path d="M32 52V13M32 22l-17-9v14l17 8M32 39l17-9V44l-17 8" />
                  <path d="m21 20 6 3M43 37l-6 3" />
                </svg>
              </span>
              <span className="method-number">02</span>
              <h3>{m['worse.home.methodExcuseTitle']()}</h3>
              <p>{m['worse.home.methodExcuseBody']()}</p>
            </article>
            <article className="method-item">
              <span className="method-icon" aria-hidden="true">
                <svg viewBox="0 0 64 64">
                  <path d="M15 16h27v34H15zM21 10h27v34M27 5h23v35" />
                  <circle cx="43" cy="43" r="8" />
                  <path d="m49 49 8 8M21 25h15M21 32h12" />
                </svg>
              </span>
              <span className="method-number">03</span>
              <h3>{m['worse.home.methodEvidenceTitle']()}</h3>
              <p>{m['worse.home.methodEvidenceBody']()}</p>
            </article>
          </div>
        </section>

        <section className="home-play-band" id="play">
          <div className="home-coast-art" aria-hidden="true">
            <img
              src="/images/guide-coast.png"
              alt=""
              width="2048"
              height="683"
              loading="lazy"
            />
          </div>
          <div className="play-band-inner">
            <h2>{m['worse.home.panelTitle']()}</h2>
            <p>{m['worse.home.panelBody']()}</p>
            <Link className="button button-primary" to="/book">
              {m['worse.home.panelLink']()}
              <svg aria-hidden="true" viewBox="0 0 20 20">
                <path d="M3 10h13M10 4l6 6-6 6" />
              </svg>
            </Link>
          </div>
        </section>

        <section
          className="home-tools site-container"
          aria-labelledby="home-tools-title"
        >
          <div className="results-heading">
            <div>
              <p className="site-overline">PLAY · PAUSE · LEAVE ANYTIME</p>
              <h2 id="home-tools-title">Pick a small side quest.</h2>
            </div>
            <p>
              Everything below works without an account. Local progress can be
              cleared at any time.
            </p>
          </div>
          <div className="home-tool-list">
            {[
              {
                title: 'The five-question route',
                description:
                  'Pick familiar detours; get ten source-linked reads.',
                to: '/checkup',
              },
              {
                title: 'Today’s tiny card',
                description: 'One of 30 reversible prompts with an exit hatch.',
                to: '/daily',
              },
              {
                title: 'Spot the excuse',
                description:
                  'A balanced 20-question round drawn from 60 originals.',
                to: '/quiz',
              },
              {
                title: 'Unranked 50',
                description:
                  'Draw a rotating sample from all low-risk entries.',
                to: '/top-50',
              },
              {
                title: 'Low-ROI bingo',
                description: 'A local board you can swap, mark or share.',
                to: '/bingo',
              },
              {
                title: 'Try the experiment lab',
                description: 'A small absurdity, never an assignment.',
                to: '/lab',
              },
              {
                title: 'Focus timer',
                description: 'A very clear pause button; no streaks.',
                to: '/focus',
              },
              {
                title: 'Plan overhead',
                description: 'A tiny calculator for planning versus doing.',
                to: '/value',
              },
            ].map((tool, index) => (
              <Link className="home-tool-card" key={tool.to} to={tool.to}>
                <span className="tool-number">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="tool-copy">
                  <strong>{tool.title}</strong>
                  <span>{tool.description}</span>
                </span>
                <svg aria-hidden="true" viewBox="0 0 20 20">
                  <path d="M3 10h13M10 4l6 6-6 6" />
                </svg>
              </Link>
            ))}
          </div>
          <p className="reference-note">
            Find or save source entries in{' '}
            <Link to="/book">the complete guide</Link>. View local notes on{' '}
            <Link to="/dashboard">your list</Link>; read original writing in{' '}
            <Link to="/articles">the essay library</Link> and{' '}
            <Link to="/glossary">glossary</Link>.
          </p>
        </section>
      </main>
    </GuideShell>
  );
}

export const Route = createFileRoute('/')({
  head: () => {
    const locale = getLocale();
    const canonical = (targetLocale: (typeof locales)[number]) =>
      localizeUrl(`${envConfigs.app_url.replace(/\/$/, '')}/`, {
        locale: targetLocale,
      }).href;
    return {
      meta: [
        { title: m['common.metadata.title']({}, { locale }) },
        {
          name: 'description',
          content: m['common.metadata.description']({}, { locale }),
        },
      ],
      links: [
        { rel: 'canonical', href: canonical(locale) },
        ...locales.map((targetLocale) => ({
          rel: 'alternate',
          hrefLang: targetLocale,
          href: canonical(targetLocale),
        })),
        { rel: 'alternate', hrefLang: 'x-default', href: canonical('en') },
      ],
    };
  },
  component: HomePage,
});
