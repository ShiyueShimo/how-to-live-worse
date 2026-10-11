/// <reference types="vite/client" />
import type { ReactNode } from 'react';
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
  type ErrorComponentProps,
} from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { getLocale, locales, localizeHref, localizeUrl } from '@/paraglide/runtime.js';

import '@fontsource-variable/inter';
import '@fontsource/libre-baskerville/400.css';
import '@fontsource/libre-baskerville/700.css';
import '@fontsource/libre-baskerville/400-italic.css';
import '@/styles/globals.css';

export const Route = createRootRoute({
  head: () => {
    const appUrl =
      (typeof window !== 'undefined' && window.location?.origin) ||
      envConfigs.app_url;

    return {
      meta: [
        { charSet: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { title: envConfigs.app_name },
        { name: 'description', content: envConfigs.app_description },
      ],
      links: [
        { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
        { rel: 'apple-touch-icon', href: '/favicon.svg' },
        ...locales.map((locale) => ({
          rel: 'alternate',
          hrefLang: locale,
          href: localizeUrl(appUrl + '/', { locale }).href,
        })),
      ],
    };
  },
  component: RootComponent,
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
  errorComponent: RootError,
});

function RootComponent() {
  return <Outlet />;
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang={getLocale()} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="font-sans antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function NotFound() {
  return (
    <main className="site-not-found">
      <p className="site-overline">404</p>
      <h1>Page not found</h1>
      <a href={localizeHref('/')}>Return to the guide</a>
    </main>
  );
}

function RootError({ error, reset }: ErrorComponentProps) {
  return (
    <main className="site-not-found">
      <p className="site-overline">Something went wrong</p>
      <h1>The page needs another try.</h1>
      {import.meta.env.DEV && error instanceof Error ? (
        <pre>{error.message}</pre>
      ) : null}
      <button type="button" onClick={reset}>
        Reload this page
      </button>
    </main>
  );
}
