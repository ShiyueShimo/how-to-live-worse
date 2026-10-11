import { useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';

import { GuideInfoPage, InfoSection } from '@/components/guide-info-page';
import { dailyPrompts } from '@/content/play/daily-prompts';

function LabPage() {
  const [draw, setDraw] = useState(0);
  const prompt = dailyPrompts[(draw * 7 + 3) % dailyPrompts.length];

  return (
    <GuideInfoPage
      eyebrow="THE REVERSIBLE EXPERIMENT LAB"
      title="Try one tiny detour. Or close the lab."
      intro="These prompts are deliberately low-stakes, reversible and easy to skip. They are writing experiments, not assignments or challenges."
    >
      <InfoSection
        title={`Card ${String((draw % dailyPrompts.length) + 1).padStart(2, '0')} of ${dailyPrompts.length}`}
      >
        <div className="daily-prompt-card">
          <p className="site-overline">{prompt.id.toUpperCase()} · NO SCORE</p>
          <h2>{prompt.prompt}</h2>
          <p>{prompt.exitHatch}</p>
          <Link
            className="text-link"
            to="/entry/$entryId"
            params={{ entryId: prompt.guideId }}
          >
            Read the linked source →
          </Link>
          <div className="home-actions">
            <button
              className="button button-dark"
              type="button"
              onClick={() => setDraw((current) => current + 1)}
            >
              Try another card
            </button>
            <Link className="button button-outline" to="/daily">
              Open today’s card
            </Link>
          </div>
        </div>
      </InfoSection>
      <InfoSection title="Rules of this lab">
        <p>
          No purchases, public posts, risky behavior or personal disclosure.
          Every experiment has an exit hatch. The sample is selected in this
          browser session and is not tracked.
        </p>
      </InfoSection>
    </GuideInfoPage>
  );
}

export const Route = createFileRoute('/lab')({
  head: () => ({
    meta: [
      { title: 'Reversible experiment lab | HowToLiveWorse' },
      {
        name: 'description',
        content: 'Draw an original, low-stakes prompt with a clear exit hatch.',
      },
    ],
  }),
  component: LabPage,
});
