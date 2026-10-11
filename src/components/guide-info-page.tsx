import type { ReactNode } from 'react';

import { GuideShell } from '@/components/guide-shell';

export function GuideInfoPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <GuideShell>
      <main className="article-page site-container info-page">
        <p className="site-overline">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="library-intro">{intro}</p>
        <div className="info-page-content">{children}</div>
      </main>
    </GuideShell>
  );
}

export function InfoSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="info-section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}
