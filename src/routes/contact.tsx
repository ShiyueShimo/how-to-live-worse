import { createFileRoute, Link } from '@tanstack/react-router';

import { GuideInfoPage, InfoSection } from '@/components/guide-info-page';

function ContactPage() {
  return (
    <GuideInfoPage
      eyebrow="CONTACT & CORRECTIONS"
      title="Point out a broken link or a bad joke."
      intro="This local-first prototype has no inbox or message form configured, so it will not invite you to submit private details into an unmonitored form."
    >
      <InfoSection title="For source corrections">
        <p>
          Every entry links to its upstream chapter and cited material. Start
          with the <Link to="/sources">source record</Link> and the original
          repository. This site is independent, so a correction here may need to
          be applied separately.
        </p>
      </InfoSection>
      <InfoSection title="For this project">
        <p>
          A public project email or issue tracker can be added when the owner
          chooses one. Until then, no contact address is fabricated and no
          personal or medical information should be sent through the
          browser-only tools.
        </p>
      </InfoSection>
    </GuideInfoPage>
  );
}

export const Route = createFileRoute('/contact')({
  head: () => ({
    meta: [
      { title: 'Contact | HowToLiveWorse' },
      {
        name: 'description',
        content:
          'How to check source links and why this prototype does not collect contact messages.',
      },
    ],
  }),
  component: ContactPage,
});
