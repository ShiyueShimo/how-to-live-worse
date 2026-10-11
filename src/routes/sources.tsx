import { createFileRoute, Link } from '@tanstack/react-router';

import { GuideInfoPage, InfoSection } from '@/components/guide-info-page';
import { guideManifest } from '@/content/guide/data';

function SourcesPage() {
  const translation = guideManifest.translation;
  return (
    <GuideInfoPage
      eyebrow="SOURCE, METHOD & ATTRIBUTION"
      title="Every detour points back."
      intro="This project keeps the source guide readable beside the satire. The snapshot identifiers below make the imported edition inspectable and reproducible."
    >
      <InfoSection title="Primary guide">
        <p>
          <a href={guideManifest.repositoryUrl}>
            HowToLiveBetter by eternity4719
          </a>
          , pinned at commit <code>{guideManifest.commitSha}</code> and captured
          on {guideManifest.capturedAt}. This edition has{' '}
          {guideManifest.chapterCount} chapters and {guideManifest.entryCount}{' '}
          entries.
        </p>
        <p>
          The upstream content is licensed under{' '}
          <a href={guideManifest.contentLicense.url}>
            {guideManifest.contentLicense.name}
          </a>
          . Original links and evidence notes remain on their entry pages. The
          upstream software license applies to code as stated by that
          repository; the content license is recorded separately.
        </p>
      </InfoSection>
      {translation ? (
        <InfoSection title="English translation source">
          <p>
            <a href={translation.repositoryUrl}>
              The Evidence-Based Life translation by {translation.maintainer}
            </a>
            , pinned at commit <code>{translation.commitSha}</code> and captured
            on {translation.capturedAt}. The snapshot records{' '}
            {translation.reportedEntryCount} translated entries under{' '}
            {translation.license.name}.
          </p>
          <p>
            Where that snapshot has no paired English entry, this site supplies
            a short, reviewed English rendering and labels it as a site
            translation. The original Chinese source stays available beside it.
          </p>
        </InfoSection>
      ) : null}
      <InfoSection title="What this project adds">
        <p>
          The reversals, essays, glossary analogies, prompts and interface text
          are original writing for this project. They are not source quotations.
          Health, legal, emergency, financial and personal-safety items keep a
          factual presentation and a direct route back to the source.
        </p>
        <p>
          The public feature inventory at howtolivebetter.net informed the
          observed feature map and topic coverage. Its prose, artwork, name and
          code are not included here; this is attribution, not a recommendation.
        </p>
      </InfoSection>
      <InfoSection title="Read the full set">
        <p>
          <Link to="/book">Open all 34 chapters</Link>, browse the{' '}
          <Link to="/articles">original essays</Link> or consult the{' '}
          <Link to="/glossary">41-term glossary</Link>.
        </p>
        <p>
          Machine-readable guide: <a href="/llms.txt">llms.txt</a>. Content
          license and detailed change record:{' '}
          <a href="/LICENSE-CONTENT.md">LICENSE-CONTENT.md</a>.
        </p>
      </InfoSection>
    </GuideInfoPage>
  );
}

export const Route = createFileRoute('/sources')({
  head: () => ({
    meta: [
      { title: 'Sources and attribution | HowToLiveWorse' },
      {
        name: 'description',
        content:
          'Pinned source edition, translation attribution, licenses and original adaptations.',
      },
    ],
  }),
  component: SourcesPage,
});
