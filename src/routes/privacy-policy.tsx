import { createFileRoute, Link } from '@tanstack/react-router';

import { GuideInfoPage, InfoSection } from '@/components/guide-info-page';

function PrivacyPage() {
  return (
    <GuideInfoPage
      eyebrow="PRIVACY · LAST REVIEWED 9 OCTOBER 2026"
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
      <InfoSection title="Language preference and hosting">
        <p>
          The template’s language runtime may store a locale preference in a
          cookie. Your web host and network provider may receive ordinary
          connection data needed to deliver a page, such as an IP address,
          requested URL and user-agent. Their retention and processing depend on
          the deployment provider’s configuration.
        </p>
      </InfoSection>
      <InfoSection title="No form, account or analytics promise">
        <p>
          This public prototype has no contact form or account workflow on its
          guide pages. No analytics component is mounted by the public page
          shell in this copy. If a future deployment adds hosting analytics,
          contact forms or third-party embeds, this notice must be updated to
          name them.
        </p>
      </InfoSection>
      <InfoSection title="Sensitive information">
        <p>
          Do not put health, legal, financial or other sensitive information in
          a private note if someone else can use this browser profile. Notes are
          not encrypted and anyone with local access to the browser profile may
          be able to read them.
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
          'How local guide notes, preferences and ordinary hosting data are handled.',
      },
    ],
  }),
  component: PrivacyPage,
});
