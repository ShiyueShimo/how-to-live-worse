import { createFileRoute, Link } from '@tanstack/react-router';

import { GuideInfoPage, InfoSection } from '@/components/guide-info-page';

function PrivacyPage() {
  return (
    <GuideInfoPage
      eyebrow="PRIVACY · LAST REVIEWED 12 OCTOBER 2026"
      title="Your notes stay in your browser."
      intro="The public guide does not ask for an account. Features that save a checklist, favorites, notes, daily marks or a bingo board use this browser’s local storage."
    >
      <InfoSection title="Local features">
        <p>
          Saved statuses, favorites, notes and game progress are stored under
          one site-specific browser key. They are not uploaded by those
          features. You can export them from{' '}
          <Link to="/dashboard">your list</Link> or clear them there. Clearing
          site data in your browser also removes them.
        </p>
        <p>
          Quiz and bingo share links contain only the result fields or board IDs
          shown on their pages. A shared link can be seen by anyone you send it
          to; private notes and quiz answers are excluded.
        </p>
      </InfoSection>
      <InfoSection title="Hosting">
        <p>
          The public site is hosted on Vercel. Vercel and the network path to it
          receive ordinary connection data needed to deliver a page, such as an
          IP address, requested URL, user-agent, and basic logs. Retention
          follows that host’s configuration.
        </p>
      </InfoSection>
      <InfoSection title="Cookies and analytics">
        <p>
          The public guide does not set an analytics, advertising, or account
          cookie. If a future deployment turns on hosting analytics, a cookie
          banner, or third-party embeds through admin settings, this notice will
          name them. Until then, no such scripts are mounted from stored
          settings.
        </p>
      </InfoSection>
      <InfoSection title="Sensitive information">
        <p>
          Do not put health, legal, financial or other sensitive information in
          a private note if someone else can use this browser profile. Notes are
          not encrypted and anyone with local access to the browser profile may
          be able to read them. Do not send that material through GitHub issues
          either.
        </p>
      </InfoSection>
    </GuideInfoPage>
  );
}

export const Route = createFileRoute('/privacy-policy')({
  head: () => ({
    meta: [
      { title: 'Privacy | HowToLiveWorse' },
      {
        name: 'description',
        content:
          'How local guide notes and ordinary Vercel hosting data are handled.',
      },
    ],
  }),
  component: PrivacyPage,
});
