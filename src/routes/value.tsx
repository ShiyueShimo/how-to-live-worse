import { useMemo, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';

import { GuideInfoPage, InfoSection } from '@/components/guide-info-page';

function ValuePage() {
  const [planningMinutes, setPlanningMinutes] = useState(30);
  const [doingMinutes, setDoingMinutes] = useState(60);
  const overhead = useMemo(
    () =>
      planningMinutes + doingMinutes === 0
        ? 0
        : Math.round(
            (planningMinutes / (planningMinutes + doingMinutes)) * 100
          ),
    [doingMinutes, planningMinutes]
  );

  return (
    <GuideInfoPage
      eyebrow="A VERY SMALL TIME CALCULATOR"
      title="How much of the plan is planning?"
      intro="Compare time spent organizing one ordinary task with time spent doing it. It is a toy calculation, not a productivity score or a prompt to optimize your day."
    >
      <InfoSection title="Enter two rough estimates">
        <div className="tool-card value-calculator">
          <label className="filter-field">
            <span>Minutes spent planning or reorganizing</span>
            <input
              type="number"
              min="0"
              max="10000"
              value={planningMinutes}
              onChange={(event) =>
                setPlanningMinutes(
                  Math.max(0, Number(event.currentTarget.value) || 0)
                )
              }
            />
          </label>
          <label className="filter-field">
            <span>Minutes spent on the task itself</span>
            <input
              type="number"
              min="0"
              max="10000"
              value={doingMinutes}
              onChange={(event) =>
                setDoingMinutes(
                  Math.max(0, Number(event.currentTarget.value) || 0)
                )
              }
            />
          </label>
          <div className="value-result" aria-live="polite">
            <strong>{overhead}%</strong>
            <span>of these combined minutes went to planning.</span>
          </div>
          <p>
            You can close the calculator without changing anything. The numbers
            remain on this page only and are not saved.
          </p>
        </div>
      </InfoSection>
      <InfoSection title="What this number means">
        <p>
          Only the ratio you entered. It says nothing about whether planning was
          useful, whether the task mattered, or how you should spend your time.
          Sometimes planning prevents mistakes; sometimes the list becomes the
          hobby.
        </p>
      </InfoSection>
    </GuideInfoPage>
  );
}

export const Route = createFileRoute('/value')({
  head: () => ({
    meta: [
      { title: 'Plan overhead calculator | HowToLiveWorse' },
      {
        name: 'description',
        content: 'A local-only, playful ratio of planning time to doing time.',
      },
    ],
  }),
  component: ValuePage,
});
