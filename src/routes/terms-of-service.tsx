import { createFileRoute, Link } from '@tanstack/react-router';

import { PROJECT_GITHUB_ISSUES_URL } from '@/lib/public-discovery';
import { GuideInfoPage, InfoSection } from '@/components/guide-info-page';

function TermsPage() {
  return (
    <GuideInfoPage
      eyebrow="TERMS · LAST REVIEWED 12 OCTOBER 2026"
      title="A reading project, not a life score."
      intro="Using this site means reading an independent work of satire and educational material. The joke is optional; the source facts and their limits are meant to remain clear."
    >
      <InfoSection title="No professional advice">
        <p>
          Nothing on this site is medical, legal, financial, emergency or
          personal-safety advice. When an entry touches those subjects, rely on
          the factual source material and qualified local help where
          appropriate. Do not use a satirical inversion to make a consequential
          decision.
        </p>
      </InfoSection>
      <InfoSection title="Sources and licenses">
        <p>
          Imported guide content is attributed under the license listed on the{' '}
          <Link to="/sources">sources page</Link>. New essays, analogies,
          prompts and interface writing are project-authored. Please follow the
          applicable license for each portion; no broader rights are granted by
          this page.
        </p>
      </InfoSection>
      <InfoSection title="Use of interactive features">
        <p>
          Timers, prompts, quizzes and checklists are optional entertainment
          tools. Their results describe the interaction only. You can stop,
          skip, clear local progress or close the page at any time.
        </p>
      </InfoSection>
      <InfoSection title="Availability and corrections">
        <p>
          This independent project is provided as-is and may change. Source
          editions are pinned where possible. Report corrections through{' '}
          <a href={PROJECT_GITHUB_ISSUES_URL}>the public GitHub issues</a>.
          Review the <Link to="/privacy-policy">privacy page</Link> for local
          storage details.
        </p>
      </InfoSection>
    </GuideInfoPage>
  );
}

export const Route = createFileRoute('/terms-of-service')({
  head: () => ({
    meta: [
      { title: 'Terms | HowToLiveWorse' },
      {
        name: 'description',
        content:
          'Scope, source licenses and limits for this satirical reading project.',
      },
    ],
  }),
  component: TermsPage,
});
