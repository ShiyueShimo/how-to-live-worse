import { createFileRoute } from '@tanstack/react-router';

import { GuideInfoPage, InfoSection } from '@/components/guide-info-page';
import { guideManifest } from '@/content/guide/data';
import inventory from '@/content/reference-site/inventory.json';

function ChangelogPage() {
  return (
    <GuideInfoPage
      eyebrow="PROJECT NOTES · 9 OCTOBER 2026"
      title="What changed in this edition."
      intro="A small, inspectable record of the snapshot and the work built around it. Counts describe the source files captured for this project, not a live upstream total."
    >
      <InfoSection title="9 October 2026 · Full guide imported">
        <p>
          Pinned {guideManifest.chapterCount} chapters and{' '}
          {guideManifest.entryCount} source entries at{' '}
          <code>{guideManifest.commitSha}</code>. Added an original reversal
          alongside each item and kept the original text, evidence grade,
          applicability and links available.
        </p>
      </InfoSection>
      <InfoSection title="9 October 2026 · Coverage inventory">
        <p>
          Recorded {inventory.articles.length} visible article topics and{' '}
          {inventory.glossaryTerms.length} glossary terms from the reference
          site. Its machine-readable index reported{' '}
          {inventory.articleCountInMachineIndex} articles at capture time, while
          the page displayed {inventory.articles.length}; this project uses the
          visible page inventory and writes its own text.
        </p>
      </InfoSection>
      <InfoSection title="9 October 2026 · Play and local tools">
        <p>
          Added five-question reading routes, balanced quiz rounds, daily
          prompts, bingo, a local list, export controls and optional focus
          tools. Share payloads exclude notes and personal answers.
        </p>
      </InfoSection>
    </GuideInfoPage>
  );
}

export const Route = createFileRoute('/changelog')({
  head: () => ({
    meta: [
      { title: 'Changelog | HowToLiveWorse' },
      {
        name: 'description',
        content:
          'Pinned guide snapshot, reference inventory and project feature history.',
      },
    ],
  }),
  component: ChangelogPage,
});
