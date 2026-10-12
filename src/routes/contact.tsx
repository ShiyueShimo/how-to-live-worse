import { createFileRoute, Link } from '@tanstack/react-router';

import {
  PROJECT_GITHUB_ISSUES_URL,
  PROJECT_GITHUB_URL,
} from '@/lib/public-discovery';
import { GuideInfoPage, InfoSection } from '@/components/guide-info-page';

function ContactPage() {
  return (
    <GuideInfoPage
      eyebrow="CONTACT & CORRECTIONS"
      title="Point out a broken link or a bad joke."
      intro="Corrections, license questions, and complaints about a satirical line belong in a public issue. This site does not collect private messages through a form."
    >
      <InfoSection title="For this project">
        <p>
          Open an issue on{' '}
          <a href={PROJECT_GITHUB_ISSUES_URL}>
            github.com/ShiyueShimo/how-to-live-worse
          </a>
          . The repository is {PROJECT_GITHUB_URL.replace('https://', '')}. Do
          not send health, legal, or other sensitive personal details through
          GitHub.
        </p>
      </InfoSection>
      <InfoSection title="For source corrections">
        <p>
          Every entry links to its upstream chapter and cited material. Start
          with the <Link to="/sources">source record</Link> and the original
          repository. This site is independent, so a correction here may need to
          be applied separately.
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
          'How to report a source error or a problem with this independent satire.',
      },
    ],
  }),
  component: ContactPage,
});
