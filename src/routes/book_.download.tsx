import { createFileRoute, Link } from '@tanstack/react-router';

import { GuideInfoPage, InfoSection } from '@/components/guide-info-page';
import { guideManifest } from '@/content/guide/data';

function DownloadPage() {
  return (
    <GuideInfoPage
      eyebrow="OFFLINE READING · SOURCE-LINKED"
      title="Take the whole guide with you."
      intro={`The offline edition follows the pinned ${guideManifest.entryCount}-entry source snapshot. It keeps source and adaptation labels in the files, and it is large enough to deserve a moment to download.`}
    >
      <InfoSection title="Available files">
        <ul className="download-list">
          <li>
            <a href="/downloads/howtoliveworse-guide.md" download>
              Markdown · full guide
            </a>
            <span>
              Readable plain text with original entries, low-ROI reversals and
              source links.
            </span>
          </li>
          <li>
            <a href="/downloads/howtoliveworse-guide.html" download>
              HTML · offline + print to PDF
            </a>
            <span>
              One self-contained file with print styling. Open it locally and
              use your browser’s print dialog to save a PDF.
            </span>
          </li>
          <li>
            <a href="/downloads/howtoliveworse-guide.docx" download>
              Word · DOCX edition
            </a>
            <span>Editable paragraphs, chapter headings and attribution.</span>
          </li>
          <li>
            <a href="/downloads/howtoliveworse-guide.epub" download>
              EPUB · e-reader edition
            </a>
            <span>Chapter navigation for supported e-reader apps.</span>
          </li>
          <li>
            <a href="/downloads/howtoliveworse-guide-anki.tsv" download>
              Anki import · TSV
            </a>
            <span>
              Two-column tab-separated notes; import into Anki as a text file.
            </span>
          </li>
          <li>
            <a href="/downloads/howtoliveworse-guide.json" download>
              JSON · full source records
            </a>
            <span>
              All 675 entries, with original text, English rendering, inversion,
              qualifications and links.
            </span>
          </li>
        </ul>
      </InfoSection>
      <InfoSection title="License and source">
        <p>
          The imported guide content is under the license recorded by its
          authors. Each generated edition includes attribution, the pinned
          commit and a note about the project’s changes. See{' '}
          <Link to="/sources">full source details</Link>.
        </p>
      </InfoSection>
    </GuideInfoPage>
  );
}

export const Route = createFileRoute('/book_/download')({
  head: () => ({
    meta: [
      { title: 'Offline downloads | HowToLiveWorse' },
      {
        name: 'description',
        content:
          'Download the full source-linked guide in Markdown, HTML, Word, EPUB, Anki TSV and JSON.',
      },
    ],
  }),
  component: DownloadPage,
});
