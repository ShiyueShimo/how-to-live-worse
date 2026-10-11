import { createFileRoute, Link } from '@tanstack/react-router';

import { GuideInfoPage, InfoSection } from '@/components/guide-info-page';

function AboutPage() {
  return (
    <GuideInfoPage
      eyebrow="ABOUT THIS INDEPENDENT PROJECT"
      title="A mirror with the facts left in."
      intro="HowToLiveWorse is a playful reading companion to a public, evidence-oriented life guide. It turns familiar procrastination into satire while keeping the source advice, caveats and links in view."
    >
      <InfoSection title="The point is the detour, not the person.">
        <p>
          Each entry pairs the original recommendation with an original,
          deliberately low-return rationalization. The joke is about the small
          excuses people recognize, not about illness, poverty, disability,
          danger or anyone’s character.
        </p>
      </InfoSection>
      <InfoSection title="The complete source stays available.">
        <p>
          The current pinned edition contains 675 entries across 34 chapters.
          Browse every item in the <Link to="/book">complete guide</Link>, or
          see the <Link to="/sources">source and attribution record</Link>.
        </p>
      </InfoSection>
      <InfoSection title="Keep the serious parts serious.">
        <p>
          Health, emergency, legal, financial and personal-safety material is
          presented factually. Satirical lines do not replace the original
          advice or evidence. This site is entertainment and reading material,
          not a diagnosis or personal recommendation.
        </p>
      </InfoSection>
      <InfoSection title="Independent and unofficial.">
        <p>
          This project is not affiliated with the upstream guide’s author or
          with the separate reference website. It uses the upstream guide under
          its stated content license and links back to the original sources.
        </p>
      </InfoSection>
    </GuideInfoPage>
  );
}

export const Route = createFileRoute('/about')({
  head: () => ({
    meta: [
      { title: 'About | HowToLiveWorse' },
      {
        name: 'description',
        content:
          'How this independent satire preserves the source guide, evidence and safety boundaries.',
      },
    ],
  }),
  component: AboutPage,
});
