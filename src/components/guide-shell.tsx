import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { SOURCE_GUIDE_URL, SOURCE_LICENSE_URL } from '@/lib/public-discovery';
import { m } from '@/paraglide/messages.js';
import { localizeHref } from '@/paraglide/runtime.js';

type GuideShellProps = { children: ReactNode; active?: string };

export function GuideShell({ children, active }: GuideShellProps) {
  const navigation = [
    { label: m['worse.nav.guides'](), href: '/book', key: 'book' },
    { label: m['worse.nav.stories'](), href: '/articles', key: 'articles' },
    { label: 'Glossary', href: '/glossary', key: 'glossary' },
    { label: m['worse.nav.play'](), href: '/bingo', key: 'play' },
    { label: m['worse.nav.myList'](), href: '/dashboard', key: 'list' },
  ];

  return (
    <div className="site-shell">
      <header className="site-header">
        <Link className="site-wordmark" to="/">
          {m['worse.brand']()}
        </Link>
        <nav className="site-nav" aria-label={m['worse.nav.label']()}>
          {navigation.map((item) => (
            <a
              key={item.key}
              href={localizeHref(item.href)}
              aria-current={active === item.key ? 'page' : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      {children}

      <footer className="site-footer site-container">
        <Link className="site-wordmark" to="/">
          {envConfigs.app_name}
        </Link>
        <div className="footer-copy">
          <p>{m['worse.disclaimer']()}</p>
          <p className="footer-attribution">
            Adapted from{' '}
            <a href={SOURCE_GUIDE_URL}>HowToLiveBetter by eternity4719</a> under{' '}
            <a href={SOURCE_LICENSE_URL}>CC BY 4.0</a>. See{' '}
            <a href={localizeHref('/sources')}>sources</a>.
          </p>
          <nav aria-label="Site pages">
            {[
              ['Glossary', '/glossary'],
              ['Daily card', '/daily'],
              ['Checkup', '/checkup'],
              ['Quiz', '/quiz'],
              ['Rotating 50', '/top-50'],
              ['Focus timer', '/focus'],
              ['Value tool', '/value'],
              ['Experiment lab', '/lab'],
              ['Downloads', '/book/download'],
              ['Changelog', '/changelog'],
              ['About', '/about'],
              ['Contact', '/contact'],
              ['Privacy', '/privacy-policy'],
              ['Terms', '/terms-of-service'],
              ['Sources', '/sources'],
            ].map(([label, href]) => (
              <a key={href} href={localizeHref(href)}>
                {label}
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
